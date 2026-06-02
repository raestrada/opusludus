// Opus Ludus — Game Manager — Coordinates Phaser, engines, and state
import { getAudioEngine } from "../engine/audio";
import { NotationRenderer } from "../engine/notation";
import { evaluateComposition, getStars } from "../engine/evaluator";
import { downloadMidiFile } from "../engine/midi";
import * as Theory from "../engine/theory";
import { t } from "../store/i18n";
import { saveModuleResult, getStreak, calculateXp } from "../store/progress";

// Test composition — C major scale in quarter notes
const TEST_COMPOSITION = {
  clef: "treble",
  timeSignature: [4, 4],
  keySignature: "C",
  measures: [
    {
      voices: [[
        { pitch: "C4", duration: "4" },
        { pitch: "D4", duration: "4" },
        { pitch: "E4", duration: "4" },
        { pitch: "F4", duration: "4" },
      ]],
    },
    {
      voices: [[
        { pitch: "G4", duration: "4" },
        { pitch: "A4", duration: "4" },
        { pitch: "B4", duration: "4" },
        { pitch: "C5", duration: "4" },
      ]],
    },
  ],
};

// I-IV-V-I chord progression in C major
const TEST_PROGRESSION = {
  clef: "grand",
  timeSignature: [4, 4],
  keySignature: "C",
  measures: [
    {
      voices: [[
        { pitch: "C4", duration: "1" },
        { pitch: "E4", duration: "1" },
        { pitch: "G4", duration: "1" },
      ]],
    },
    {
      voices: [[
        { pitch: "F4", duration: "1" },
        { pitch: "A4", duration: "1" },
        { pitch: "C5", duration: "1" },
      ]],
    },
    {
      voices: [[
        { pitch: "G4", duration: "1" },
        { pitch: "B4", duration: "1" },
        { pitch: "D5", duration: "1" },
      ]],
    },
    {
      voices: [[
        { pitch: "C4", duration: "1" },
        { pitch: "E4", duration: "1" },
        { pitch: "G4", duration: "1" },
      ]],
    },
  ],
};

export class GameManager {
  constructor() {
    this.audio = null;
    this.notation = null;
    this.currentModule = null;
    this.currentComposition = null;
    this.isInitialized = false;
  }

  async init(containerId, moduleDefinition) {
    this.currentModule = moduleDefinition;

    // Init audio engine
    this.audio = getAudioEngine();
    try {
      await this.audio.init("synth");
    } catch (e) {
      console.warn("Audio init failed:", e.message);
    }

    // Init notation renderer (sizes will be auto-detected from container)
    this.notation = new NotationRenderer(containerId, {
      clef: moduleDefinition?.challenge?.clef || "treble",
      timeSignature: moduleDefinition?.challenge?.timeSignature || [4, 4],
      height: 180,
    });
    this.notation.setup();

    this.isInitialized = true;
  }

  // Create a blank composition matching the module's challenge format
  createBlankComposition() {
    const challenge = this.currentModule?.challenge || {};
    const measures = [];
    for (let i = 0; i < (challenge.measures || 4); i++) {
      measures.push({ voices: [[]] });
    }
    return {
      clef: challenge.clef || "treble",
      timeSignature: challenge.timeSignature || [4, 4],
      keySignature: challenge.keySignature || "C",
      availableNotes: challenge.availableNotes || [],
      availableDurations: challenge.availableDurations || ["1", "2", "4", "8"],
      measures,
    };
  }

  // Load a test composition for demo
  loadDemo(which = "scale") {
    this.currentComposition =
      which === "progression" ? TEST_PROGRESSION : TEST_COMPOSITION;
    return this.currentComposition;
  }

  // Render current composition
  render(activeMeasureIndex = 0) {
    if (!this.notation || !this.currentComposition) return;
    this.notation.renderFull(this.currentComposition, activeMeasureIndex);
  }

