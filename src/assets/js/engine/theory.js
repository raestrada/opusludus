// Music Theory Engine — Core building blocks for composition validation
// All pitch operations use MIDI note numbers internally (C4 = 60)

const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
const FLAT_NAMES = [
  "C",
  "D♭",
  "D",
  "E♭",
  "E",
  "F",
  "G♭",
  "G",
  "A♭",
  "A",
  "B♭",
  "B",
];
const ENHARMONIC = {
  "C#": "D♭",
  "D#": "E♭",
  "F#": "G♭",
  "G#": "A♭",
  "A#": "B♭",
};

// Build note name lookup: "C" → 0, "C#" → 1, etc.
const NAME_TO_SEMITONE = {};
NOTE_NAMES.forEach((n, i) => (NAME_TO_SEMITONE[n] = i));
// Also add flat names
Object.entries({
  "D♭": 1,
  "E♭": 3,
  "G♭": 6,
  "A♭": 8,
  "B♭": 10,
  "C♭": 11,
  "F♭": 4,
}).forEach(([k, v]) => (NAME_TO_SEMITONE[k] = v));

// Parse a note name like "C4", "F#3", "B♭5" into MIDI number
export function nameToMidi(name) {
  const match = name.match(/^([A-G][#♭]?)(\d)$/);
  if (!match) return null;
  const semitone = NAME_TO_SEMITONE[match[1]];
  if (semitone === undefined) return null;
  const octave = parseInt(match[2], 10);
  return octave * 12 + semitone + 12; // MIDI note 0 = C-1, so C4 = 60
}

// Convert MIDI number to note name (sharp form)
export function midiToName(midi, preferFlat = false) {
  const octave = Math.floor(midi / 12) - 1;
  const semitone = midi % 12;
  const names = preferFlat ? FLAT_NAMES : NOTE_NAMES;
  return names[semitone] + octave;
}

// Get the letter class of a note (0=C, 1=D, ..., 6=B)
export function pitchClass(midi) {
  return midi % 12;
}

export function letterName(midi) {
  return NOTE_NAMES[midi % 12][0]; // Just the letter, ignoring accidentals
}

// ─────────── Intervals ───────────

const INTERVAL_NAMES = {
  0: { name: "unison", quality: "perfect", semitones: 0 },
  1: { name: "minorSecond", quality: "minor", semitones: 1 },
  2: { name: "majorSecond", quality: "major", semitones: 2 },
  3: { name: "minorThird", quality: "minor", semitones: 3 },
  4: { name: "majorThird", quality: "major", semitones: 4 },
  5: { name: "perfectFourth", quality: "perfect", semitones: 5 },
  6: { name: "tritone", quality: "diminished", semitones: 6 },
  7: { name: "perfectFifth", quality: "perfect", semitones: 7 },
  8: { name: "minorSixth", quality: "minor", semitones: 8 },
  9: { name: "majorSixth", quality: "major", semitones: 9 },
  10: { name: "minorSeventh", quality: "minor", semitones: 10 },
  11: { name: "majorSeventh", quality: "major", semitones: 11 },
  12: { name: "octave", quality: "perfect", semitones: 12 },
};

export function intervalSemitones(midi1, midi2) {
  return Math.abs(midi2 - midi1);
}

export function intervalName(midi1, midi2) {
  const st = intervalSemitones(midi1, midi2) % 12;
  return INTERVAL_NAMES[st] || { name: "unknown", quality: "unknown", semitones: st };
}

export function isConsonant(midi1, midi2) {
  const st = intervalSemitones(midi1, midi2) % 12;
  return [0, 3, 4, 5, 7, 8, 9].includes(st); // unison, 3rds, 4th, 5th, 6ths
}

export function isPerfectConsonance(midi1, midi2) {
  const st = intervalSemitones(midi1, midi2) % 12;
  return [0, 5, 7].includes(st); // unison, 4th, 5th, octave
}

export function isDissonant(midi1, midi2) {
  return !isConsonant(midi1, midi2);
}

// ─────────── Scales ───────────

const SCALE_PATTERNS = {
  major: [0, 2, 4, 5, 7, 9, 11],
  naturalMinor: [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  wholeTone: [0, 2, 4, 6, 8, 10],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

const KEY_SIGNATURES = {
  // Major keys: number of sharps (positive) or flats (negative)
  C: 0,
  G: 1,
  D: 2,
  A: 3,
  E: 4,
  B: 5,
  "F#": 6,
  "C#": 7,
  F: -1,
  "B♭": -2,
  "E♭": -3,
  "A♭": -4,
  "D♭": -5,
  "G♭": -6,
  "C♭": -7,
};

const RELATIVE_MINOR = {
  C: "A",
  G: "E",
  D: "B",
  A: "F#",
  E: "C#",
  B: "G#",
  "F#": "D#",
  "C#": "A#",
  F: "D",
  "B♭": "G",
  "E♭": "C",
  "A♭": "F",
  "D♭": "B♭",
  "G♭": "E♭",
  "C♭": "A♭",
};

export function getScale(tonic, type = "major") {
  const cleanTonic = tonic.replace(/m$/, "");
  const root = nameToMidi(cleanTonic + "0"); // Use octave 0, return relative pitches
  if (root === null) return null;
  const pattern = SCALE_PATTERNS[type];
  if (!pattern) return null;
  return pattern.map((st) => root + st);
}

export function getScaleInOctave(tonic, type = "major", octave = 4) {
  const cleanTonic = tonic.replace(/m$/, "");
  const root = nameToMidi(cleanTonic + octave);
  if (root === null) return null;
  const pattern = SCALE_PATTERNS[type];
  if (!pattern) return null;
  return pattern.map((st) => root + st);
}

export function getKeySignature(midiNotes) {
  // Determine key signature from a set of pitches (simplified: pick major key)
  const pcs = [...new Set(midiNotes.map((n) => n % 12))];
  let bestKey = "C";
  let bestScore = -Infinity;
  for (const [key, accidentals] of Object.entries(KEY_SIGNATURES)) {
    const scale = getScale(key); // returns [0,2,4,5,7,9,11] + root
    if (!scale) continue;
    const scalePCs = scale.map((n) => n % 12);
    let score = 0;
    for (const pc of pcs) {
      if (scalePCs.includes(pc)) score += 1;
      else score -= 2; // Penalty for out-of-key notes
    }
    if (score > bestScore) {
      bestScore = score;
      bestKey = key;
    }
  }
  return bestKey;
}

// ─────────── Chords ───────────

const CHORD_PATTERNS = {
  major: { intervals: [0, 4, 7], name: "major" },
  minor: { intervals: [0, 3, 7], name: "minor" },
  diminished: { intervals: [0, 3, 6], name: "diminished" },
  augmented: { intervals: [0, 4, 8], name: "augmented" },
  dominantSeventh: { intervals: [0, 4, 7, 10], name: "dominant 7th" },
  majorSeventh: { intervals: [0, 4, 7, 11], name: "major 7th" },
  minorSeventh: { intervals: [0, 3, 7, 10], name: "minor 7th" },
  diminishedSeventh: { intervals: [0, 3, 6, 9], name: "diminished 7th" },
  halfDiminished: { intervals: [0, 3, 6, 10], name: "half-diminished 7th" },
  sus4: { intervals: [0, 5, 7], name: "sus4" },
  sus2: { intervals: [0, 2, 7], name: "sus2" },
};

export function buildChord(root, type = "major") {
  const pattern = CHORD_PATTERNS[type];
  if (!pattern) return null;
  return pattern.intervals.map((st) => root + st);
}

export function identifyChord(midiNotes) {
  if (!midiNotes || midiNotes.length < 3) return null;
  // Sort notes and normalize to lowest note
  const sorted = [...midiNotes].sort((a, b) => a - b);
  const root = sorted[0];
  const intervals = sorted.map((n) => n - root);

  // Try to match against known chord patterns
  for (const [type, pattern] of Object.entries(CHORD_PATTERNS)) {
    if (intervals.length === pattern.intervals.length) {
      if (intervals.every((iv, i) => iv === pattern.intervals[i])) {
        return {
          root: midiToName(root),
          type,
          name: pattern.name,
          notes: sorted.map((n) => midiToName(n)),
        };
      }
    }
    // Also try matching a subset if there are more notes than required
    if (intervals.length > pattern.intervals.length) {
      const subset = intervals.slice(0, pattern.intervals.length);
      if (subset.every((iv, i) => iv === pattern.intervals[i])) {
        return {
          root: midiToName(root),
          type,
          name: pattern.name + " (with extensions)",
          notes: sorted.map((n) => midiToName(n)),
        };
      }
    }
  }
  // Fallback: identify as "custom"
  return {
    root: midiToName(root),
    type: "unknown",
    name: "custom",
    notes: sorted.map((n) => midiToName(n)),
  };
}

export function isTriad(midiNotes) {
  return midiNotes && midiNotes.length === 3;
}

export function isMajorTriad(midiNotes) {
  if (!isTriad(midiNotes)) return false;
  const sorted = [...midiNotes].sort((a, b) => a - b);
  return sorted[1] - sorted[0] === 4 && sorted[2] - sorted[1] === 3;
}

export function isMinorTriad(midiNotes) {
  if (!isTriad(midiNotes)) return false;
  const sorted = [...midiNotes].sort((a, b) => a - b);
  return sorted[1] - sorted[0] === 3 && sorted[2] - sorted[1] === 4;
}

export function isDominantSeventh(midiNotes) {
  if (!midiNotes || midiNotes.length !== 4) return false;
  const sorted = [...midiNotes].sort((a, b) => a - b);
  return (
    sorted[1] - sorted[0] === 4 &&
    sorted[2] - sorted[1] === 3 &&
    sorted[3] - sorted[2] === 3
  );
}

export function getTriadInversion(midiNotes) {
  if (!isTriad(midiNotes)) return -1;
  const sorted = [...midiNotes].sort((a, b) => a - b);
  // Root position: root is lowest
  if (sorted[1] - sorted[0] === 4 && sorted[2] - sorted[1] === 3) return 0; // Major
  if (sorted[1] - sorted[0] === 3 && sorted[2] - sorted[1] === 4) return 0; // Minor
  // First inversion: 3rd is lowest — meaning root is in the middle or top
  // Check: intervals between lowest-2nd and 2nd-3rd
  // In first inversion: intervals are 3rd + 4th (or 4th + 3rd)
  if (sorted[1] - sorted[0] === 3 && sorted[2] - sorted[1] === 5) return 1; // minor triad 1st inversion: m3 + P4
  if (sorted[1] - sorted[0] === 4 && sorted[2] - sorted[1] === 5) return 1; // major triad 1st inversion: M3 + P4
  // Second inversion: 5th is lowest — intervals P4 + M3 or P4 + m3
  if (sorted[1] - sorted[0] === 5 && sorted[2] - sorted[1] === 3) return 2; // P4 + m3
  if (sorted[1] - sorted[0] === 5 && sorted[2] - sorted[1] === 4) return 2; // P4 + M3
  return -1;
}

// ─────────── Roman Numeral Analysis ───────────

export function diatonicChords(key = "C", scaleType = "major") {
  const scale = getScale(key, scaleType);
  if (!scale) return [];
  const numerals = scaleType === "major"
    ? ["I", "ii", "iii", "IV", "V", "vi", "vii°"]
    : ["i", "ii°", "III", "iv", "v", "VI", "VII"];
  const chords = [];
  for (let i = 0; i < 7; i++) {
    const root = scale[i];
    const third = scale[(i + 2) % 7];
    const fifth = scale[(i + 4) % 7];
    chords.push({
      roman: numerals[i],
      root: root,
      notes: [root, third, fifth],
      name: midiToName(root),
    });
  }
  return chords;
}

export function identifyRomanNumeral(chordMidi, key = "C", scaleType = "major") {
  const diatonic = diatonicChords(key, scaleType);
  const sorted = [...chordMidi].sort((a, b) => a - b);
  for (const chord of diatonic) {
    const chordSorted = [...chord.notes].sort((a, b) => a - b);
    // Check if all notes match
    if (sorted.length === chordSorted.length &&
        sorted.every((n, i) => n % 12 === chordSorted[i] % 12)) {
      return chord.roman;
    }
  }
  return null;
}

// ─────────── Voice Leading ───────────

export function hasParallelFifths(chord1, chord2) {
  if (!chord1 || !chord2 || chord1.length !== chord2.length) return false;
  for (let i = 0; i < chord1.length; i++) {
    for (let j = i + 1; j < chord1.length; j++) {
      const iv1 = intervalSemitones(chord1[i], chord1[j]) % 12;
      const iv2 = intervalSemitones(chord2[i], chord2[j]) % 12;
      if ((iv1 === 7 || iv1 === 0) && iv1 === iv2) {
        // Check they actually moved (not same notes)
        if (chord1[i] !== chord2[i] || chord1[j] !== chord2[j]) {
          return true;
        }
      }
    }
  }
  return false;
}

export function hasParallelOctaves(chord1, chord2) {
  if (!chord1 || !chord2 || chord1.length !== chord2.length) return false;
  for (let i = 0; i < chord1.length; i++) {
    for (let j = i + 1; j < chord1.length; j++) {
      const iv1 = intervalSemitones(chord1[i], chord1[j]) % 12;
      const iv2 = intervalSemitones(chord2[i], chord2[j]) % 12;
      if (iv1 === 0 && iv2 === 0) {
        if (chord1[i] !== chord2[i] || chord1[j] !== chord2[j]) {
          return true;
        }
      }
    }
  }
  return false;
}

export function getMotionType(voice1a, voice1b, voice2a, voice2b) {
  const dir1 = voice2a - voice1a;
  const dir2 = voice2b - voice1b;
  if (voice1a === voice2a && voice1b === voice2b) return "static";
  if (voice1a === voice2a || voice1b === voice2b) return "oblique";
  if (Math.sign(dir1) === Math.sign(dir2)) return "similar";
  if (Math.sign(dir1) !== Math.sign(dir2)) return "contrary";
  return "unknown";
}

// ─────────── Utilities ───────────

export function noteInScale(midi, key = "C", scaleType = "major") {
  const scale = getScale(key, scaleType);
  if (!scale) return false;
  return scale.some((s) => s % 12 === midi % 12);
}

export function isLeadingTone(midi, key = "C") {
  const scale = getScale(key, "major");
  if (!scale) return false;
  const leadingTone = scale[6] % 12; // 7th degree
  return midi % 12 === leadingTone;
}

export function resolvesUpToTonic(midiFrom, midiTo, key = "C") {
  if (!isLeadingTone(midiFrom, key)) return false;
  const scale = getScale(key, "major");
  if (!scale) return false;
  const tonic = scale[0] % 12;
  return midiTo % 12 === tonic && midiTo > midiFrom;
}

// Duration constants (beats in 4/4)
export const DURATIONS = {
  "1": 4,    // whole
  "2": 2,    // half
  "4": 1,    // quarter
  "8": 0.5,  // eighth
  "16": 0.25, // sixteenth
  "2d": 3,   // dotted half
  "4d": 1.5, // dotted quarter
  "8d": 0.75, // dotted eighth
};

export function beatsToDuration(beats) {
  const reversed = {};
  for (const [key, val] of Object.entries(DURATIONS)) {
    if (!reversed[val]) reversed[val] = key;
  }
  return reversed[beats] || "4";
}

export function isValidNoteName(name) {
  return nameToMidi(name) !== null;
}

export default {
  nameToMidi,
  midiToName,
  pitchClass,
  letterName,
  intervalSemitones,
  intervalName,
  isConsonant,
  isPerfectConsonance,
  isDissonant,
  getScale,
  getScaleInOctave,
  getKeySignature,
  buildChord,
  identifyChord,
  isTriad,
  isMajorTriad,
  isMinorTriad,
  isDominantSeventh,
  getTriadInversion,
  diatonicChords,
  identifyRomanNumeral,
  hasParallelFifths,
  hasParallelOctaves,
  getMotionType,
  noteInScale,
  isLeadingTone,
  resolvesUpToTonic,
  DURATIONS,
  beatsToDuration,
  isValidNoteName,
};
