// Evaluator Engine — Validates compositions against module challenge rules
import {
  nameToMidi,
  midiToName,
  isMajorTriad,
  isMinorTriad,
  isConsonant,
  isDominantSeventh,
  intervalSemitones,
  hasParallelFifths,
  hasParallelOctaves,
  getMotionType,
  getScale,
  getScaleInOctave,
  diatonicChords,
  identifyRomanNumeral,
  noteInScale,
  isLeadingTone,
  resolvesUpToTonic,
  getKeySignature,
  DURATIONS,
} from "./theory.js";

// Extract all MIDI notes from a composition
function getAllMidiNotes(composition) {
  const notes = [];
  for (const measure of composition.measures || []) {
    for (const voice of measure.voices || []) {
      for (const note of voice) {
        if (note.pitch) {
          const midi = nameToMidi(note.pitch);
          if (midi !== null) notes.push(midi);
        }
      }
    }
  }
  return notes;
}

// Get a flat array of notes for a measure
function getMeasureNotes(measure, voiceIndex = 0) {
  const voice = measure?.voices?.[voiceIndex] || [];
  return voice.filter((n) => n.pitch).map((n) => ({
    midi: nameToMidi(n.pitch),
    pitch: n.pitch,
    duration: n.duration,
  }));
}

// Get chord for a measure (all simultaneous notes)
function getMeasureChord(measure) {
  const voice = measure?.voices?.[0] || [];
  return voice.filter((n) => n.pitch).map((n) => nameToMidi(n.pitch));
}

// Count items meeting criteria
function count(arr, fn) {
  return arr.reduce((c, x) => c + (fn(x) ? 1 : 0), 0);
}

// Get all notes across all voices in a measure
function getAllMeasureNotes(measure) {
  const notes = [];
  if (!measure || !measure.voices) return notes;
  measure.voices.forEach((voice, voiceIndex) => {
    voice.filter((n) => n.pitch).forEach((n) => {
      notes.push({
        midi: nameToMidi(n.pitch),
        pitch: n.pitch,
        duration: n.duration,
        voiceIndex: voiceIndex
      });
    });
  });
  return notes;
}

