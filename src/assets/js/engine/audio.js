// Audio Engine — Tone.js wrapper for playback and synthesis
import * as Tone from "tone";
import { nameToMidi, DURATIONS, getScale } from "./theory";

// Instrument presets
const INSTRUMENTS = {
  piano: () => new Tone.Sampler({
    urls: {
      C4: "C4.mp3",
      "D#4": "Ds4.mp3",
      "F#4": "Fs4.mp3",
      A4: "A4.mp3",
    },
    baseUrl: "https://tonejs.github.io/audio/salamander/",
    onload: () => console.log("Piano samples loaded"),
  }),
  synth: () => new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.2, release: 0.8 },
  }).toDestination(),
  strings: () => new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "fatsawtooth", count: 3, spread: 20 },
    envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 1.5 },
  }).toDestination(),
  organ: () => new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" },
    envelope: { attack: 0.05, decay: 0.1, sustain: 1, release: 0.5 },
  }).toDestination(),
  woodwind: () => new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle4" },
    envelope: { attack: 0.08, decay: 0.2, sustain: 0.5, release: 0.6 },
  }).toDestination(),
};

export class AudioEngine {
  constructor() {
    this.instrument = null;
    this.isLoaded = false;
    this.isPlaying = false;
    this.currentPart = null;
    this.volume = new Tone.Volume(-6).toDestination();
    this.reverb = new Tone.Reverb({ decay: 1.5, wet: 0.2 }).connect(this.volume);
    this.events = [];
    // Store event IDs for scheduled events to allow cancellation
    this._scheduledIds = [];
  }

  async init(instrumentType = "synth") {
    // Attempt to start Tone.js asynchronously; do NOT await it here
    // as it will hang the loading screen if called before a user gesture.
    Tone.start().catch((err) => {
      console.warn("Tone.start() on init deferred due to user gesture policy:", err);
    });
    Tone.Transport.bpm.value = 100;

    if (this.instrument) {
      this.instrument.dispose();
    }

    const factory = INSTRUMENTS[instrumentType] || INSTRUMENTS.synth;
    this.instrument = factory();
    if (this.instrument instanceof Tone.PolySynth) {
      this.instrument.connect(this.reverb);
    } else if (this.instrument.connect) {
      this.instrument.connect(this.reverb);
    }

    this.isLoaded = true;
  }

  setInstrument(type) {
    this.init(type);
  }

  setTempo(bpm) {
    Tone.Transport.bpm.value = bpm;
  }

  // Load a composition and schedule playback
  loadComposition(composition) {
    Tone.Transport.cancel();
    Tone.Transport.stop();
    this.isPlaying = false;
    this._scheduledIds = [];

    if (!composition || !composition.measures) return;

    const timeSig = composition.timeSignature || [4, 4];
    const beatDuration = 60 / Tone.Transport.bpm.value; // seconds per beat
    const beatsPerMeasure = timeSig[0];

    let absoluteBeat = 0; // Beat position in the transport

    for (const measure of composition.measures) {
      const voices = measure.voices || [[]];
      for (const voice of voices) {
        let beatOffset = 0;
        for (const note of voice) {
          const duration = DURATIONS[note.duration] || 1;
          const time = absoluteBeat + beatOffset;

          if (note.pitch) {
            const freq = this._pitchToFrequency(note.pitch);
            if (freq) {
              // Schedule each note
              const id = Tone.Transport.schedule((t) => {
                if (this.instrument && typeof this.instrument.triggerAttackRelease === "function") {
                  this.instrument.triggerAttackRelease(
                    freq,
                    duration * beatDuration,
                    t,
                    0.7
                  );
                }
              }, time);
              this._scheduledIds.push(id);
            }
          }
          // Rests don't need to be scheduled — just advance time
          beatOffset += duration;
        }
      }
      absoluteBeat += beatsPerMeasure;
    }

    // Set transport loop to composition length
    Tone.Transport.loop = false;
    Tone.Transport.loopEnd = absoluteBeat;
  }

