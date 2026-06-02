// MIDI Engine — Parse and export MIDI files
import { nameToMidi, midiToName, DURATIONS } from "./theory";

// Parse a MIDI file (ArrayBuffer) into our internal composition model
export function parseMidiFile(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let offset = 0;

  // Read header
  const headerType = readString(bytes, offset, 4);
  offset += 4;
  if (headerType !== "MThd") {
    throw new Error("Not a valid MIDI file");
  }

  const headerLength = readUint32(bytes, offset);
  offset += 4;
  const format = readUint16(bytes, offset);
  offset += 2;
  const numTracks = readUint16(bytes, offset);
  offset += 2;
  const division = readUint16(bytes, offset);
  offset += 2;

  // We'll read all tracks and merge
  const allEvents = [];

  for (let t = 0; t < numTracks; t++) {
    const trackType = readString(bytes, offset, 4);
    offset += 4;
    if (trackType !== "MTrk") {
      throw new Error("Invalid track header");
    }
    const trackLength = readUint32(bytes, offset);
    offset += 4;
    const trackEnd = offset + trackLength;

    let deltaTime = 0;
    let runningStatus = 0;

    while (offset < trackEnd) {
      deltaTime += readVarLen(bytes, offset);
      const deltaOffset = varLenLength(bytes, offset);
      offset += deltaOffset;

      let status = bytes[offset];
      if (status < 0x80) {
        // Running status
        status = runningStatus;
      } else {
        offset++;
        runningStatus = status;
      }

      const msgType = status & 0xf0;
      const channel = status & 0x0f;

      if (msgType === 0x90) {
        // Note On
        const note = bytes[offset++];
        const velocity = bytes[offset++];
        if (velocity > 0) {
          allEvents.push({
            tick: deltaTime,
            type: "noteOn",
            note,
            velocity,
            channel,
          });
        } else {
          // Note On with velocity 0 = Note Off
          allEvents.push({
            tick: deltaTime,
            type: "noteOff",
            note,
            channel,
          });
        }
      } else if (msgType === 0x80) {
        // Note Off
        const note = bytes[offset++];
        const velocity = bytes[offset++];
        allEvents.push({
          tick: deltaTime,
          type: "noteOff",
          note,
          channel,
        });
      } else if (msgType === 0xc0) {
        // Program Change
        allEvents.push({
          tick: deltaTime,
          type: "programChange",
          program: bytes[offset++],
          channel,
        });
      } else if (status === 0xff) {
        // Meta event
        const metaType = bytes[offset++];
        const metaLength = readVarLen(bytes, offset);
        const metaLenOffset = varLenLength(bytes, offset);
        offset += metaLenOffset;
        const metaData = bytes.slice(offset, offset + metaLength);
        offset += metaLength;

        if (metaType === 0x51) {
          // Tempo
          const tempo = (metaData[0] << 16) | (metaData[1] << 8) | metaData[2];
          allEvents.push({ tick: deltaTime, type: "tempo", tempo });
        } else if (metaType === 0x58) {
          // Time Signature
          allEvents.push({
            tick: deltaTime,
            type: "timeSignature",
            numerator: metaData[0],
            denominator: Math.pow(2, metaData[1]),
          });
        } else if (metaType === 0x59) {
          // Key Signature
          const sf = metaData[0]; // signed: negative = flats
          const mi = metaData[1];
          allEvents.push({
            tick: deltaTime,
            type: "keySignature",
            sharpsFlats: sf,
            minor: mi === 1,
          });
        }
      } else {
        // Skip unknown
        const remaining = 0xf0 - msgType;
        switch (msgType) {
          case 0xc0:
          case 0xd0:
            offset += 1;
            break;
          case 0xb0:
          case 0xe0:
            offset += 2;
            break;
          default:
            offset += 2;
            break;
        }
      }
    }
  }

  // Convert MIDI events to our internal model
  return midiEventsToComposition(allEvents, division);
}

function midiEventsToComposition(events, ticksPerQuarter) {
  // Sort by tick
  events.sort((a, b) => a.tick - b.tick);

  // Collect active notes to build measures
  const notes = [];
  const activeNotes = new Map(); // key: {note, channel} → startTick

  let tempo = 500000; // 120 BPM default (microseconds per quarter)
  let timeSig = [4, 4];
  let keySig = "C";
  const tempoChanges = [];
  const timeSigChanges = [];

  for (const evt of events) {
    if (evt.type === "tempo") {
      tempo = evt.tempo;
      tempoChanges.push({ tick: evt.tick, tempo });
    }
    if (evt.type === "timeSignature") {
      timeSig = [evt.numerator, evt.denominator];
      timeSigChanges.push({ tick: evt.tick, timeSig });
    }
    if (evt.type === "keySignature") {
      const keys = ["C", "G", "D", "A", "E", "B", "F#", "C#",
                    "F", "B♭", "E♭", "A♭", "D♭", "G♭", "C♭"];
      const idx = evt.sharpsFlats >= 0 ? Math.min(evt.sharpsFlats, 7) : Math.max(0, 7 - evt.sharpsFlats);
      keySig = keys[idx] || "C";
    }
    if (evt.type === "noteOn") {
      const key = `${evt.note}_${evt.channel}`;
      activeNotes.set(key, evt.tick);
    }
    if (evt.type === "noteOff") {
      const key = `${evt.note}_${evt.channel}`;
      const startTick = activeNotes.get(key);
      if (startTick !== undefined) {
        const durationTicks = evt.tick - startTick;
        notes.push({
          pitch: midiToName(evt.note),
          startTick,
          durationTicks,
          channel: evt.channel,
        });
        activeNotes.delete(key);
      }
    }
  }

  // Convert ticks to beats and group into measures
  const tickToSeconds = ticksPerQuarter > 0 ? tempo / 1000000 / ticksPerQuarter : 0.5;
  notes.sort((a, b) => a.startTick - b.startTick);

  // Group by measure (approximate — use first time signature)
  const beatsPerMeasure = timeSig[0];
  const ticksPerBeat = ticksPerQuarter;
  const ticksPerMeasure = ticksPerBeat * beatsPerMeasure;

  const measures = [];
  for (const note of notes) {
    const measureIndex = Math.floor(note.startTick / ticksPerMeasure);
    while (measures.length <= measureIndex) {
      measures.push({ voices: [[]] });
    }
    const beatPosition = (note.startTick % ticksPerMeasure) / ticksPerBeat;
    const durationBeats = note.durationTicks / ticksPerBeat;
    const duration = quantizeDuration(durationBeats);

    measures[measureIndex].voices[0].push({
      pitch: note.pitch,
      duration,
    });
  }

  return {
    clef: "treble",
    timeSignature: timeSig,
    keySignature: keySig,
    tempo: Math.round(60000000 / tempo), // BPM
    measures: measures.length > 0 ? measures : [{ voices: [[]] }],
  };
}