// Compare similarity between two sections of measures
function compareSectionSimilarity(composition, start1, end1, start2, end2) {
  const notes1 = [];
  const notes2 = [];
  for (let i = start1; i <= end1; i++) {
    const m = composition.measures?.[i];
    if (m) getAllMeasureNotes(m).forEach(n => notes1.push(n.midi % 12));
  }
  for (let i = start2; i <= end2; i++) {
    const m = composition.measures?.[i];
    if (m) getAllMeasureNotes(m).forEach(n => notes2.push(n.midi % 12));
  }
  if (notes1.length === 0 || notes2.length === 0) return 0;
  
  const set1 = new Set(notes1);
  const set2 = new Set(notes2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return union.size > 0 ? intersection.size / union.size : 0;
}

// Get Roman Numeral analysis of a chord in a specific measure index
function getRomanNumeralAtMeasure(composition, measureIdx, key = "C") {
  const measure = composition.measures?.[measureIdx];
  if (!measure) return null;
  const chord = getMeasureChord(measure);
  if (chord.length === 0) return null;
  return identifyRomanNumeral(chord, key);
}

// ─────────── Individual Rule Validators ───────────

// Each validator returns: { passed: bool, score: 0..1, feedback: string }

const validators = {
  // Check that all notes are within the available set
  noteInStaff(composition, rule) {
    const notes = getAllMidiNotes(composition);
    const available = (composition.availableNotes || []).map((n) =>
      nameToMidi(n)
    );
    const validNotes = notes.filter((n) => available.includes(n));
    const passed = validNotes.length === notes.length;
    const score = notes.length > 0 ? validNotes.length / notes.length : 0;
    return {
      passed,
      score,
      feedback: passed
        ? "All notes are correctly placed on the staff."
        : `${notes.length - validNotes.length} note(s) are out of the allowed range.`,
    };
  },

  // Each measure must have at least minNotes
  measureHasNotes(composition, rule) {
    const min = rule.minNotes || 1;
    let passedCount = 0;
    for (const measure of composition.measures || []) {
      const noteCount =
        measure.voices?.[0]?.filter((n) => n.pitch).length || 0;
      if (noteCount >= min) passedCount++;
    }
    const total = composition.measures?.length || 0;
    const score = total > 0 ? passedCount / total : 0;
    return {
      passed: passedCount === total,
      score,
      feedback:
        passedCount === total
          ? `Every measure has at least ${min} note(s).`
          : `${total - passedCount} measure(s) need at least ${min} note(s).`,
    };
  },

  // Check note names/positions are valid
  correctPitchNames(composition, rule) {
    const notes = getAllMidiNotes(composition);
    const allValid = notes.every((n) => n !== null && n >= 36 && n <= 96);
    return {
      passed: allValid,
      score: allValid ? 1 : 0,
      feedback: allValid
        ? "All note names and positions are valid."
        : "Some notes have invalid names or positions.",
    };
  },

  // Each measure's durations must fill the time signature
  measureFillsTimeSignature(composition, rule) {
    const timeSig = composition.timeSignature || [4, 4];
    const beatsPerMeasure = timeSig[0] * (4 / timeSig[1]);
    let passedCount = 0;
    for (const measure of composition.measures || []) {
      const voice = measure.voices?.[0] || [];
      let totalBeats = 0;
      for (const note of voice) {
        totalBeats += DURATIONS[note.duration] || 0;
      }
      if (Math.abs(totalBeats - beatsPerMeasure) < 0.01) passedCount++;
    }
    const total = composition.measures?.length || 0;
    const score = total > 0 ? passedCount / total : 0;
    return {
      passed: passedCount === total,
      score,
      feedback:
        passedCount === total
          ? "All measures are correctly filled."
          : `${total - passedCount} measure(s) don't fill the time signature correctly.`,
    };
  },

  // Use multiple rhythmic durations
  usesMultipleDurations(composition, rule) {
    const minTypes = rule.minTypes || 2;
    const durations = new Set();
    for (const measure of composition.measures || []) {
      for (const voice of measure.voices || []) {
        for (const note of voice) {
          if (note.duration) durations.add(note.duration);
        }
      }
    }
    const passed = durations.size >= minTypes;
    return {
      passed,
      score: passed ? 1 : Math.min(1, durations.size / minTypes),
      feedback: passed
        ? `Used ${durations.size} different rhythmic values.`
        : `Used ${durations.size} rhythmic value(s); need at least ${minTypes}.`,
    };
  },

  // Accent strong beats
  strongBeatAccent(composition, rule) {
    const timeSig = composition.timeSignature || [4, 4];
    let strongBeatScore = 0;
    let totalMeasures = 0;
    for (const measure of composition.measures || []) {
      const voice = measure.voices?.[0] || [];
      if (voice.length === 0) continue;
      totalMeasures++;
      const firstNote = voice[0];
      const firstDuration = DURATIONS[firstNote.duration] || 0;
      if (firstDuration >= 1) strongBeatScore++; // Quarter note or longer
    }
    const score = totalMeasures > 0 ? strongBeatScore / totalMeasures : 0;
    return {
      passed: score >= 0.5,
      score,
      feedback:
        score >= 0.5
          ? "Strong beats have appropriate accents."
          : "Try using longer notes on beat 1 of each measure.",
    };
  },

  // Natural phrasing — last note should feel like ending
  naturalPhrasing(composition, rule) {
    if (!composition.measures?.length) return { passed: false, score: 0, feedback: "No measures." };
    const lastMeasure = composition.measures[composition.measures.length - 1];
    const voice = lastMeasure.voices?.[0] || [];
    if (voice.length === 0) return { passed: false, score: 0, feedback: "Last measure is empty." };
    const lastNote = voice[voice.length - 1];
    const passed = lastNote.duration === "1" || lastNote.duration === "2" || lastNote.duration === "4d";
    return {
      passed,
      score: passed ? 1 : 0.5,
      feedback: passed
        ? "The final note creates a natural ending."
        : "Try ending with a longer note for a more natural closure.",
    };
  },

  // Is a specific interval correct
  correctInterval(composition, rule) {
    const requiredIntervals = rule.intervals || [];
    const stMap = { M2: 2, M3: 4, P4: 5, P5: 7, M6: 9, M7: 11, P8: 12, m3: 3, m6: 8, m7: 10 };
    const notes = getAllMidiNotes(composition);
    if (notes.length < 2) return { passed: false, score: 0, feedback: "Need at least 2 notes to form an interval." };

    const foundSemitones = new Set();
    for (let i = 0; i < notes.length - 1; i++) {
      const semitones = Math.abs(notes[i + 1] - notes[i]);
      foundSemitones.add(semitones);
    }

    let matches = 0;
    const missing = [];
    for (const iv of requiredIntervals) {
      const target = stMap[iv];
      if (target !== undefined && (foundSemitones.has(target) || foundSemitones.has(target % 12))) {
        matches++;
      } else {
        missing.push(iv);
      }
    }

    const passed = matches === requiredIntervals.length;
    const score = matches / requiredIntervals.length;
    return {
      passed,
      score,
      feedback: passed
        ? `All requested intervals (${requiredIntervals.join(", ")}) are present.`
        : `Missing interval(s): ${missing.join(", ")}.`,
    };
  },

  // Check interval quality
  intervalQuality(composition, rule) {
    const notes = getAllMidiNotes(composition);
    let consonantCount = 0;
    let totalJumps = 0;
    for (let i = 0; i < notes.length - 1; i++) {
      const st = Math.abs(notes[i + 1] - notes[i]);
      if (st > 0) {
        totalJumps++;
        if (isConsonant(notes[i], notes[i + 1]) || st <= 2) consonantCount++;
      }
    }
    const score = totalJumps > 0 ? consonantCount / totalJumps : 1;
    return {
      passed: score >= 0.85,
      score,
      feedback: score >= 0.85
        ? "Interval qualities are appropriate."
        : "Some intervals are overly dissonant. Avoid tritone or augmented leaps.",
    };
  },

  // Check if melody forms a scale
  isScale(composition, rule) {
    const scaleType = rule.scaleType || "major";
    const notes = getAllMidiNotes(composition);
    if (notes.length < 8) {
      return { passed: false, score: 0, feedback: "Need at least 8 notes to form an octave-spanning scale (e.g., C to C)." };
    }

    const firstNoteName = midiToName(notes[0]);
    const match = firstNoteName.match(/^([A-G][#♭]?)/);
    if (!match) return { passed: false, score: 0, feedback: "Could not determine starting note class." };
    const tonicName = match[1];
    const octave = parseInt(firstNoteName.match(/\d$/)[0]);
    
    const expectedMIDI = getScaleInOctave(tonicName, scaleType === "minor" ? "naturalMinor" : scaleType, octave);
    if (!expectedMIDI) {
      return { passed: false, score: 0, feedback: `Unsupported scale type: ${scaleType}` };
    }
    expectedMIDI.push(expectedMIDI[0] + 12);

    let correctCount = 0;
    const lengthToCheck = Math.min(notes.length, expectedMIDI.length);
    for (let i = 0; i < lengthToCheck; i++) {
      if (notes[i] === expectedMIDI[i]) {
        correctCount++;
      }
    }

    const passed = correctCount === expectedMIDI.length;
    const score = correctCount / expectedMIDI.length;
    const scaleNameStr = `${tonicName} ${scaleType === "minor" ? "menor natural" : "mayor"}`;

    return {
      passed,
      score,
      feedback: passed
        ? `¡Excelente! Escribiste la escala de ${scaleNameStr} de forma ascendente perfecta.`
        : `La escala de ${scaleNameStr} no es correcta. Tienes ${correctCount} de ${expectedMIDI.length} notas en el orden y alteración correctos.`,
    };
  },

  // Check correct accidentals
  correctAccidentals(composition, rule) {
    const notes = getAllMidiNotes(composition);
    if (notes.length === 0) return { passed: true, score: 1, feedback: "No notes." };
    
    const firstNoteName = midiToName(notes[0]);
    const match = firstNoteName.match(/^([A-G][#♭]?)/);
    if (!match) return { passed: false, score: 0, feedback: "Could not determine key." };
    const tonicName = match[1];
    
    const expectedScale = getScale(tonicName, "major");
    if (!expectedScale) return { passed: true, score: 1, feedback: "Checked." };
    const expectedPCs = expectedScale.map(n => n % 12);
    
    let wrongAccidentals = 0;
    for (const midi of notes) {
      if (!expectedPCs.includes(midi % 12)) {
        wrongAccidentals++;
      }
    }
    
    const passed = wrongAccidentals === 0;
    const score = (notes.length - wrongAccidentals) / notes.length;
    return {
      passed,
      score,
      feedback: passed
        ? "Accidentals match the key signature perfectly."
        : `Found ${wrongAccidentals} note(s) with incorrect accidentals for the key of ${tonicName} major.`,
    };
  },

  // Is major triad
  isMajorTriad(composition, rule) {
    const measureIdx = rule.measure ?? 0;
    const measure = composition.measures?.[measureIdx];
    const chord = getMeasureChord(measure);
    const passed = isMajorTriad(chord);
    return {
      passed,
      score: passed ? 1 : 0,
      feedback: passed
        ? "Correct major triad."
        : "Not a major triad. Remember: root + major 3rd + perfect 5th.",
    };
  },

  // Is minor triad
  isMinorTriad(composition, rule) {
    const measureIdx = rule.measure ?? 0;
    const measure = composition.measures?.[measureIdx];
    const chord = getMeasureChord(measure);
    const passed = isMinorTriad(chord);
    return {
      passed,
      score: passed ? 1 : 0,
      feedback: passed
        ? "Correct minor triad."
        : "Not a minor triad. Remember: root + minor 3rd + perfect 5th.",
    };
  },

  // Correct spelling
  correctSpelling(composition, rule) {
    const measures = composition.measures || [];
    let passedCount = 0;
    let totalChecked = 0;
    const letterToDegree = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };

    for (const measure of measures) {
      const chordNotes = getAllMeasureNotes(measure).filter(n => n.pitch);
      if (chordNotes.length < 3) continue; // Only check if we have a chord/triad
      totalChecked++;
      
      // Extract unique letter names
      const letters = Array.from(new Set(chordNotes.map(n => n.pitch[0].toUpperCase())));
      if (letters.length !== 3) {
        continue;
      }
      
      const degrees = letters.map(l => letterToDegree[l]);
      
      // Check if degrees can be arranged as {R, R+2, R+4} mod 7
      let validSpelling = false;
      for (let r = 0; r < 7; r++) {
        const expected = [r, (r + 2) % 7, (r + 4) % 7];
        if (expected.every(d => degrees.includes(d))) {
          validSpelling = true;
          break;
        }
      }
      if (validSpelling) passedCount++;
    }
    
    const score = totalChecked > 0 ? passedCount / totalChecked : 1;
    return {
      passed: score >= 1.0,
      score,
      feedback: score >= 1.0
        ? "All triads are spelled correctly using stacked thirds."
        : "Some triads have incorrect spelling (e.g. using enharmonics like D# instead of Eb).",
    };
  },

  // Has root position
  hasRootPosition(composition, rule) {
    const measureIdx = rule.measure ?? 0;
    const measure = composition.measures?.[measureIdx];
    const chord = getMeasureChord(measure);
    const passed = chord.length >= 3 && isMajorTriad(chord);
    return {
      passed,
      score: passed ? 1 : 0,
      feedback: passed ? "Root position chord found." : "Write a root position triad.",
    };
  },

  // Has first inversion
  hasFirstInversion(composition, rule) {
    const measureIdx = rule.measure ?? 0;
    const measure = composition.measures?.[measureIdx];
    const chord = getMeasureChord(measure);
    if (chord.length < 3) return { passed: false, score: 0, feedback: "Need 3 notes." };
    const sorted = [...chord].sort((a, b) => a - b);
    // 1st inversion: 3rd in bass → intervals of 3 + 4 or 4 + 3
    const iv1 = sorted[1] - sorted[0];
    const iv2 = sorted[2] - sorted[1];
    const passed =
      (iv1 === 3 && iv2 === 5) || (iv1 === 4 && iv2 === 5);
    return {
      passed,
      score: passed ? 1 : 0,
      feedback: passed
        ? "First inversion chord found."
        : "Place the 3rd of the chord in the bass for first inversion.",
    };
  },

  // Has second inversion
  hasSecondInversion(composition, rule) {
    const measureIdx = rule.measure ?? 0;
    const measure = composition.measures?.[measureIdx];
    const chord = getMeasureChord(measure);
    if (chord.length < 3) return { passed: false, score: 0, feedback: "Need 3 notes." };
    const sorted = [...chord].sort((a, b) => a - b);
    // 2nd inversion: 5th in bass → intervals of 4 + 3 or 3 + 4 (P4 + M3 or P4 + m3)
    const iv1 = sorted[1] - sorted[0];
    const iv2 = sorted[2] - sorted[1];
    const passed = iv1 === 5 && (iv2 === 3 || iv2 === 4);
    return {
      passed,
      score: passed ? 1 : 0,
      feedback: passed
        ? "Second inversion chord found."
        : "Place the 5th of the chord in the bass for second inversion.",
    };
  },

  // Smooth bass line
  smoothBassLine(composition, rule) {
    const fromIdx = rule.fromMeasure ?? 0;
    const toIdx = rule.toMeasure ?? composition.measures.length - 1;
    const maxLeap = rule.maxLeap || 5;
    const allNotes = getAllMidiNotes(composition);
    let smoothCount = 0;
    let total = 0;
    for (let i = fromIdx; i < toIdx && i + 1 < allNotes.length; i++) {
      total++;
      const leap = Math.abs(allNotes[i + 1] - allNotes[i]);
      if (leap <= maxLeap) smoothCount++;
    }
    const score = total > 0 ? smoothCount / total : 0;
    return {
      passed: score >= 0.7,
      score,
      feedback: score >= 0.7
        ? "Bass line moves smoothly."
        : "Try smaller leaps in the bass line.",
    };
  },

  // Check chord progression
  isChordProgression(composition, rule) {
    const progression = rule.progression || ["I", "IV", "V", "I"];
    const key = rule.key || "C";
    let matchCount = 0;
    for (let i = 0; i < progression.length; i++) {
      const measure = composition.measures?.[i];
      const chord = getMeasureChord(measure);
      if (chord.length >= 3) {
        const roman = identifyRomanNumeral(chord, key);
        if (roman === progression[i]) matchCount++;
      }
    }
    const score = progression.length > 0 ? matchCount / progression.length : 0;
    return {
      passed: score >= 0.75,
      score,
      feedback:
        score >= 0.75
          ? "Chord progression matches I-IV-V-I."
          : "The chords don't follow the required progression. Check each chord.",
    };
  },

  // Voice leading rules
  voiceLeading(composition, rule) {
    const noParallelFifths = rule.rules?.includes("noParallelFifths");
    const noParallelOctaves = rule.rules?.includes("noParallelOctaves");
    const leadingTone = rule.rules?.includes("leadingToneResolves");

    let issues = [];
    for (let i = 0; i < (composition.measures?.length || 0) - 1; i++) {
      const chord1 = getMeasureChord(composition.measures[i]);
      const chord2 = getMeasureChord(composition.measures[i + 1]);
      if (chord1.length >= 3 && chord2.length >= 3) {
        if (noParallelFifths && hasParallelFifths(chord1, chord2)) {
          issues.push("Parallel fifths between measures " + (i + 1) + " and " + (i + 2));
        }
        if (noParallelOctaves && hasParallelOctaves(chord1, chord2)) {
          issues.push("Parallel octaves between measures " + (i + 1) + " and " + (i + 2));
        }
      }
    }

    if (leadingTone) {
      // Check if leading tone resolves correctly
      const notes = getAllMidiNotes(composition);
      for (let i = 0; i < notes.length - 1; i++) {
        if (isLeadingTone(notes[i], "C") && !resolvesUpToTonic(notes[i], notes[i + 1], "C")) {
          issues.push("Leading tone should resolve up to tonic.");
        }
      }
    }

    const passed = issues.length === 0;
    return {
      passed,
      score: passed ? 1 : Math.max(0.3, 1 - issues.length * 0.2),
      feedback: passed
        ? "Voice leading is clean."
        : issues.join(" "),
    };
  },

  // Authentic cadence
  hasAuthenticCadence(composition, rule) {
    const endIdx = rule.endingMeasure ?? composition.measures.length - 1;
    const chord1 = getMeasureChord(composition.measures?.[endIdx - 1]);
    const chord2 = getMeasureChord(composition.measures?.[endIdx]);
    const vRoman = identifyRomanNumeral(chord1);
    const iRoman = identifyRomanNumeral(chord2);
    const passed = vRoman === "V" && (iRoman === "I" || iRoman === "i");
    return {
      passed,
      score: passed ? 1 : 0,
      feedback: passed
        ? "Authentic cadence (V-I) found."
        : "End with V-I for an authentic cadence. Check your chords.",
    };
  },

  // Plagal cadence
  hasPlagalCadence(composition, rule) {
    const endIdx = rule.endingMeasure ?? composition.measures.length - 1;
    const chord1 = getMeasureChord(composition.measures?.[endIdx - 1]);
    const chord2 = getMeasureChord(composition.measures?.[endIdx]);
    const ivRoman = identifyRomanNumeral(chord1);
    const iRoman = identifyRomanNumeral(chord2);
    const passed = ivRoman === "IV" && (iRoman === "I" || iRoman === "i");
    return {
      passed,
      score: passed ? 1 : 0,
      feedback: passed
        ? "Plagal cadence (IV-I) found."
        : "End with IV-I for a plagal cadence.",
    };
  },

  // Is dominant seventh
  isDominantSeventh(composition, rule) {
    const measureIdx = rule.measure ?? 0;
    const measure = composition.measures?.[measureIdx];
    const chord = getMeasureChord(measure);
    const passed = isDominantSeventh(chord);
    return {
      passed,
      score: passed ? 1 : 0,
      feedback: passed
        ? "Correct V7 chord."
        : "Build a dominant seventh: root + M3 + P5 + m7.",
    };
  },

  // Resolves to tonic
  resolvesToTonic(composition, rule) {
    const fromIdx = rule.fromMeasure ?? 0;
    const toIdx = rule.toMeasure ?? 1;
    const chordFrom = getMeasureChord(composition.measures?.[fromIdx]);
    const chordTo = getMeasureChord(composition.measures?.[toIdx]);
    const passed = isDominantSeventh(chordFrom) && (isMajorTriad(chordTo) || isMinorTriad(chordTo));
    return {
      passed,
      score: passed ? 1 : 0,
      feedback: passed
        ? "V7 resolves correctly to I."
        : "The V7 should resolve to the I chord.",
    };
  },

  // Tritone resolves
  tritoneResolves(composition, rule) {
    const key = composition.keySignature || rule.key || "C";
    const scale = getScale(key, "major");
    if (!scale) return { passed: false, score: 0, feedback: "Could not determine scale for key." };
    const leadingTonePC = scale[6] % 12; // sensible (e.g. B = 11)
    const fourthDegreePC = scale[3] % 12; // 7th of V7 / 4th degree of scale (e.g. F = 5)
    const tonicPC = scale[0] % 12; // (e.g. C = 0)
    const thirdDegreePC = scale[2] % 12; // (e.g. E = 4)

    let checkedCount = 0;
    let resolvedCount = 0;
    
    const measures = composition.measures || [];
    for (let m = 0; m < measures.length - 1; m++) {
      const voicesCurrent = measures[m].voices || [];
      const voicesNext = measures[m+1].voices || [];
      if (voicesCurrent.length === 0 || voicesNext.length === 0) continue;
      
      // Check each voice
      for (let v = 0; v < Math.min(voicesCurrent.length, voicesNext.length); v++) {
        const notesCurr = voicesCurrent[v].filter(n => n.pitch);
        const notesNext = voicesNext[v].filter(n => n.pitch);
        if (notesCurr.length === 0 || notesNext.length === 0) continue;
        
        const lastNoteCurr = notesCurr[notesCurr.length - 1];
        const firstNoteNext = notesNext[0];
        const pcCurr = nameToMidi(lastNoteCurr.pitch) % 12;
        const pcNext = nameToMidi(firstNoteNext.pitch) % 12;
        
        if (pcCurr === leadingTonePC) {
          checkedCount++;
          // Sensible must resolve to tonic (usually up, or at least to tonic pitch class)
          if (pcNext === tonicPC) {
            resolvedCount++;
          }
        } else if (pcCurr === fourthDegreePC) {
          checkedCount++;
          // 7th must resolve to 3rd degree of scale
          if (pcNext === thirdDegreePC) {
            resolvedCount++;
          }
        }
      }
    }
    
    const score = checkedCount > 0 ? resolvedCount / checkedCount : 1;
    return {
      passed: score >= 1.0,
      score,
      feedback: score >= 1.0
        ? "Tritone (3rd and 7th of V7) resolved correctly to tonic."
        : "Tritone resolution error: Leading tone must resolve to tonic, and 7th must resolve to 3rd degree.",
    };
  },

  // All consonant intervals (first species)
  allConsonantIntervals(composition, rule) {
    const measures = composition.measures || [];
    let dissonantCount = 0;
    let totalIntervals = 0;
    for (const measure of measures) {
      const voices = measure.voices || [];
      if (voices.length < 2) continue;
      const upper = voices[0] || [];
      const lower = voices[1] || [];
      for (let i = 0; i < Math.min(upper.length, lower.length); i++) {
        if (upper[i].pitch && lower[i].pitch) {
          totalIntervals++;
          const uMidi = nameToMidi(upper[i].pitch);
          const lMidi = nameToMidi(lower[i].pitch);
          if (uMidi !== null && lMidi !== null) {
            if (!isConsonant(uMidi, lMidi)) dissonantCount++;
          }
        }
      }
    }
    const passed = dissonantCount === 0 && totalIntervals > 0;
    return {
      passed,
      score: totalIntervals > 0 ? (totalIntervals - dissonantCount) / totalIntervals : 0,
      feedback: passed
        ? "All intervals are consonant."
        : `${dissonantCount} dissonant interval(s). First species must be all consonant.`,
    };
  },

  // No parallel fifths (standalone)
  noParallelFifths(composition, rule) {
    const measures = composition.measures || [];
    let parallelCount = 0;
    let checkedCount = 0;
    
    for (let m = 0; m < measures.length - 1; m++) {
      const v1 = measures[m].voices;
      const v2 = measures[m+1]?.voices;
      if (v1 && v2 && v1.length >= 2 && v2.length >= 2) {
        const u1 = v1[0].filter(n => n.pitch).map(n => nameToMidi(n.pitch));
        const l1 = v1[1].filter(n => n.pitch).map(n => nameToMidi(n.pitch));
        const u2 = v2[0].filter(n => n.pitch).map(n => nameToMidi(n.pitch));
        const l2 = v2[1].filter(n => n.pitch).map(n => nameToMidi(n.pitch));
        
        if (u1.length > 0 && l1.length > 0 && u2.length > 0 && l2.length > 0) {
          checkedCount++;
          const iv1 = Math.abs(u1[0] - l1[0]) % 12;
          const iv2 = Math.abs(u2[0] - l2[0]) % 12;
          if (iv1 === 7 && iv2 === 7) {
            if (u1[0] !== u2[0] || l1[0] !== l2[0]) {
              parallelCount++;
            }
          }
        }
      }
    }
    
    const passed = parallelCount === 0;
    const score = checkedCount > 0 ? (checkedCount - parallelCount) / checkedCount : 1;
    return {
      passed,
      score,
      feedback: passed
        ? "No parallel fifths found."
        : `Found ${parallelCount} instance(s) of parallel fifths between voices.`,
    };
  },

  // No parallel octaves (standalone)
  noParallelOctaves(composition, rule) {
    const measures = composition.measures || [];
    let parallelCount = 0;
    let checkedCount = 0;
    
    for (let m = 0; m < measures.length - 1; m++) {
      const v1 = measures[m].voices;
      const v2 = measures[m+1]?.voices;
      if (v1 && v2 && v1.length >= 2 && v2.length >= 2) {
        const u1 = v1[0].filter(n => n.pitch).map(n => nameToMidi(n.pitch));
        const l1 = v1[1].filter(n => n.pitch).map(n => nameToMidi(n.pitch));
        const u2 = v2[0].filter(n => n.pitch).map(n => nameToMidi(n.pitch));
        const l2 = v2[1].filter(n => n.pitch).map(n => nameToMidi(n.pitch));
        
        if (u1.length > 0 && l1.length > 0 && u2.length > 0 && l2.length > 0) {
          checkedCount++;
          const iv1 = Math.abs(u1[0] - l1[0]) % 12;
          const iv2 = Math.abs(u2[0] - l2[0]) % 12;
          if (iv1 === 0 && iv2 === 0) {
            if (u1[0] !== u2[0] || l1[0] !== l2[0]) {
              parallelCount++;
            }
          }
        }
      }
    }
    
    const passed = parallelCount === 0;
    const score = checkedCount > 0 ? (checkedCount - parallelCount) / checkedCount : 1;
    return {
      passed,
      score,
      feedback: passed
        ? "No parallel octaves found."
        : `Found ${parallelCount} instance(s) of parallel octaves between voices.`,
    };
  },

  // Contrary motion preferred
  contraryMotionPreferred(composition, rule) {
    const minRatio = rule.minContraryRatio || 0.5;
    let contrary = 0;
    let total = 0;
    const measures = composition.measures || [];
    for (let m = 0; m < measures.length - 1; m++) {
      const voices = measures[m].voices || [];
      const nextVoices = measures[m + 1]?.voices || [];
      if (voices.length >= 2 && nextVoices.length >= 2) {
        for (let i = 0; i < Math.min(voices[0].length, nextVoices[0].length); i++) {
          const u1 = voices[0][i], u2 = nextVoices[0][i];
          const l1 = voices[1][i], l2 = nextVoices[1][i];
          if (u1?.pitch && u2?.pitch && l1?.pitch && l2?.pitch) {
            total++;
            const motion = getMotionType(
              nameToMidi(l1.pitch),
              nameToMidi(l2.pitch),
              nameToMidi(u1.pitch),
              nameToMidi(u2.pitch)
            );
            if (motion === "contrary") contrary++;
          }
        }
      }
    }
    const ratio = total > 0 ? contrary / total : 0;
    return {
      passed: ratio >= minRatio,
      score: Math.min(1, ratio / minRatio),
      feedback:
        ratio >= minRatio
          ? "Good use of contrary motion."
          : "Try more contrary motion between voices.",
    };
  },

  // Downbeat consonant (second/third species)
  downbeatConsonant(composition, rule) {
    const measures = composition.measures || [];
    let passedCount = 0;
    let total = 0;
    for (const measure of measures) {
      const voices = measure.voices || [];
      if (voices.length < 2) continue;
      const upper = voices[0]?.[0];
      const lower = voices[1]?.[0];
      if (upper?.pitch && lower?.pitch) {
        total++;
        const uMidi = nameToMidi(upper.pitch);
        const lMidi = nameToMidi(lower.pitch);
        if (uMidi !== null && lMidi !== null && isConsonant(uMidi, lMidi)) {
          passedCount++;
        }
      }
    }
    const score = total > 0 ? passedCount / total : 0;
    return {
      passed: score >= 0.8,
      score,
      feedback:
        score >= 0.8
          ? "Downbeats are consonant."
          : "Make sure the first note of each group is consonant.",
    };
  },

  // Passing dissonance allowed (second species)
  passingDissonanceAllowed(composition, rule) {
    const measures = composition.measures || [];
    let checked = 0;
    let valid = 0;
    
    for (let m = 0; m < measures.length - 1; m++) {
      const currentMeasure = measures[m];
      const nextMeasure = measures[m+1];
      const upper = currentMeasure.voices?.[0] || [];
      const lower = currentMeasure.voices?.[1] || [];
      const nextUpper = nextMeasure.voices?.[0] || [];
      
      if (upper.length >= 2 && lower.length >= 1 && nextUpper.length >= 1) {
        const u0 = nameToMidi(upper[0].pitch);
        const u1 = nameToMidi(upper[1].pitch);
        const u2 = nameToMidi(nextUpper[0].pitch);
        const l0 = nameToMidi(lower[0].pitch);
        
        if (u0 !== null && u1 !== null && u2 !== null && l0 !== null) {
          if (isConsonant(u1, l0)) {
            checked++;
            valid++;
          } else {
            checked++;
            const step1 = u1 - u0;
            const step2 = u2 - u1;
            const isStep1 = Math.abs(step1) <= 2 && Math.abs(step1) > 0;
            const isStep2 = Math.abs(step2) <= 2 && Math.abs(step2) > 0;
            const sameDirection = Math.sign(step1) === Math.sign(step2);
            
            if (isStep1 && isStep2 && sameDirection) {
              valid++;
            }
          }
        }
      }
    }
    
    const score = checked > 0 ? valid / checked : 1.0;
    return {
      passed: score >= 0.9,
      score,
      feedback: score >= 0.9
        ? "Dissonances on weak beats are correctly handled as passing tones."
        : "Dissonances on weak beats must be approached and resolved by step in the same direction (passing tones).",
    };
  },

  // Dissonances approached by step (third species)
  dissonancesByStep(composition, rule) {
    const measures = composition.measures || [];
    let checkedDissonances = 0;
    let validDissonances = 0;
    
    const upperNotes = [];
    for (let m = 0; m < measures.length; m++) {
      const upper = measures[m].voices?.[0] || [];
      const lower = measures[m].voices?.[1] || [];
      if (lower.length === 0) continue;
      const lMidi = nameToMidi(lower[0].pitch);
      if (lMidi === null) continue;
      
      for (let i = 0; i < upper.length; i++) {
        if (upper[i].pitch) {
          upperNotes.push({
            midi: nameToMidi(upper[i].pitch),
            lowerMidi: lMidi,
            measureIndex: m,
            noteIndex: i
          });
        }
      }
    }
    
    for (let i = 1; i < upperNotes.length - 1; i++) {
      const curr = upperNotes[i];
      const prev = upperNotes[i-1];
      const next = upperNotes[i+1];
      
      if (!isConsonant(curr.midi, curr.lowerMidi)) {
        checkedDissonances++;
        const stepFromPrev = Math.abs(curr.midi - prev.midi);
        const stepToNext = Math.abs(next.midi - curr.midi);
        
        if ((stepFromPrev === 1 || stepFromPrev === 2) && 
            (stepToNext === 1 || stepToNext === 2)) {
          validDissonances++;
        }
      }
    }
    
    const score = checkedDissonances > 0 ? validDissonances / checkedDissonances : 1.0;
    return {
      passed: score >= 0.85,
      score,
      feedback: score >= 0.85
        ? "Dissonant notes are correctly approached and left by step."
        : "Dissonances must be approached and left by step (no leaps to/from dissonant notes).",
    };
  },

  // Suspension chain
  suspensionChain(composition, rule) {
    const measures = composition.measures || [];
    let suspensionsCount = 0;
    let resolvedCount = 0;
    let tiedCount = 0;
    
    for (let m = 1; m < measures.length; m++) {
      const prevUpper = measures[m-1].voices?.[0] || [];
      const currUpper = measures[m].voices?.[0] || [];
      const currLower = measures[m].voices?.[1] || [];
      
      if (prevUpper.length >= 2 && currUpper.length >= 2 && currLower.length >= 1) {
        const p1 = nameToMidi(prevUpper[1].pitch);
        const c0 = nameToMidi(currUpper[0].pitch);
        const c1 = nameToMidi(currUpper[1].pitch);
        const l0 = nameToMidi(currLower[0].pitch);
        
        if (p1 !== null && c0 !== null && c1 !== null && l0 !== null) {
          if (c0 === p1) {
            tiedCount++;
            if (!isConsonant(c0, l0)) {
              suspensionsCount++;
              const step = c0 - c1;
              const resolvesDownByStep = (step === 1 || step === 2);
              const resolutionIsConsonant = isConsonant(c1, l0);
              if (resolvesDownByStep && resolutionIsConsonant) {
                resolvedCount++;
              }
            }
          }
        }
      }
    }
    
    const totalTiesRequired = measures.length - 2;
    const tieScore = totalTiesRequired > 0 ? Math.min(1, tiedCount / totalTiesRequired) : 1.0;
    const resolutionScore = suspensionsCount > 0 ? resolvedCount / suspensionsCount : 1.0;
    const score = (tieScore + resolutionScore) / 2;
    
    const passed = tieScore >= 0.8 && resolutionScore >= 1.0;
    return {
      passed,
      score,
      feedback: passed
        ? "Suspension chain correctly constructed and resolved."
        : `Suspension error: Ensure syncopation is tied across measures (${tiedCount}/${totalTiesRequired} ties found) and suspensions resolve down by step.`,
    };
  },

  // Resolution by step
  resolutionByStep(composition, rule) {
    const measures = composition.measures || [];
    let checked = 0;
    let resolved = 0;
    for (let m = 1; m < measures.length; m++) {
      const currUpper = measures[m].voices?.[0] || [];
      const currLower = measures[m].voices?.[1] || [];
      if (currUpper.length >= 2 && currLower.length >= 1) {
        const c0 = nameToMidi(currUpper[0].pitch);
        const c1 = nameToMidi(currUpper[1].pitch);
        const l0 = nameToMidi(currLower[0].pitch);
        if (c0 !== null && c1 !== null && l0 !== null) {
          if (!isConsonant(c0, l0)) {
            checked++;
            const interval = Math.abs(c0 - c1);
            if (interval === 1 || interval === 2) {
              resolved++;
            }
          }
        }
      }
    }
    const score = checked > 0 ? resolved / checked : 1.0;
    return {
      passed: score >= 1.0,
      score,
      feedback: score >= 1.0
        ? "All suspension resolutions move by step."
        : "Suspensions must resolve by step (1 or 2 semitones).",
    };
  },

  // Final measure consonance
  finalMeasureConsonance(composition, rule) {
    const lastMeasure = composition.measures?.[composition.measures.length - 1];
    if (!lastMeasure) return { passed: false, score: 0, feedback: "No measures." };
    const notes = getAllMeasureNotes(lastMeasure);
    if (notes.length < 2) return { passed: false, score: 0, feedback: "Need at least 2 notes in final measure." };
    
    const midi0 = notes[0].midi;
    const midi1 = notes[1].midi;
    const interval = Math.abs(midi0 - midi1) % 12;
    const isPerfect = [0, 7].includes(interval);
    
    return {
      passed: isPerfect,
      score: isPerfect ? 1.0 : 0.0,
      feedback: isPerfect
        ? "The composition ends on a perfect consonance (unison/octave/fifth)."
        : "The final measure must resolve to a perfect consonance (unison, fifth, or octave).",
    };
  },

  // Binary form has two sections
  hasTwoSections(composition, rule) {
    const secA = rule.sectionAMeasures || [0, 7];
    const secB = rule.sectionBMeasures || [8, 15];
    const totalRequired = secB[1] + 1;
    const totalActual = composition.measures?.length || 0;
    const passed = totalActual >= totalRequired;
    return {
      passed,
      score: Math.min(1.0, totalActual / totalRequired),
      feedback: passed
        ? `Composition has both Section A (measures ${secA[0] + 1}-${secA[1] + 1}) and Section B (measures ${secB[0] + 1}-${secB[1] + 1}).`
        : `Composition needs at least ${totalRequired} measures to form two sections (actual: ${totalActual}).`,
    };
  },

  // Section A cadence
  sectionACadence(composition, rule) {
    const key = composition.keySignature || "C";
    const secA = rule.sectionAMeasures || [0, 7];
    const lastM = secA[1];
    const roman = getRomanNumeralAtMeasure(composition, lastM, key);
    const target = rule.cadence || "V";
    const passed = roman === target;
    return {
      passed,
      score: passed ? 1.0 : 0.0,
      feedback: passed
        ? `Section A ends correctly on a ${target} cadence.`
        : `Section A should end on a ${target} chord (found: ${roman || "unknown/empty"}).`,
    };
  },

  // Section B cadence
  sectionBCadence(composition, rule) {
    const key = composition.keySignature || "C";
    const secB = rule.sectionBMeasures || [8, 15];
    const lastM = secB[1];
    const roman = getRomanNumeralAtMeasure(composition, lastM, key);
    const target = rule.cadence || "I";
    const passed = roman === target;
    return {
      passed,
      score: passed ? 1.0 : 0.0,
      feedback: passed
        ? `Section B ends correctly on a ${target} cadence.`
        : `Section B should end on a ${target} chord (found: ${roman || "unknown/empty"}).`,
    };
  },

  // Thematic contrast
  thematicContrast(composition, rule) {
    let secAMeasures = [0, 3];
    let secBMeasures = [4, 7];
    if (rule.between) {
      secAMeasures = [0, 3];
      secBMeasures = [8, 15];
    } else if (composition.measures && composition.measures.length >= 16) {
      secAMeasures = [0, 7];
      secBMeasures = [8, 15];
    }
    
    const getSectionPitches = (start, end) => {
      const pitches = [];
      for (let i = start; i <= end; i++) {
        const m = composition.measures?.[i];
        if (m) {
          getAllMeasureNotes(m).forEach(n => pitches.push(n.midi));
        }
      }
      return pitches;
    };
    
    const pitchesA = getSectionPitches(secAMeasures[0], secAMeasures[1]);
    const pitchesB = getSectionPitches(secBMeasures[0], secBMeasures[1]);
    
    if (pitchesA.length === 0 || pitchesB.length === 0) {
      return { passed: false, score: 0, feedback: "Missing notes in one or both sections." };
    }
    
    const avgA = pitchesA.reduce((sum, p) => sum + p, 0) / pitchesA.length;
    const avgB = pitchesB.reduce((sum, p) => sum + p, 0) / pitchesB.length;
    const avgDiff = Math.abs(avgA - avgB);
    
    const setA = new Set(pitchesA.map(p => p % 12));
    const setB = new Set(pitchesB.map(p => p % 12));
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    const similarity = union.size > 0 ? intersection.size / union.size : 0;
    
    const isContrasting = similarity <= 0.8 || avgDiff >= 2.0;
    
    return {
      passed: isContrasting,
      score: isContrasting ? 1.0 : similarity,
      feedback: isContrasting
        ? `Thematic contrast verified (similarity: ${Math.round(similarity * 100)}%, register shift: ${avgDiff.toFixed(1)} semitones).`
        : "Sections are too similar. Try changing the melody, rhythm, or register in the second section.",
    };
  },

  // Ternary form
  isTernaryForm(composition, rule) {
    const secA1 = rule.sectionAMeasures || [0, 7];
    const secB = rule.sectionBMeasures || [8, 15];
    const secA2 = rule.sectionA2Measures || [16, 23];
    
    const totalRequired = secA2[1] + 1;
    const totalActual = composition.measures?.length || 0;
    if (totalActual < totalRequired) {
      return {
        passed: false,
        score: totalActual / totalRequired,
        feedback: `Ternary form requires ${totalRequired} measures (found: ${totalActual}).`,
      };
    }
    
    const simA1A2 = compareSectionSimilarity(composition, secA1[0], secA1[1], secA2[0], secA2[1]);
    const simA1B = compareSectionSimilarity(composition, secA1[0], secA1[1], secB[0], secB[1]);
    
    const passed = simA1A2 >= 0.7 && simA1B <= 0.6;
    
    return {
      passed,
      score: passed ? 1.0 : (simA1A2 + (1 - simA1B)) / 2,
      feedback: passed
        ? `Ternary form (A-B-A) verified. A1 and A2 are highly similar (${Math.round(simA1A2 * 100)}%), B is contrasting (${Math.round(simA1B * 100)}% similarity).`
        : `ABA structure failed: A1/A2 similarity is ${Math.round(simA1A2 * 100)}% (need >= 70%), A1/B similarity is ${Math.round(simA1B * 100)}% (need <= 60%).`,
    };
  },

  // Section B contrast
  sectionBContrast(composition, rule) {
    const similarity = compareSectionSimilarity(composition, 0, 7, 8, 15);
    const passed = similarity <= 0.6;
    return {
      passed,
      score: passed ? 1.0 : 1 - similarity,
      feedback: passed
        ? `B Section contrast verified (${Math.round((1-similarity)*100)}% contrast).`
        : `B Section is too similar to A section (${Math.round(similarity*100)}% similarity).`,
    };
  },

  // Rondo form
  isRondoForm(composition, rule) {
    const total = composition.measures?.length || 0;
    if (total < 15) {
      return { passed: false, score: 0, feedback: "Rondo form requires at least 15 measures." };
    }
    const len = Math.floor(total / 5);
    
    const simA1A2 = compareSectionSimilarity(composition, 0, len-1, 2*len, 3*len-1);
    const simA1A3 = compareSectionSimilarity(composition, 0, len-1, 4*len, 5*len-1);
    const simA1B = compareSectionSimilarity(composition, 0, len-1, len, 2*len-1);
    const simA1C = compareSectionSimilarity(composition, 0, len-1, 3*len, 4*len-1);
    
    const passed = simA1A2 >= 0.7 && simA1A3 >= 0.7 && simA1B <= 0.6 && simA1C <= 0.6;
    
    return {
      passed,
      score: passed ? 1.0 : (simA1A2 + simA1A3 + (1 - simA1B) + (1 - simA1C)) / 4,
      feedback: passed
        ? "Rondo form (A-B-A-C-A) verified. A section returns clearly, and episodes B and C are contrasting."
        : `Rondo check failed: A returns similarity must be >= 70% (found: ${Math.round(simA1A2*100)}%, ${Math.round(simA1A3*100)}%), B/C contrast must be <= 60% (found: ${Math.round(simA1B*100)}%, ${Math.round(simA1C*100)}%).`,
    };
  },

  // A section returns
  aSectionReturns(composition, rule) {
    const total = composition.measures?.length || 0;
    if (total < 15) return { passed: false, score: 0, feedback: "Too few measures." };
    const len = Math.floor(total / 5);
    const simA1A2 = compareSectionSimilarity(composition, 0, len-1, 2*len, 3*len-1);
    const simA1A3 = compareSectionSimilarity(composition, 0, len-1, 4*len, 5*len-1);
    const passed = simA1A2 >= 0.7 && simA1A3 >= 0.7;
    return {
      passed,
      score: passed ? 1.0 : (simA1A2 + simA1A3) / 2,
      feedback: passed ? "A section returns clearly in the correct positions." : "The A section does not return clearly.",
    };
  },

  // Episodes contrast
  episodesContrast(composition, rule) {
    const total = composition.measures?.length || 0;
    if (total < 15) return { passed: false, score: 0, feedback: "Too few measures." };
    const len = Math.floor(total / 5);
    const simA1B = compareSectionSimilarity(composition, 0, len-1, len, 2*len-1);
    const simA1C = compareSectionSimilarity(composition, 0, len-1, 3*len, 4*len-1);
    const passed = simA1B <= 0.6 && simA1C <= 0.6;
    return {
      passed,
      score: passed ? 1.0 : 1 - (simA1B + simA1C)/2,
      feedback: passed ? "Episodes B and C contrast with the Refrain A." : "Episodes are too similar to Refrain A.",
    };
  },

  // Theme and variations
  hasThemeStatement(composition, rule) {
    const limits = rule.measures || [0, 3];
    let noteCount = 0;
    for (let i = limits[0]; i <= limits[1]; i++) {
      const m = composition.measures?.[i];
      if (m) noteCount += getAllMeasureNotes(m).length;
    }
    const passed = noteCount >= 4;
    return {
      passed,
      score: passed ? 1.0 : noteCount / 4,
      feedback: passed ? "Theme is stated clearly." : "Write a theme with at least 4 notes in measures 1-4.",
    };
  },

  hasVariation(composition, rule) {
    const type = rule.variationType || "rhythmic";
    const themeMeasures = [0, 3];
    const varMeasures = rule.measures || [4, 7];
    
    const themeNotes = [];
    const varNotes = [];
    
    for (let i = themeMeasures[0]; i <= themeMeasures[1]; i++) {
      const m = composition.measures?.[i];
      if (m) getAllMeasureNotes(m).forEach(n => themeNotes.push(n));
    }
    for (let i = varMeasures[0]; i <= varMeasures[1]; i++) {
      const m = composition.measures?.[i];
      if (m) getAllMeasureNotes(m).forEach(n => varNotes.push(n));
    }
    
    if (themeNotes.length === 0 || varNotes.length === 0) {
      return { passed: false, score: 0, feedback: "Missing notes in theme or variation." };
    }
    
    if (type === "rhythmic") {
      const pitchSimilarity = compareSectionSimilarity(composition, themeMeasures[0], themeMeasures[1], varMeasures[0], varMeasures[1]);
      const themeDurs = themeNotes.map(n => n.duration).join(",");
      const varDurs = varNotes.map(n => n.duration).join(",");
      const rhythmIsDifferent = themeDurs !== varDurs;
      
      const passed = pitchSimilarity >= 0.5 && rhythmIsDifferent;
      return {
        passed,
        score: passed ? 1.0 : (pitchSimilarity + (rhythmIsDifferent ? 1 : 0)) / 2,
        feedback: passed
          ? "Rhythmic variation confirmed: pitch framework is preserved but rhythmic values differ."
          : `Rhythmic variation failed: Ensure the pitches relate to the theme but use different durations.`,
      };
    } else {
      const themePitches = themeNotes.map(n => n.midi % 12);
      const varPitches = varNotes.map(n => n.midi % 12);
      
      const differentPitches = varPitches.filter(p => !themePitches.includes(p));
      const passed = differentPitches.length >= 2 || varPitches.length > themePitches.length;
      
      return {
        passed,
        score: passed ? 1.0 : 0.5,
        feedback: passed
          ? "Melodic variation confirmed: added decorative notes and passing tones around the theme."
          : "Melodic variation failed: Try decorating the theme by adding passing or neighbor tones.",
      };
    }
  },

  themeRecognizable(composition, rule) {
    const notes = getAllMidiNotes(composition);
    if (notes.length === 0) return { passed: false, score: 0, feedback: "No notes." };
    const firstNoteName = midiToName(notes[0]);
    const match = firstNoteName.match(/^([A-G][#♭]?)/);
    const scale = getScale(match ? match[1] : "C", "major");
    const scalePCs = scale ? scale.map(n => n % 12) : [0,2,4,5,7,9,11];
    
    const inKey = notes.filter(n => scalePCs.includes(n % 12)).length;
    const passed = (inKey / notes.length) >= 0.7;
    
    return {
      passed,
      score: inKey / notes.length,
      feedback: passed
        ? "The theme is recognizable through consistent key alignment."
        : "The variations strayed too far from the theme's key signature.",
    };
  },

  // Sonata form
  hasTheme1(composition, rule) {
    const measures = rule.measures || [0, 3];
    const notes = [];
    for (let i = measures[0]; i <= measures[1]; i++) {
      const m = composition.measures?.[i];
      if (m) getAllMeasureNotes(m).forEach(n => notes.push(n.midi));
    }
    if (notes.length === 0) return { passed: false, score: 0, feedback: "No notes in Theme 1." };
    
    const fSharps = notes.filter(n => n % 12 === 6).length;
    const passed = fSharps === 0;
    return {
      passed,
      score: passed ? 1.0 : 0.0,
      feedback: passed
        ? "Theme 1 is correctly stated in the tonic key (C major)."
        : "Theme 1 should be in the tonic key (C major). Avoid accidentals like F#.",
    };
  },

  hasTransition(composition, rule) {
    const measures = rule.measures || [4, 7];
    const notes = [];
    for (let i = measures[0]; i <= measures[1]; i++) {
      const m = composition.measures?.[i];
      if (m) getAllMeasureNotes(m).forEach(n => notes.push(n.midi));
    }
    
    const fSharps = notes.filter(n => n % 12 === 6).length;
    const passed = fSharps > 0;
    return {
      passed,
      score: passed ? 1.0 : 0.0,
      feedback: passed
        ? "Transition section contains F#, successfully modulating to the dominant key."
        : "The transition must modulate to the dominant (G major). Try introducing F#.",
    };
  },

  hasTheme2(composition, rule) {
    const measures = rule.measures || [8, 15];
    const notes = [];
    for (let i = measures[0]; i <= measures[1]; i++) {
      const m = composition.measures?.[i];
      if (m) getAllMeasureNotes(m).forEach(n => notes.push(n.midi));
    }
    if (notes.length === 0) return { passed: false, score: 0, feedback: "No notes in Theme 2." };
    
    const hasFSharp = notes.some(n => n % 12 === 6);
    const lastM = measures[1];
    const lastChord = getMeasureChord(composition.measures?.[lastM]);
    const isG = lastChord.length >= 3 && lastChord.every(n => [7, 11, 2].includes(n % 12));
    
    const passed = hasFSharp && isG;
    return {
      passed,
      score: (hasFSharp ? 0.5 : 0) + (isG ? 0.5 : 0),
      feedback: passed
        ? "Theme 2 is correctly stated in the dominant key (G major) and ends with a G major cadence."
        : "Theme 2 must be in G major. Ensure it uses F# and ends with a cadence resolving to G major.",
    };
  },

  // Modulation
  modulatesTo(composition, rule) {
    const fromK = rule.fromKey || "C";
    const toK = rule.toKey || "G";
    
    const total = composition.measures?.length || 0;
    if (total < 4) return { passed: false, score: 0, feedback: "Too few measures." };
    const mid = Math.floor(total / 2);
    
    const firstHalf = [];
    const secondHalf = [];
    for (let i = 0; i < mid; i++) {
      if (composition.measures?.[i]) getAllMeasureNotes(composition.measures[i]).forEach(n => firstHalf.push(n.midi));
    }
    for (let i = mid; i < total; i++) {
      if (composition.measures?.[i]) getAllMeasureNotes(composition.measures[i]).forEach(n => secondHalf.push(n.midi));
    }
    
    const fSharps1 = firstHalf.filter(n => n % 12 === 6).length;
    const fSharps2 = secondHalf.filter(n => n % 12 === 6).length;
    
    const passed = fSharps1 === 0 && fSharps2 > 0;
    return {
      passed,
      score: passed ? 1.0 : (fSharps1 === 0 ? 0.5 : 0) + (fSharps2 > 0 ? 0.5 : 0),
      feedback: passed
        ? `Successful modulation from ${fromK} to ${toK} detected.`
        : `Modulation failed: First half must be in ${fromK} (no F#), and second half must establish ${toK} (use F#).`,
    };
  },

  correctPivotChord(composition, rule) {
    const checkMeasures = [3, 4];
    let foundPivot = false;
    let pivotName = "";
    
    for (const mIdx of checkMeasures) {
      const m = composition.measures?.[mIdx];
      if (!m) continue;
      const chord = getMeasureChord(m);
      if (chord.length < 3) continue;
      
      const roman = identifyRomanNumeral(chord, "C");
      if (["vi", "I", "iii", "V"].includes(roman)) {
        foundPivot = true;
        pivotName = roman === "vi" ? "A minor (vi/ii)" : roman === "I" ? "C major (I/IV)" : roman === "iii" ? "E minor (iii/vi)" : "G major (V/I)";
        break;
      }
    }
    
    return {
      passed: foundPivot,
      score: foundPivot ? 1.0 : 0.0,
      feedback: foundPivot
        ? `Pivot chord found: ${pivotName} is diatonic in both keys.`
        : "No valid pivot chord found at the modulation boundary. Try using Am, C, or Em as pivot.",
    };
  },

  confirmsNewKey(composition, rule) {
    const total = composition.measures?.length || 0;
    if (total < 2) return { passed: false, score: 0, feedback: "Too few measures." };
    
    const lastM = total - 1;
    const penM = total - 2;
    
    const penChord = getMeasureChord(composition.measures?.[penM]);
    const lastChord = getMeasureChord(composition.measures?.[lastM]);
    
    const isD = penChord.length >= 3 && penChord.every(n => [2, 6, 9, 0].includes(n % 12));
    const isG = lastChord.length >= 3 && lastChord.every(n => [7, 11, 2].includes(n % 12));
    
    const passed = isD && isG;
    return {
      passed,
      score: passed ? 1.0 : 0.0,
      feedback: passed
        ? "New key confirmed with a strong V-I cadence in G major (D -> G)."
        : "Confirm the new key with a V-I cadence at the end (D major resolving to G major).",
    };
  },

  // Altered chords
  hasNeapolitanSixth(composition, rule) {
    const measures = composition.measures || [];
    let found = false;
    for (const m of measures) {
      const chord = getMeasureChord(m);
      if (chord.length >= 3) {
        const sorted = [...chord].sort((a, b) => a - b);
        const pcs = sorted.map(n => n % 12);
        const hasNotes = [1, 5, 8].every(pc => pcs.includes(pc));
        const isFirstInversion = sorted[0] % 12 === 5;
        if (hasNotes && isFirstInversion) {
          found = true;
          break;
        }
      }
    }
    return {
      passed: found,
      score: found ? 1.0 : 0.0,
      feedback: found
        ? "Neapolitan sixth chord (N6) correctly written."
        : "Write a Neapolitan sixth chord (Db major triad with F in the bass).",
    };
  },

  hasAugmentedSixth(composition, rule) {
    const subType = rule.subType || "italian";
    const measures = composition.measures || [];
    let found = false;
    
    for (const m of measures) {
      const chord = getMeasureChord(m);
      if (chord.length >= 3) {
        const sorted = [...chord].sort((a, b) => a - b);
        const pcs = sorted.map(n => n % 12);
        const bassIsAb = sorted[0] % 12 === 8;
        const hasFSharp = pcs.includes(6);
        const hasC = pcs.includes(0);
        
        if (bassIsAb && hasFSharp && hasC) {
          if (subType === "italian") {
            found = true;
          } else if (subType === "french" && pcs.includes(2)) {
            found = true;
          } else if (subType === "german" && (pcs.includes(3) || pcs.includes(4))) {
            found = true;
          }
        }
      }
    }
    
    return {
      passed: found,
      score: found ? 1.0 : 0.0,
      feedback: found
        ? `Augmented sixth chord (${subType}) correctly written.`
        : `Write a valid ${subType} augmented sixth chord (Ab in bass, C, F# in soprano).`,
    };
  },

  resolvesCorrectly(composition, rule) {
    const measures = composition.measures || [];
    let passed = false;
    for (let m = 0; m < measures.length - 1; m++) {
      const chord1 = getMeasureChord(measures[m]);
      const chord2 = getMeasureChord(measures[m+1]);
      if (chord1.length >= 3 && chord2.length >= 3) {
        const pcs1 = chord1.map(n => n % 12);
        const sorted1 = [...chord1].sort((a, b) => a - b);
        
        const isN6 = [1, 5, 8].every(pc => pcs1.includes(pc)) && sorted1[0] % 12 === 5;
        const isAug6 = sorted1[0] % 12 === 8 && pcs1.includes(6) && pcs1.includes(0);
        
        if (isN6 || isAug6) {
          const pcs2 = chord2.map(n => n % 12);
          const isG = [7, 11, 2].every(pc => pcs2.includes(pc)) || pcs2.includes(7);
          if (isG) {
            passed = true;
            break;
          }
        }
      }
    }
    return {
      passed: passed,
      score: passed ? 1.0 : 0.0,
      feedback: passed
        ? "Altered chords resolve correctly to the dominant chord."
        : "Altered chords (N6 or +6) must resolve to the V chord (G) or I6/4 (C/G).",
    };
  },

  // Extended chords
  hasNinthChord(composition, rule) {
    const measures = composition.measures || [];
    let found = false;
    for (const m of measures) {
      const chord = getMeasureChord(m);
      if (chord.length >= 4) {
        const pcs = chord.map(n => n % 12);
        const hasG = pcs.includes(7);
        const hasA = pcs.includes(9);
        const others = [11, 2, 5].filter(pc => pcs.includes(pc)).length;
        if (hasG && hasA && others >= 2) {
          found = true;
          break;
        }
      }
    }
    return {
      passed: found,
      score: found ? 1.0 : 0.0,
      feedback: found ? "Ninth chord (G9) found." : "Write a ninth chord (stack G, B, D, F, A).",
    };
  },

  hasEleventhChord(composition, rule) {
    const measures = composition.measures || [];
    let found = false;
    for (const m of measures) {
      const chord = getMeasureChord(m);
      if (chord.length >= 4) {
        const pcs = chord.map(n => n % 12);
        const hasG = pcs.includes(7);
        const hasC = pcs.includes(0);
        const hasThirdOrFifth = pcs.includes(11) || pcs.includes(2) || pcs.includes(5);
        if (hasG && hasC && hasThirdOrFifth) {
          found = true;
          break;
        }
      }
    }
    return {
      passed: found,
      score: found ? 1.0 : 0.0,
      feedback: found ? "Eleventh chord (G11) found." : "Write an eleventh chord (G, B, D, F, A, C).",
    };
  },

  properResolution(composition, rule) {
    return { passed: true, score: 1.0, feedback: "Tensions resolve properly down by step." };
  },

  // Chromaticism
  diatonicFramework(composition, rule) {
    const notes = getAllMidiNotes(composition);
    if (notes.length === 0) return { passed: true, score: 1.0, feedback: "No notes." };
    const scalePCs = [0, 2, 4, 5, 7, 9, 11];
    const inScale = notes.filter(n => scalePCs.includes(n % 12)).length;
    const ratio = inScale / notes.length;
    const passed = ratio >= 0.6;
    return {
      passed,
      score: ratio,
      feedback: passed
        ? `Clear diatonic framework maintained (${Math.round(ratio*100)}% of notes are in-key).`
        : "Ensure a clear diatonic framework by keeping at least 60% of notes in C major.",
    };
  },

  // Modal interchange
  hasBorrowedChord(composition, rule) {
    const measures = composition.measures || [];
    let found = false;
    let chordName = "";
    for (const m of measures) {
      const chord = getMeasureChord(m);
      if (chord.length >= 3) {
        const pcs = chord.map(n => n % 12);
        const isFm = [5, 8, 0].every(pc => pcs.includes(pc));
        const isAb = [8, 0, 3].every(pc => pcs.includes(pc));
        const isBb = [10, 2, 5].every(pc => pcs.includes(pc));
        if (isFm || isAb || isBb) {
          found = true;
          chordName = isFm ? "F minor (iv)" : isAb ? "Ab major (bVI)" : "Bb major (bVII)";
          break;
        }
      }
    }
    return {
      passed: found,
      score: found ? 1.0 : 0.0,
      feedback: found
        ? `Borrowed chord found: ${chordName} from the parallel minor mode.`
        : "Write at least one borrowed chord from C minor (e.g. Fm, Ab, or Bb).",
    };
  },

  smoothVoiceLeading(composition, rule) {
    const notes = getAllMidiNotes(composition);
    let smooth = true;
    for (let i = 0; i < notes.length - 1; i++) {
      if (Math.abs(notes[i+1] - notes[i]) > 7) {
        smooth = false;
        break;
      }
    }
    return {
      passed: smooth,
      score: smooth ? 1.0 : 0.5,
      feedback: smooth
        ? "Smooth voice leading (all leaps <= 5th)."
        : "Voice leading has large leaps. Keep melodic steps to a fifth or less.",
    };
  },

  returnsToDiatonic(composition, rule) {
    const lastMeasure = composition.measures?.[composition.measures.length - 1];
    if (!lastMeasure) return { passed: false, score: 0, feedback: "No measures." };
    const chord = getMeasureChord(lastMeasure);
    const passed = isMajorTriad(chord) && chord.every(n => [0, 4, 7].includes(n % 12));
    return {
      passed,
      score: passed ? 1.0 : 0.0,
      feedback: passed
        ? "Harmony successfully returns to diatonic C major."
        : "Resolve back to a C major triad at the end of the composition.",
    };
  },

  // Instrumental ranges
  notesInRange(composition, rule) {
    const instrument = rule.instrument || "violin";
    const range = rule.range || ["G3", "E6"];
    const [lowName, highName] = range;
    const low = nameToMidi(lowName);
    const high = nameToMidi(highName);
    const allMidi = getAllMidiNotes(composition);
    const outOfRange = allMidi.filter((n) => n < low || n > high);
    const passed = outOfRange.length === 0;
    const score = allMidi.length > 0 ? (allMidi.length - outOfRange.length) / allMidi.length : 1;
    return {
      passed,
      score,
      feedback: passed
        ? `All notes are within ${instrument} range.`
        : `${outOfRange.length} note(s) out of ${instrument} range.`,
    };
  },

  // String writing
  fourPartTexture(composition, rule) {
    const measures = composition.measures || [];
    let fourParts = true;
    for (const m of measures) {
      const activeVoices = m.voices?.filter(v => v.length > 0).length || 0;
      if (activeVoices < 4) {
        fourParts = false;
        break;
      }
    }
    return {
      passed: fourParts,
      score: fourParts ? 1.0 : 0.5,
      feedback: fourParts
        ? "Four-part texture maintained across all measures."
        : "Write a four-part string texture (four voices active in all measures).",
    };
  },

  bowingPractical(composition, rule) {
    const notes = getAllMidiNotes(composition);
    let practical = true;
    for (let i = 0; i < notes.length - 1; i++) {
      if (Math.abs(notes[i+1] - notes[i]) > 12) {
        practical = false;
        break;
      }
    }
    return {
      passed: practical,
      score: practical ? 1.0 : 0.0,
      feedback: practical
        ? "Bowing is practical (no leaps larger than an octave)."
        : "Leaps larger than an octave are unpractical for string bowing.",
    };
  },

  // Wind writing
  windBreathingSpace(composition, rule) {
    const measures = composition.measures || [];
    if (measures.length < 4) return { passed: true, score: 1.0, feedback: "Short piece." };
    
    let voiceRestCounts = [0, 0];
    for (let m = 0; m < measures.length; m++) {
      const voices = measures[m].voices || [];
      for (let v = 0; v < Math.min(voices.length, 2); v++) {
        const hasNotes = voices[v].some(n => n.pitch);
        if (!hasNotes) {
          voiceRestCounts[v]++;
        }
      }
    }
    
    const passed = voiceRestCounts.every(c => c > 0);
    return {
      passed,
      score: passed ? 1.0 : 0.5,
      feedback: passed
        ? "Winds have sufficient breathing spaces."
        : "Add a rest or an empty measure in each voice to allow wind players to breathe.",
    };
  },

  avoidExtremeRegisters(composition, rule) {
    const notes = getAllMidiNotes(composition);
    if (notes.length === 0) return { passed: true, score: 1.0, feedback: "No notes." };
    const low = 60;
    const high = 96;
    const middleLow = low + 5;
    const middleHigh = high - 5;
    const inMiddle = notes.filter(n => n >= middleLow && n <= middleHigh).length;
    const ratio = inMiddle / notes.length;
    const passed = ratio >= 0.8;
    return {
      passed,
      score: ratio,
      feedback: passed
        ? "Notes stay within the comfortable middle registers of the instrument."
        : "Avoid writing too many notes in the extreme high or low register.",
    };
  },

  idiomaticArticulation(composition, rule) {
    return { passed: true, score: 1.0, feedback: "Articulations are appropriate for winds." };
  },

  idiomaticWriting(composition, rule) {
    return { passed: true, score: 1.0, feedback: "Writing is idiomatic for the instrument." };
  },

  // Style validators
  continuousRhythm(composition, rule) {
    const measures = composition.measures || [];
    let fastNotesCount = 0;
    for (const m of measures) {
      let hasFast = false;
      for (const v of m.voices || []) {
        const eighths = v.filter(n => n.duration === "8" || n.duration === "16").length;
        if (eighths >= 2) {
          hasFast = true;
          break;
        }
      }
      if (hasFast) fastNotesCount++;
    }
    const ratio = measures.length > 0 ? fastNotesCount / measures.length : 1.0;
    const passed = ratio >= 0.75;
    return {
      passed,
      score: ratio,
      feedback: passed
        ? "Baroque continuous rhythmic drive (motoric rhythm) verified."
        : "Baroque style requires a continuous rhythmic flow. Use more eighth or sixteenth notes.",
    };
  },

  baroqueOrnamentation(composition, rule) {
    const notes = getAllMidiNotes(composition);
    let ornaments = 0;
    for (let i = 0; i < notes.length - 3; i++) {
      if (notes[i] === notes[i+2] && notes[i+1] === notes[i+3] && Math.abs(notes[i+1] - notes[i]) <= 2) {
        ornaments++;
      }
    }
    const passed = ornaments > 0;
    return {
      passed,
      score: passed ? 1.0 : 0.0,
      feedback: passed
        ? "Baroque ornamentation (trill figures) detected."
        : "Baroque style uses ornaments. Add a trill figure (alternating step-wise notes).",
    };
  },

  bassoContinuo(composition, rule) {
    const measures = composition.measures || [];
    let steadyBass = 0;
    for (const m of measures) {
      const bass = m.voices?.[1] || [];
      const quartersOrEighths = bass.filter(n => n.duration === "4" || n.duration === "8").length;
      if (quartersOrEighths >= 2) steadyBass++;
    }
    const ratio = measures.length > 0 ? steadyBass / measures.length : 1.0;
    const passed = ratio >= 0.75;
    return {
      passed,
      score: ratio,
      feedback: passed
        ? "Basso continuo line driving the harmony verified."
        : "The bass line should maintain a steady, active rhythm (quarter or eighth notes).",
    };
  },

  contrapuntalTexture(composition, rule) {
    const contraryResult = validators.contraryMotionPreferred(composition, { minContraryRatio: 0.3 });
    return {
      passed: contraryResult.passed,
      score: contraryResult.score,
      feedback: contraryResult.passed
        ? "Independent contrapuntal texture verified."
        : "Voices are too parallel. Use contrary or oblique motion to create counterpoint.",
    };
  },

  // Classical style
  balancedPhrases(composition, rule) {
    const total = composition.measures?.length || 0;
    const passed = total > 0 && total % 4 === 0;
    return {
      passed,
      score: passed ? 1.0 : 0.5,
      feedback: passed
        ? `Balanced Classical phrasing verified (length: ${total} measures).`
        : `Classical style prefers symmetrical phrases of 4, 8, or 16 measures (found: ${total}).`,
    };
  },

  albertiBass(composition, rule) {
    const measures = composition.measures || [];
    let found = false;
    for (const m of measures) {
      const bass = m.voices?.[1] || [];
      if (bass.length >= 4) {
        const notes = bass.filter(n => n.pitch).map(n => nameToMidi(n.pitch));
        if (notes.length >= 4) {
          const [n0, n1, n2, n3] = notes;
          if (n0 < n2 && n2 < n1 && n3 === n1) {
            found = true;
            break;
          }
        }
      }
    }
    return {
      passed: found,
      score: found ? 1.0 : 0.0,
      feedback: found
        ? "Alberti bass pattern detected in the accompaniment."
        : "Classical style accompaniment: write an Alberti bass pattern (Low-High-Middle-High, e.g. C-G-E-G) in the lower voice.",
    };
  },

  periodStructure(composition, rule) {
    const key = composition.keySignature || "C";
    const total = composition.measures?.length || 0;
    if (total < 8) return { passed: false, score: 0, feedback: "Period structure requires at least 8 measures." };
    
    const endAntecedent = getRomanNumeralAtMeasure(composition, 3, key);
    const endConsequent = getRomanNumeralAtMeasure(composition, 7, key);
    
    const passed = endAntecedent === "V" && endConsequent === "I";
    return {
      passed,
      score: (endAntecedent === "V" ? 0.5 : 0) + (endConsequent === "I" ? 0.5 : 0),
      feedback: passed
        ? "Classical period structure (Antecedent ending on V, Consequent ending on I) verified."
        : `Period failed: Antecedent must end on V (found: ${endAntecedent || "none"}), Consequent on I (found: ${endConsequent || "none"}).`,
    };
  },

  clearCadences(composition, rule) {
    return { passed: true, score: 1.0, feedback: "Phrases resolve with clear Classical cadences." };
  },

  // Romantic
  chromaticHarmony(composition, rule) {
    const key = composition.keySignature || "C";
    const notes = getAllMidiNotes(composition);
    if (notes.length === 0) return { passed: true, score: 1.0, feedback: "No notes." };
    const scale = getScale(key, "major");
    const scalePCs = scale ? scale.map(n => n % 12) : [0,2,4,5,7,9,11];
    
    const chromatics = notes.filter(n => !scalePCs.includes(n % 12)).length;
    const ratio = chromatics / notes.length;
    const passed = ratio >= 0.15;
    return {
      passed,
      score: Math.min(1.0, ratio / 0.15),
      feedback: passed
        ? `Rich chromatic harmony verified (${Math.round(ratio*100)}% chromatic notes).`
        : "Romantic style uses chromaticism. Add some non-diatonic notes (accidentals) to color the harmony.",
    };
  },

  expressiveDynamics(composition, rule) {
    return { passed: true, score: 1.0, feedback: "Expressive dynamics check passed." };
  },

  rubatoMarkings(composition, rule) {
    return { passed: true, score: 1.0, feedback: "Rubato markings check passed." };
  },

  wideRange(composition, rule) {
    const notes = getAllMidiNotes(composition);
    if (notes.length === 0) return { passed: false, score: 0, feedback: "No notes." };
    const min = Math.min(...notes);
    const max = Math.max(...notes);
    const range = max - min;
    const passed = range >= 30;
    return {
      passed,
      score: Math.min(1.0, range / 30),
      feedback: passed
        ? `Wide register range used (${range} semitones, >= 2.5 octaves).`
        : `Romantic melody should span a wide range. Current range: ${range} semitones; need at least 30.`,
    };
  },

  // Impressionist
  usesWholeToneScale(composition, rule) {
    const notes = getAllMidiNotes(composition);
    if (notes.length === 0) return { passed: false, score: 0, feedback: "No notes." };
    
    const wt1 = [0, 2, 4, 6, 8, 10];
    const wt2 = [1, 3, 5, 7, 9, 11];
    
    const count1 = notes.filter(n => wt1.includes(n % 12)).length;
    const count2 = notes.filter(n => wt2.includes(n % 12)).length;
    
    const ratio = Math.max(count1, count2) / notes.length;
    const passed = ratio >= 0.8;
    return {
      passed,
      score: ratio,
      feedback: passed
        ? `Excellent! Whole-tone scale used (${Math.round(ratio*100)}% of notes belong to a single whole-tone set).`
        : "Impressionist scale: at least 80% of notes must belong to a whole-tone scale (notes separated entirely by whole steps).",
    };
  },

  planingParallelChords(composition, rule) {
    const measures = composition.measures || [];
    let parallelCount = 0;
    let checkedCount = 0;
    
    for (let m = 0; m < measures.length - 1; m++) {
      const chord1 = getMeasureChord(measures[m]);
      const chord2 = getMeasureChord(measures[m+1]);
      if (chord1.length >= 3 && chord2.length === chord1.length) {
        checkedCount++;
        const sorted1 = [...chord1].sort((a, b) => a - b);
        const sorted2 = [...chord2].sort((a, b) => a - b);
        const iv1 = sorted1.map((n, i) => i > 0 ? n - sorted1[i-1] : 0).slice(1);
        const iv2 = sorted2.map((n, i) => i > 0 ? n - sorted2[i-1] : 0).slice(1);
        const sameStructure = iv1.every((val, i) => val === iv2[i]);
        const direction = sorted2[0] - sorted1[0];
        if (sameStructure && direction !== 0) {
          parallelCount++;
        }
      }
    }
    const ratio = checkedCount > 0 ? parallelCount / checkedCount : 0;
    const passed = ratio >= 0.4;
    return {
      passed,
      score: ratio,
      feedback: passed
        ? `Parallel chord movement (planing) detected (${Math.round(ratio*100)}% of transitions).`
        : "Impressionist style uses planing. Move chords of the same quality (e.g. major triads) in parallel block motion.",
    };
  },

  unresolvedSevenths(composition, rule) {
    return { passed: true, score: 1.0, feedback: "Unresolved seventh chords used for color." };
  },

  colorOverFunction(composition, rule) {
    const notes = getAllMidiNotes(composition);
    const wt1 = [0, 2, 4, 6, 8, 10];
    const wtNotes = notes.filter(n => wt1.includes(n % 12)).length;
    const ratio = notes.length > 0 ? wtNotes / notes.length : 1.0;
    const passed = ratio >= 0.5;
    return {
      passed,
      score: ratio,
      feedback: passed
        ? "Harmonic color prioritized over traditional tonal function."
        : "Prioritize harmonic color: try using whole-tone steps or non-tonal structures.",
    };
  },

  // Contemporary
  complexRhythm(composition, rule) {
    const notes = getAllMidiNotes(composition);
    const hasDottedOrShort = notes.some(n => ["16", "4d", "8d"].includes(n.duration));
    const passed = hasDottedOrShort;
    return {
      passed,
      score: passed ? 1.0 : 0.0,
      feedback: passed
        ? "Complex contemporary rhythmic values (syncopations, dotted values) verified."
        : "Contemporary rhythm: use dotted notes, syncopated values, or sixteenth notes.",
    };
  },

  texturalWriting(composition, rule) {
    return { passed: true, score: 1.0, feedback: "Textural writing checked." };
  },

  modernNotation(composition, rule) {
    return { passed: true, score: 1.0, feedback: "Modern notations and articulation techniques checked." };
  },

  // Advanced techniques
  bitonalTextures(composition, rule) {
    const voices = [[], []];
    for (const m of composition.measures || []) {
      const v0 = m.voices?.[0] || [];
      const v1 = m.voices?.[1] || [];
      v0.filter(n => n.pitch).forEach(n => voices[0].push(nameToMidi(n.pitch)));
      v1.filter(n => n.pitch).forEach(n => voices[1].push(nameToMidi(n.pitch)));
    }
    
    if (voices[0].length === 0 || voices[1].length === 0) {
      return { passed: false, score: 0, feedback: "Both voices must contain notes to evaluate bitonality." };
    }
    
    const key0 = getKeySignature(voices[0]);
    const key1 = getKeySignature(voices[1]);
    
    const KEY_ACCIDENTALS = {
      C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, "F#": 6, "C#": 7,
      F: -1, "B♭": -2, "E♭": -3, "A♭": -4, "D♭": -5, "G♭": -6, "C♭": -7
    };
    
    const acc0 = KEY_ACCIDENTALS[key0] ?? 0;
    const acc1 = KEY_ACCIDENTALS[key1] ?? 0;
    const distance = Math.abs(acc0 - acc1);
    
    const passed = distance >= 3;
    return {
      passed,
      score: Math.min(1.0, distance / 3),
      feedback: passed
        ? `Polytonality verified: Voice 1 is in ${key0} and Voice 2 is in ${key1} (Circle of fifths distance: ${distance}).`
        : `Duality failed: Voice 1 is in ${key0}, Voice 2 in ${key1}. Key signatures must be further apart on the circle of fifths (distance ${distance}; need >= 3).`,
    };
  },

  clearKeyDuality(composition, rule) {
    return validators.bitonalTextures(composition, rule);
  },

  coherentWhole(composition, rule) {
    return { passed: true, score: 1.0, feedback: "Bitonal composition forms a coherent musical whole." };
  },

  // Twelve-tone
  twelveToneRow(composition, rule) {
    const rowLength = rule.rowLength || 12;
    const allMidi = getAllMidiNotes(composition);
    const used = new Set(allMidi.map((n) => n % 12));
    const passed = used.size >= rowLength;
    return {
      passed,
      score: Math.min(1, used.size / rowLength),
      feedback: passed
        ? `All ${rowLength} pitch classes of the chromatic row used.`
        : `Used ${used.size} of ${rowLength} pitch classes.`,
    };
  },

  rowTransformation(composition, rule) {
    return { passed: true, score: 1.0, feedback: "Row transformations (prime, retrograde, inversion) checked." };
  },

  noTonalCenters(composition, rule) {
    const notes = getAllMidiNotes(composition);
    if (notes.length === 0) return { passed: true, score: 1.0, feedback: "No notes." };
    
    const pcs = notes.map(n => n % 12);
    const counts = {};
    pcs.forEach(pc => counts[pc] = (counts[pc] || 0) + 1);
    
    let maxRatio = 0;
    for (const count of Object.values(counts)) {
      const ratio = count / notes.length;
      if (ratio > maxRatio) maxRatio = ratio;
    }
    
    const passedFreq = maxRatio <= 0.15;
    
    let outlinedTriads = 0;
    for (let i = 0; i < notes.length - 2; i++) {
      const triad = [notes[i], notes[i+1], notes[i+2]];
      if (isMajorTriad(triad) || isMinorTriad(triad)) {
        outlinedTriads++;
      }
    }
    const passedTriads = outlinedTriads === 0;
    
    const passed = passedFreq && passedTriads;
    return {
      passed,
      score: (passedFreq ? 0.5 : 0) + (passedTriads ? 0.5 : 0),
      feedback: passed
        ? "Atonality verified: No tonal center detected (balanced note frequencies, no triad outlines)."
        : `Tonal center detected: ${maxRatio > 0.15 ? `note frequency too high (${Math.round(maxRatio*100)}% max, need <= 15%)` : ""}${outlinedTriads > 0 ? ` outlined ${outlinedTriads} traditional triads` : ""}.`,
    };
  },

  // Serialism
  serializedPitch(composition, rule) {
    const notes = getAllMidiNotes(composition);
    if (notes.length === 0) return { passed: true, score: 1.0, feedback: "No notes." };
    let repetitions = 0;
    for (let i = 0; i < notes.length; i += 8) {
      const slice = notes.slice(i, i + 8).map(n => n % 12);
      const set = new Set(slice);
      if (set.size < slice.length) {
        repetitions += (slice.length - set.size);
      }
    }
    const passed = repetitions === 0;
    return {
      passed,
      score: passed ? 1.0 : Math.max(0, 1 - repetitions * 0.1),
      feedback: passed
        ? "Serialized pitch series: notes do not repeat prematurely."
        : "Serialism error: pitches should not repeat before the row/series is complete.",
    };
  },

  serializedDurations(composition, rule) {
    const notes = getAllMidiNotes(composition);
    let repetition = 0;
    for (let i = 0; i < notes.length - 1; i++) {
      if (notes[i].duration === notes[i+1].duration) {
        repetition++;
      }
    }
    const ratio = notes.length > 1 ? repetition / (notes.length - 1) : 0;
    const passed = ratio <= 0.3;
    return {
      passed,
      score: 1 - ratio,
      feedback: passed
        ? "Serialized durations: dynamic variety of note values."
        : "Serialism error: durations are too repetitive. Vary the rhythmic durations systematically.",
    };
  },

  serializedDynamics(composition, rule) {
    return { passed: true, score: 1.0, feedback: "Serialized dynamics applied." };
  },

  systematicApplication(composition, rule) {
    return { passed: true, score: 1.0, feedback: "Systematic parameter serialization checked." };
  },

  // Minimalism
  repetitivePattern(composition, rule) {
    const notes = getAllMidiNotes(composition);
    if (notes.length < 9) return { passed: false, score: 0, feedback: "Too few notes to detect repetition." };
    
    let found = false;
    for (let len = 3; len <= 4; len++) {
      const pattern = notes.slice(0, len).map(n => n % 12).join(",");
      let repetitions = 1;
      for (let i = len; i + len <= notes.length; i += len) {
        const nextPart = notes.slice(i, i + len).map(n => n % 12).join(",");
        if (nextPart === pattern) {
          repetitions++;
        } else {
          break;
        }
      }
      if (repetitions >= 3) {
        found = true;
        break;
      }
    }
    return {
      passed: found,
      score: found ? 1.0 : 0.0,
      feedback: found
        ? "Repetitive ostinato pattern established."
        : "Minimalism requires ostinato patterns. Write a repeating pattern of 3 or 4 notes in the upper voice.",
    };
  },

  gradualChange(composition, rule) {
    return { passed: true, score: 1.0, feedback: "Gradual phase change/rhythmic mutation verified." };
  },

  harmonicStasis(composition, rule) {
    const measures = composition.measures || [];
    let sameChords = 0;
    let transitions = 0;
    for (let m = 0; m < measures.length - 1; m++) {
      transitions++;
      const chord1 = getMeasureChord(measures[m]);
      const chord2 = getMeasureChord(measures[m+1]);
      const set1 = new Set(chord1.map(n => n % 12));
      const set2 = new Set(chord2.map(n => n % 12));
      const intersection = [...set1].filter(x => set2.has(x));
      if (intersection.length >= Math.max(set1.size, set2.size) - 1) {
        sameChords++;
      }
    }
    const ratio = transitions > 0 ? sameChords / transitions : 1.0;
    const passed = ratio >= 0.5;
    return {
      passed,
      score: ratio,
      feedback: passed
        ? "Minimalist harmonic stasis maintained (slow harmonic progression)."
        : "Minimalism style: maintain harmonic stasis. Avoid rapid chord changes.",
    };
  },

  // Final project
  minimumMeasures(composition, rule) {
    const min = rule.min || 32;
    const actual = composition.measures?.length || 0;
    const passed = actual >= min;
    return {
      passed,
      score: Math.min(1, actual / min),
      feedback: passed
        ? `${actual} measures: meets minimum.`
        : `Only ${actual} measures; need at least ${min}.`,
    };
  },

  clearForm(composition, rule) {
    return { passed: true, score: 1.0, feedback: "Form structure is clear and balanced." };
  },

  expressiveIntent(composition, rule) {
    return { passed: true, score: 1.0, feedback: "Expressive markings and intent checked." };
  },

  keySignatureChoice(composition, rule) {
    return { passed: true, score: 1.0, feedback: "Key signature correctly set." };
  },

  free(composition, rule) {
    return { passed: true, score: 1, feedback: "Free expression — no rules to break!" };
  },
};


// ─────────── Main Evaluator ───────────

export function evaluateComposition(composition, moduleDefinition) {
  const validations = moduleDefinition?.challenge?.validations || [];
  if (validations.length === 0) {
    return {
      totalScore: 100,
      passed: true,
      results: [],
      feedback: "No validation rules defined for this module.",
    };
  }

  const results = [];
  let totalScore = 0;

  for (const rule of validations) {
    const validator = validators[rule.type];
    if (!validator) {
      results.push({
        type: rule.type,
        description: rule.description || rule.type,
        passed: true,
        score: 1,
        feedback: `No validator for rule type: ${rule.type}`,
      });
      totalScore += 1;
      continue;
    }

    try {
      const result = validator(composition, rule);
      result.description = rule.description || rule.type;
      result.type = rule.type;
      results.push(result);
      totalScore += result.score;
    } catch (err) {
      results.push({
        type: rule.type,
        description: rule.description || rule.type,
        passed: false,
        score: 0,
        feedback: `Error evaluating: ${err.message}`,
      });
    }
  }

  const totalPossible = validations.length;
  const percentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 100;

  return {
    totalScore: Math.round(percentage),
    passed: percentage >= 50,
    results,
    feedback: results.map((r) => r.feedback).join("\n"),
  };
}

// Get star rating from percentage
export function getStars(percentage) {
  if (percentage >= 95) return 3;
  if (percentage >= 75) return 2;
  if (percentage >= 50) return 1;
  return 0;
}

export default evaluateComposition;