  play() {
    if (!this.isLoaded) return;
    Tone.Transport.start();
    this.isPlaying = true;
  }

  stop() {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    this.isPlaying = false;
  }

  pause() {
    Tone.Transport.pause();
    this.isPlaying = false;
  }

  // Preview a single note
  playNote(pitch, duration = 0.5) {
    if (!this.isLoaded || !this.instrument) return;
    const freq = this._pitchToFrequency(pitch);
    if (freq && typeof this.instrument.triggerAttackRelease === "function") {
      this.instrument.triggerAttackRelease(freq, duration, undefined, 0.7);
    }
  }

  // Preview a chord (array of pitches)
  playChord(pitches, duration = 1.5) {
    if (!this.isLoaded || !this.instrument) return;
    const freqs = pitches
      .map((p) => this._pitchToFrequency(p))
      .filter((f) => f !== null);
    if (freqs.length > 0 && typeof this.instrument.triggerAttackRelease === "function") {
      this.instrument.triggerAttackRelease(freqs, duration, undefined, 0.6);
    }
  }

  // Preview a scale
  playScale(tonic, scaleType = "major", duration = 0.25) {
    const scale = getScale(tonic, scaleType);
    if (!scale) return;

    let time = Tone.now();
    for (const midi of scale) {
      const freq = Tone.Frequency(midi, "midi").toFrequency();
      const id = Tone.Transport.schedule((t) => {
        if (this.instrument && typeof this.instrument.triggerAttackRelease === "function") {
          this.instrument.triggerAttackRelease(freq, duration, t, 0.6);
        }
      }, Tone.Time(time).toSeconds());
      time += duration;
    }
  }

  // Play a chord with arpeggio
  playArpeggio(chordMidi, duration = 0.15, gap = 0.05) {
    if (!this.isLoaded || !this.instrument) return;
    const sorted = [...chordMidi].sort((a, b) => a - b);
    let timeOffset = 0;
    for (const midi of sorted) {
      const freq = Tone.Frequency(midi, "midi").toFrequency();
      const startTime = Tone.now() + timeOffset;
      if (typeof this.instrument.triggerAttack === "function") {
        this.instrument.triggerAttack(freq, startTime, 0.5);
        this.instrument.triggerRelease(startTime + duration);
      }
      timeOffset += gap;
    }
  }

  setVolume(level) {
    // level: -60 to 0 dB
    this.volume.volume.value = Math.max(-60, Math.min(0, level));
  }

  mute() {
    this.volume.mute = !this.volume.mute;
  }

  dispose() {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    if (this.instrument) this.instrument.dispose();
    this.volume.dispose();
    this.reverb.dispose();
    this.isLoaded = false;
    this.isPlaying = false;
  }

  _pitchToFrequency(pitch) {
    const midi = nameToMidi(pitch);
    if (midi === null) return null;
    return Tone.Frequency(midi, "midi").toFrequency();
  }
}

// Singleton
let audioInstance = null;

export function getAudioEngine() {
  if (!audioInstance) {
    audioInstance = new AudioEngine();
  }
  return audioInstance;
}

// Resume Tone.js AudioContext on the first user interaction
if (typeof window !== "undefined") {
  const resumeAudio = async () => {
    if (Tone.context && Tone.context.state !== "running") {
      try {
        await Tone.start();
        console.log("Tone.js context resumed via user gesture");
        window.removeEventListener("click", resumeAudio);
        window.removeEventListener("pointerdown", resumeAudio);
        window.removeEventListener("keydown", resumeAudio);
      } catch (err) {
        console.warn("Failed to resume Tone.js context:", err);
      }
    } else {
      window.removeEventListener("click", resumeAudio);
      window.removeEventListener("pointerdown", resumeAudio);
      window.removeEventListener("keydown", resumeAudio);
    }
  };
  window.addEventListener("click", resumeAudio);
  window.addEventListener("pointerdown", resumeAudio);
  window.addEventListener("keydown", resumeAudio);
}

export default AudioEngine;