function quantizeDuration(beats) {
  const map = {
    4: "1",
    3: "2d",
    2: "2",
    1.5: "4d",
    1: "4",
    0.75: "8d",
    0.5: "8",
    0.25: "16",
  };
  let best = "4";
  let bestDiff = Infinity;
  for (const [key, val] of Object.entries(map)) {
    const diff = Math.abs(beats - parseFloat(key));
    if (diff < bestDiff) {
      bestDiff = diff;
      best = val;
    }
  }
  return best;
}

// Export our composition model as a MIDI file (returns ArrayBuffer)
export function exportMidiFile(composition) {
  const tempo = 500000; // 120 BPM
  const ticksPerQuarter = 480;
  const timeSig = composition.timeSignature || [4, 4];
  const beatsPerMeasure = timeSig[0];
  const ticksPerMeasure = ticksPerQuarter * beatsPerMeasure;

  // Build track events
  const events = [];

  // Tempo
  events.push({ tick: 0, data: [0xff, 0x51, 0x03, ...toBytes24(tempo)] });
  // Time signature
  events.push({
    tick: 0,
    data: [0xff, 0x58, 0x04, timeSig[0], Math.log2(timeSig[1]), 24, 8],
  });

  let absoluteTick = 0;

  for (const measure of composition.measures || []) {
    const voices = measure.voices || [[]];
    let measureTick = 0;

    for (const note of voices[0] || []) {
      const durationBeats = DURATIONS[note.duration] || 1;
      const durationTicks = Math.round(durationBeats * ticksPerQuarter);

      if (note.pitch) {
        const midi = nameToMidi(note.pitch);
        if (midi !== null) {
          events.push({
            tick: absoluteTick + measureTick,
            data: [0x90, midi, 100], // Note On channel 0
          });
          events.push({
            tick: absoluteTick + measureTick + durationTicks,
            data: [0x80, midi, 0], // Note Off
          });
        }
      }
      measureTick += Math.round(durationTicks / (voices[0].length || 1));
    }
    absoluteTick += ticksPerMeasure;
  }

  // End of track
  events.push({ tick: absoluteTick, data: [0xff, 0x2f, 0x00] });

  // Sort events by tick
  events.sort((a, b) => a.tick - b.tick);

  // Convert to MIDI bytes with delta times
  let prevTick = 0;
  const trackData = [];

  for (const evt of events) {
    const delta = evt.tick - prevTick;
    trackData.push(...encodeVarLen(delta));
    trackData.push(...evt.data);
    prevTick = evt.tick;
  }

  // Build full MIDI file
  const headerChunk = [
    ...strToBytes("MThd"),
    ...toBytes32(6),
    ...toBytes16(0), // format 0 (single track)
    ...toBytes16(1), // 1 track
    ...toBytes16(ticksPerQuarter),
  ];

  const trackChunk = [
    ...strToBytes("MTrk"),
    ...toBytes32(trackData.length),
    ...trackData,
  ];

  const allBytes = [...headerChunk, ...trackChunk];
  return new Uint8Array(allBytes).buffer;
}

// ─────────── Binary helpers ───────────

function readString(bytes, offset, length) {
  return String.fromCharCode(...bytes.slice(offset, offset + length));
}

function readUint16(bytes, offset) {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function readUint32(bytes, offset) {
  return (
    (bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]
  );
}

function readVarLen(bytes, offset) {
  let value = 0;
  let byte;
  do {
    byte = bytes[offset++];
    value = (value << 7) | (byte & 0x7f);
  } while (byte & 0x80);
  return value;
}

function varLenLength(bytes, offset) {
  let len = 0;
  while (bytes[offset + len] & 0x80) len++;
  return len + 1;
}

function encodeVarLen(value) {
  const bytes = [];
  bytes.push(value & 0x7f);
  value >>= 7;
  while (value > 0) {
    bytes.unshift((value & 0x7f) | 0x80);
    value >>= 7;
  }
  return bytes;
}

function strToBytes(str) {
  return [...str].map((c) => c.charCodeAt(0));
}

function toBytes16(n) {
  return [(n >> 8) & 0xff, n & 0xff];
}

function toBytes24(n) {
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function toBytes32(n) {
  return [(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

// Download a composition as a MIDI file
export function downloadMidiFile(composition, filename = "opus-ludus") {
  const buffer = exportMidiFile(composition);
  const blob = new Blob([buffer], { type: "audio/midi" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.mid`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default {
  parseMidiFile,
  exportMidiFile,
  downloadMidiFile,
};