  // Get total beats in a given measure
  getMeasureBeats(measureIndex, voiceIndex = 0) {
    if (!this.currentComposition) return 0;
    const voice = this.currentComposition.measures?.[measureIndex]?.voices?.[voiceIndex] || [];
    const durMap = {
      "1": 4,
      "2": 2,
      "4": 1,
      "8": 0.5,
      "16": 0.25,
      "2d": 3,
      "4d": 1.5,
      "8d": 0.75
    };
    return voice.reduce((sum, note) => sum + (durMap[note.duration] || 0), 0);
  }

  // Add a note to the composition at measure/voice/position
  addNote(measureIndex, voiceIndex, note) {
    if (!this.currentComposition) return;
    const comp = this.currentComposition;
    while (comp.measures.length <= measureIndex) {
      comp.measures.push({ voices: [[]] });
    }
    const measure = comp.measures[measureIndex];
    if (!measure.voices[voiceIndex]) {
      measure.voices[voiceIndex] = [];
    }
    measure.voices[voiceIndex].push(note);
  }

  // Remove last note from a measure
  removeLastNote(measureIndex, voiceIndex) {
    if (!this.currentComposition) return;
    const voice =
      this.currentComposition.measures?.[measureIndex]?.voices?.[voiceIndex];
    if (voice && voice.length > 0) {
      voice.pop();
    }
  }

  // Clear a measure
  clearMeasure(measureIndex) {
    if (!this.currentComposition) return;
    const measure = this.currentComposition.measures[measureIndex];
    if (measure) {
      measure.voices = [[]];
    }
  }

  // Play the current composition
  play() {
    if (!this.audio || !this.currentComposition) return;
    this.audio.loadComposition(this.currentComposition);
    this.audio.play();
  }

  // Stop playback
  stop() {
    if (this.audio) this.audio.stop();
  }

  // Preview a single note
  previewNote(pitch) {
    if (this.audio) this.audio.playNote(pitch, 0.5);
  }

  // Preview a chord
  previewChord(pitches) {
    if (this.audio) this.audio.playChord(pitches, 1.5);
  }

  // Set tempo
  setTempo(bpm) {
    if (this.audio) this.audio.setTempo(bpm);
  }

  // Evaluate current composition against module rules
  evaluate() {
    if (!this.currentComposition || !this.currentModule) {
      return { totalScore: 0, passed: false, results: [], feedback: "No composition to evaluate." };
    }
    const result = evaluateComposition(this.currentComposition, this.currentModule);
    result.stars = getStars(result.totalScore);
    return result;
  }

  // Submit and save progress
  submit() {
    const result = this.evaluate();
    if (result.passed) {
      const streak = getStreak();
      const xp = calculateXp(
        this.currentModule.xpBase,
        result.totalScore,
        streak
      );
      const saved = saveModuleResult(
        this.currentModule.id,
        result.stars,
        xp
      );
      return { ...result, xpEarned: xp, streak, ...saved };
    }
    return result;
  }

  // Download as MIDI
  downloadMidi(filename) {
    if (!this.currentComposition) return;
    downloadMidiFile(this.currentComposition, filename || "opus-ludus");
  }

  // Get available notes for the current challenge
  getAvailableNotes() {
    return this.currentComposition?.availableNotes || [];
  }

  // Get available durations for the current challenge
  getAvailableDurations() {
    return this.currentComposition?.availableDurations || ["1", "2", "4", "8"];
  }

  // Check if a note is allowed
  isNoteAllowed(pitch) {
    const available = this.getAvailableNotes();
    if (available.length === 0) return true; // No restrictions
    return available.includes(pitch);
  }

  // Get module tips in current locale
  getTips() {
    const locale = window.__OPUS_LUDUS__?.locale || "en";
    return this.currentModule?.tips?.[locale] || this.currentModule?.tips?.en || [];
  }

  // Get module name in current locale
  getModuleName() {
    const locale = window.__OPUS_LUDUS__?.locale || "en";
    return this.currentModule?.name?.[locale] || this.currentModule?.name?.en || "Module";
  }

  dispose() {
    if (this.audio) this.audio.dispose();
    if (this.notation) this.notation.destroy();
    this.currentComposition = null;
    this.isInitialized = false;
  }
}

// Re-export Theory for convenience
export { Theory };

export default GameManager;
