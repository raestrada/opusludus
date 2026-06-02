// Opus Ludus — Native HTML/CSS Entry Point
import { GameManager } from "./game/GameManager";
import { getAudioEngine } from "./engine/audio";
import { NotationRenderer } from "./engine/notation";
import { loadProgress, getStreak } from "./store/progress";
import { LESSONS } from "./store/lessons";

const CONFIG = window.__OPUS_LUDUS__ || {};
const curriculum = CONFIG.curriculum || [];
const locale = CONFIG.locale || "es";

let gameManager = null;
let currentModule = null;
let currentMeasureIndex = 0;
let selectedDuration = "4";
let isPlayingAudio = false;
let playTimeout = null;

// Lesson Example variables
let lessonRenderer = null;
let lessonAudio = null;
let isPlayingExample = false;
let examplePlayTimeout = null;

const VALIDATION_TRANSLATIONS = {
  "All notes must be within the staff range.": "Todas las notas deben estar dentro del rango del pentagrama.",
  "Each measure must have at least one note.": "Cada compás debe tener al menos una nota.",
  "Notes must be placed on the correct position for their name.": "Las notas deben estar en la posición correcta según su altura.",
  "Each measure must add up to the time signature total.": "Cada compás debe sumar la duración exacta de la métrica.",
  "Use at least two different rhythmic values.": "Usa al menos dos figuras rítmicas distintas.",
  "Every measure fills the time signature correctly.": "Todos los compases deben sumar la duración correcta de la métrica.",
  "Longer notes on strong beats (beat 1 of each measure).": "Notas de mayor duración en tiempos fuertes (tiempo 1 de cada compás).",
  "The last note should feel like a natural ending.": "La última nota debe resolver de forma conclusiva (en la tónica).",
  "Write the requested intervals above the given note.": "Escribe los intervalos solicitados sobre la nota base dada.",
  "Interval quality must be correct (major/minor/perfect).": "La calidad y especie del intervalo debe ser correcta (mayor, menor o justo).",
  "The notes must form a complete major scale (ascending).": "Las notas deben formar una escala mayor ascendente completa.",
  "Use accidentals correctly (sharps or flats for the key).": "Usa las alteraciones cromáticas correspondientes a la tonalidad.",
  "Compose at least 32 measures.": "Compón un fragmento de al menos 32 compases.",
  "Your piece should have a clear form (any type).": "La pieza debe tener una estructura o forma musical clara.",
  "Include dynamics and tempo markings.": "Incluye matices de dinámica (f, p) y cambios de tempo.",
  "Choose and notate a key signature.": "Define y escribe la armadura de clave correspondiente.",
  "Beyond minimum requirements - express yourself freely!": "Expresate libremente más allá de las reglas mínimas del desafío.",
  "Establish a clear, repeating pattern (ostinato).": "Establece un patrón melódico o rítmico repetitivo (ostinato).",
  "Transform the pattern gradually (add notes, shift phase, change timbre).": "Desarrolla el patrón gradualmente (añadiendo notas o variando el ritmo).",
  "Maintain harmonic simplicity - avoid frequent chord changes.": "Mantén estabilidad y simplicidad armónica sin cambios bruscos.",
  "Create a 12-tone row using all chromatic notes exactly once.": "Crea una serie dodecafónica usando las 12 notas cromáticas una sola vez.",
  "Present the row in at least 2 transformations.": "Presenta la serie en al menos 2 variaciones (retrogradación, inversión, etc.).",
  "Avoid creating any tonal center or chord progression.": "Evita establecer cualquier centro tonal o progresión clásica.",
  "Use a 12-tone row for pitch organization.": "Organiza las alturas del fragmento siguiendo una serie dodecafónica.",
  "Apply a duration series to the row.": "Aplica una serie matemática sistemática de duraciones.",
  "Apply a dynamics series (e.g., pp-p-mp-mf-f-ff).": "Aplica una serie rígida de matices dinámicos cíclicos.",
  "Parameters must follow their series systematically.": "Los parámetros musicales deben obedecer al orden de la serie serialista.",
  "Right hand in one key, left hand in another simultaneously.": "Escribe la mano derecha en una tonalidad y la izquierda en otra distinta.",
  "Both keys must be clearly perceptible.": "Ambas tonalidades (bitonalidad) deben escucharse con claridad.",
  "Despite bitonality, the piece should feel musically coherent.": "La composición debe tener coherencia y sentido musical a pesar del choque tonal.",
  "Use at least 2 polyrhythms or irregular groupings.": "Incorporate al menos 2 polirritmias o grupos de valoración especial.",
  "Include at least one textural or sound-mass section.": "Incluye al menos una sección de texturas densas o masas sonoras.",
  "Use at least one extended technique or modern notation.": "Utiliza al menos una técnica instrumental extendida o notación contemporánea.",
  "Include a passage using the whole-tone scale.": "Incluye un pasaje que utilice la escala de tonos enteros (exátona).",
  "Use parallel chord movement (planing).": "Emplea movimiento de acordes en bloque paralelo (planing impresionista).",
  "Use 7th and 9th chords as color, not requiring resolution.": "Emplea acordes de 7ma y 9na con fines de color tímbrico, sin resolverlos.",
  "Chord choices should favor color over traditional function.": "Tus acordes deben favorecer la sonoridad y el color sobre la armonía funcional.",
  "Use at least 3 chromatic chords or altered harmonies.": "Utiliza al menos 3 acordes con cromatismos o armonía alterada.",
  "Include wide dynamic range (pp to ff) with crescendos/diminuendos.": "Usa un amplio espectro dinámico (pp a ff) con crescendos y diminuendos.",
  "Include expressive tempo markings (ritardando, accelerando).": "Usa indicaciones expresivas de tempo (como rallentando o accelerando).",
  "Use a wide pitch range across the composition.": "Usa un registro de notas amplio (graves y agudos) en el instrumento.",
  "Use 4-bar antecedent and 4-bar consequent phrases.": "Escribe un período clásico con frase antecedente (4 compases) y consecuente (4 compases).",
  "Use Alberti bass pattern in the accompaniment.": "Utiliza el acompañamiento de bajo de Alberti para sostener la armonía.",
  "Antecedent ends on V (question), consequent ends on I (answer).": "El antecedente debe concluir en semicadencia (V) y el consecuente en cadencia perfecta (I).",
  "Clear cadences mark the end of each phrase.": "Marca los finales de cada frase mediante cadencias armónicas claras.",
  "Incorporate imitative counterpoint between voices.": "Incopora contrapunto con imitación o fugado entre las voces.",
  "Bass line with figures (or chord symbols) for continuo realization.": "Escribe un bajo cifrado barroco para la realización del bajo continuo."
};

function translateRule(desc, locale) {
  if (locale !== 'es') return desc;
  return VALIDATION_TRANSLATIONS[desc] || desc;
}

function getModuleById(id) {
  return curriculum.find((m) => m.id === id);
}

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function getNextModuleId(currentOrder) {
  const next = curriculum.find((m) => m.order === currentOrder + 1);
  return next ? next.id : null;
}


// Calculate which measure index was clicked based on SVG coordinates
function getMeasureIndexAtCoords(offsetX, offsetY, composition, width) {
  const measures = composition.measures || [];
  const measuresPerLine = 4;
  const numLines = Math.ceil(measures.length / measuresPerLine);
  
  for (let lineIdx = 0; lineIdx < numLines; lineIdx++) {
    const lineMeasuresCount = Math.min(
      measuresPerLine,
      measures.length - lineIdx * measuresPerLine
    );
    const staveY = 40 + lineIdx * 120;
    
    // Forgiving vertical boundary check (120px height)
    if (offsetY >= staveY - 20 && offsetY <= staveY + 100) {
      const totalWidth = width - 80;
      let baseStaveWidth = totalWidth / lineMeasuresCount;
      const extra = 70;
      
      if (lineIdx === 0 && lineMeasuresCount > 1) {
        baseStaveWidth = (totalWidth - extra) / lineMeasuresCount;
      }
      
      let currentX = 40;
      for (let i = 0; i < lineMeasuresCount; i++) {
        let staveW = baseStaveWidth;
        if (lineIdx === 0 && lineMeasuresCount > 1 && i === 0) {
          staveW = baseStaveWidth + extra;
        }
        
        if (offsetX >= currentX && offsetX <= currentX + staveW) {
          return lineIdx * measuresPerLine + i;
        }
        currentX += staveW;
      }
    }
  }
  return null;
}

// Safely add note check limits and handle auto-advance
function tryAddNote(pitch) {
  if (!gameManager || !gameManager.currentComposition) return;
  const comp = gameManager.currentComposition;
  const timeSig = comp.timeSignature || [4, 4];
  const maxBeats = timeSig[0] * (4 / timeSig[1]);
  
  const currentBeats = gameManager.getMeasureBeats(currentMeasureIndex, 0);
  const noteBeats = {
    "1": 4, "2": 2, "4": 1, "8": 0.5, "16": 0.25,
    "2d": 3, "4d": 1.5, "8d": 0.75
  }[selectedDuration] || 1;
  
  if (currentBeats + noteBeats > maxBeats + 0.01) {
    if (locale === 'es') {
      showFeedback(`⚠️ No hay espacio suficiente en este compás (${currentBeats}/${maxBeats} tiempos).`, "error");
    } else {
      showFeedback(`⚠️ Not enough space in this measure (${currentBeats}/${maxBeats} beats).`, "error");
    }
    return;
  }
  
  // Add note
  gameManager.addNote(currentMeasureIndex, 0, {
    pitch: pitch,
    duration: selectedDuration
  });
  
  // Auto-advance if measure is full
  const newBeats = currentBeats + noteBeats;
  if (Math.abs(newBeats - maxBeats) < 0.01) {
    if (currentMeasureIndex < comp.measures.length - 1) {
      currentMeasureIndex++;
      if (locale === 'es') {
        showFeedback("✨ ¡Compás completado! Avanzando al siguiente.", "success");
      } else {
        showFeedback("✨ Measure complete! Advancing to the next.", "success");
      }
    } else {
      if (locale === 'es') {
        showFeedback("✨ ¡Compás completado! Has llenado el último compás.", "success");
      } else {
        showFeedback("✨ Measure complete! You filled the last measure.", "success");
      }
    }
  } else {
    showFeedback("", "info");
  }

  // Re-render with the updated measure index (ensures staff highlight is in sync) and preview note
  gameManager.render(currentMeasureIndex);
  gameManager.previewNote(pitch);

  updateMeasureIndicators();
}

// HUD and Feedback Helpers
function showFeedback(text, type = "info") {
  const fb = document.getElementById("feedback-message-container");
  if (!fb) return;
  fb.className = `feedback-area ${type}`;
  fb.textContent = text;
}

function updateHud(moduleDef) {
  const titleEl = document.getElementById("hud-module-title");
  const tipEl = document.getElementById("hud-tip-text");
  
  if (titleEl) {
    titleEl.textContent = moduleDef.name[locale] || moduleDef.name.en || "";
  }
  
  if (tipEl) {
    const tips = moduleDef.tips[locale] || moduleDef.tips.en || [];
    tipEl.textContent = tips.length > 0 ? `💡 ${tips[0]}` : "";
  }

  // XP & Streak
  const progress = loadProgress();
  const xpVal = document.getElementById("hud-xp-value");
  if (xpVal) xpVal.textContent = progress.totalXp || 0;

  const streak = getStreak();
  const streakContainer = document.getElementById("hud-streak-container");
  const streakVal = document.getElementById("hud-streak-value");
  if (streakContainer && streakVal) {
    if (streak >= 2) {
      streakContainer.style.display = "inline-flex";
      streakVal.textContent = streak;
    } else {
      streakContainer.style.display = "none";
    }
  }
}

// Load Lesson Stage
function loadLesson() {
  const moduleId = getQueryParam("module") || curriculum[0]?.id;
  currentModule = getModuleById(moduleId);

  if (!currentModule) {
    showFeedback("Módulo no encontrado.", "error");
    return;
  }

  // Look up custom lesson or generate fallback
  let lesson = LESSONS[moduleId];
  if (!lesson) {
    // Generate fallback example composition dynamically using allowed notes
    const challenge = currentModule.challenge || {};
    const clef = challenge.clef || "treble";
    const timeSig = challenge.timeSignature || [4, 4];
    const keySig = challenge.keySignature || "C";
    const avail = (challenge.availableNotes || []).filter((n) => /^[A-G][#♭]?\d$/.test(n));
    const fallbackNotes = avail.length > 0 ? avail : ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
    
    // Build a 1 or 2-measure fallback composition with 4 quarter notes per measure
    const exampleMeasures = [];
    const measuresToGen = challenge.measures ? Math.min(2, challenge.measures) : 1;
    
    for (let m = 0; m < measuresToGen; m++) {
      const measureNotes = [];
      const numBeats = timeSig[0];
      for (let n = 0; n < numBeats; n++) {
        const noteIndex = (m * numBeats + n) % fallbackNotes.length;
        measureNotes.push({ pitch: fallbackNotes[noteIndex], duration: "4" });
      }
      exampleMeasures.push({ voices: [measureNotes] });
    }

    lesson = {
      es: {
        intro: currentModule.description?.es || currentModule.description?.en || "",
        details: currentModule.tips?.es || currentModule.tips?.en || [
          "Coloca las notas permitidas en el compás.",
          "Completa el compás según la métrica dada.",
          "Evalúa y envía el desafío al finalizar."
        ],
        exampleTitle: "Desafío de Composición",
        exampleDesc: "Explora las notas de este módulo y crea tu propia melodía clásica."
      },
      en: {
        intro: currentModule.description?.en || "",
        details: currentModule.tips?.en || [
          "Place allowed notes on the staff.",
          "Complete the measure according to the time signature.",
          "Check and submit the challenge when you are done."
        ],
        exampleTitle: "Composition Challenge",
        exampleDesc: "Explore the notes of this module and compose your own classical melody."
      },
      exampleComposition: {
        clef,
        timeSignature: timeSig,
        keySignature: keySig,
        measures: exampleMeasures
      }
    };
  }

  const t = lesson[locale] || lesson.en || lesson.es;

  // Populate HTML elements
  const titleEl = document.getElementById("lesson-title");
  const introEl = document.getElementById("lesson-intro");
  const detailsEl = document.getElementById("lesson-details-list");
  const exTitleEl = document.getElementById("lesson-example-title");
  const exDescEl = document.getElementById("lesson-example-desc");

  if (titleEl) titleEl.textContent = currentModule.name[locale] || currentModule.name.en || "";
  if (introEl) introEl.innerHTML = t.intro.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
  if (detailsEl) {
    detailsEl.innerHTML = "";
    t.details.forEach(detail => {
      const li = document.createElement("li");
      li.innerHTML = detail.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      detailsEl.appendChild(li);
    });
  }



  if (exTitleEl) exTitleEl.textContent = t.exampleTitle;
  if (exDescEl) exDescEl.textContent = t.exampleDesc;

  // Render Lesson Example Staff using NotationRenderer
  const exampleComp = lesson.exampleComposition;
  if (exampleComp) {
    lessonRenderer = new NotationRenderer("lesson-staff-area", {
      clef: exampleComp.clef || "treble",
      timeSignature: exampleComp.timeSignature || [4, 4],
      keySignature: exampleComp.keySignature || "C",
      width: 400,
      height: 150
    });
    lessonRenderer.setup();
    lessonRenderer.renderFull(exampleComp);
  }

  // Lesson Audio setup
  const playBtn = document.getElementById("lesson-btn-play-example");
  const stopBtn = document.getElementById("lesson-btn-stop-example");

  lessonAudio = getAudioEngine();
  lessonAudio.init("synth").catch((err) => {
    console.warn("Audio engine init failed for lesson:", err);
  });

  const handleStopExample = () => {
    if (playBtn) playBtn.style.display = "inline-flex";
    if (stopBtn) stopBtn.style.display = "none";
    isPlayingExample = false;
    lessonAudio.stop();
    if (examplePlayTimeout) {
      clearTimeout(examplePlayTimeout);
      examplePlayTimeout = null;
    }
  };

  const handlePlayExample = () => {
    if (playBtn) playBtn.style.display = "none";
    if (stopBtn) stopBtn.style.display = "inline-flex";
    isPlayingExample = true;

    // Load and play
    lessonAudio.loadComposition(exampleComp);
    lessonAudio.play();

    // Reset when done
    const timeSig = exampleComp.timeSignature || [4, 4];
    const bpm = 100;
    const durationSec = exampleComp.measures.length * timeSig[0] * (60 / bpm);

    if (examplePlayTimeout) clearTimeout(examplePlayTimeout);
    examplePlayTimeout = setTimeout(() => {
      handleStopExample();
    }, durationSec * 1000 + 300);
  };

  if (playBtn) playBtn.addEventListener("click", handlePlayExample);
  if (stopBtn) stopBtn.addEventListener("click", handleStopExample);

  // Populate challenge validations/rules inside Step 2
  const populateChallengeView = () => {
    const titleText = document.getElementById("challenge-title-text");
    if (titleText && currentModule) {
      titleText.textContent = currentModule.name[locale] || currentModule.name.en || "";
    }

    const rulesEl = document.getElementById("play-challenge-rules");
    if (rulesEl && currentModule.challenge && currentModule.challenge.validations) {
      rulesEl.innerHTML = "";
      currentModule.challenge.validations.forEach(val => {
        const li = document.createElement("li");
        const desc = val.description || val.type;
        li.textContent = translateRule(desc, locale);
        rulesEl.appendChild(li);
      });
    }
  };

  // Start Button Event - Transitions from Step 1 (Theory) to Step 2 (Challenge)
  const startBtn = document.getElementById("lesson-btn-start");
  if (startBtn) {
    if (locale === 'es') {
      startBtn.innerHTML = 'Siguiente <span class="icon">➔</span>';
    } else {
      startBtn.innerHTML = 'Next <span class="icon">➔</span>';
    }
    
    startBtn.addEventListener("click", () => {
      handleStopExample();
      
      const lessonView = document.getElementById("lesson-view");
      const challengeView = document.getElementById("challenge-view");
      if (lessonView) lessonView.classList.add("hidden");
      if (challengeView) challengeView.classList.remove("hidden");
      
      populateChallengeView();
    });
  }

  // Challenge View button handlers (Step 2)
  const challengeBackBtn = document.getElementById("challenge-btn-back");
  const challengeStartBtn = document.getElementById("challenge-btn-start");

  if (challengeBackBtn) {
    challengeBackBtn.onclick = () => {
      const lessonView = document.getElementById("lesson-view");
      const challengeView = document.getElementById("challenge-view");
      if (challengeView) challengeView.classList.add("hidden");
      if (lessonView) lessonView.classList.remove("hidden");
    };
  }

  if (challengeStartBtn) {
    challengeStartBtn.onclick = () => {
      const challengeView = document.getElementById("challenge-view");
      const gameWorkspace = document.getElementById("game-workspace");
      if (challengeView) challengeView.classList.add("hidden");
      if (gameWorkspace) gameWorkspace.classList.remove("hidden");

      initWorkspace().catch((err) => {
        console.error("Error al iniciar el espacio de composición:", err);
        showFeedback("Error al inicializar la partitura del desafío.", "error");
      });
    };
  }
}

// Build palettes and UI components
const DURATIONS_MAP = [
  { id: "1", label: "𝅝", beats: "4b" },
  { id: "2", label: "𝅗𝅥", beats: "2b" },
  { id: "4", label: "𝅘𝅥", beats: "1b" },
  { id: "8", label: "𝅘𝅥𝅮", beats: "½b" }
];

function buildDurationPalette(availableDurations) {
  const container = document.getElementById("duration-palette-container");
  if (!container) return;
  container.innerHTML = "";

  const allowed = availableDurations || ["1", "2", "4", "8"];
  
  DURATIONS_MAP.forEach(dur => {
    if (!allowed.includes(dur.id)) return;
    
    const btn = document.createElement("button");
    btn.className = "dur-btn";
    if (dur.id === selectedDuration) {
      btn.classList.add("selected");
    }
    btn.textContent = dur.label;
    btn.title = `${dur.beats}`;
    
    btn.addEventListener("click", () => {
      selectedDuration = dur.id;
      container.querySelectorAll(".dur-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
    
    container.appendChild(btn);
  });
}

function buildNotePalette(availableNotes) {
  const container = document.getElementById("note-palette-container");
  if (!container) return;
  container.innerHTML = "";

  const notes = availableNotes.filter((n) => /^[A-G][#♭]?\d$/.test(n));
  const PITCH_NATURAL_SORT = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  
  notes.sort((a, b) => {
    const aM = a.match(/^([A-G][#♭]?)(\d)$/);
    const bM = b.match(/^([A-G][#♭]?)(\d)$/);
    if (!aM || !bM) return 0;
    const octDiff = parseInt(aM[2]) - parseInt(bM[2]);
    if (octDiff !== 0) return octDiff;
    const aIdx = PITCH_NATURAL_SORT.indexOf(aM[1].replace("♭", "b").replace("♯", "#"));
    const bIdx = PITCH_NATURAL_SORT.indexOf(bM[1].replace("♭", "b").replace("♯", "#"));
    return aIdx - bIdx;
  });

  notes.forEach(note => {
    const btn = document.createElement("button");
    btn.className = "note-btn";
    btn.textContent = note.replace("b", "♭").replace("#", "♯");
    btn.dataset.note = note;
    btn.addEventListener("click", () => {
      if (isPlayingAudio) return;
      
      tryAddNote(note);
      
      // Select note key visually on the piano briefly
      const pianoKey = document.querySelector(`.piano-key[data-note="${note}"]`);
      if (pianoKey) {
        pianoKey.classList.add("active");
        setTimeout(() => pianoKey.classList.remove("active"), 150);
      }
    });
    container.appendChild(btn);
  });
}

function buildPianoKeyboard(availableNotes) {
  const container = document.getElementById("piano-keyboard-container");
  if (!container) return;
  container.innerHTML = "";

  const octaves = [3, 4, 5];
  const whiteNotes = ["C", "D", "E", "F", "G", "A", "B"];
  const whiteKeyMap = [];
  
  // 1. White keys
  let whiteKeyCount = 0;
  octaves.forEach(oct => {
    whiteNotes.forEach(pitch => {
      const noteName = pitch + oct;
      const keyEl = document.createElement("div");
      keyEl.className = "piano-key white";
      keyEl.dataset.note = noteName;
      
      const isAllowed = availableNotes.length === 0 || availableNotes.includes(noteName);
      if (!isAllowed) {
        keyEl.classList.add("disabled");
      } else {
        keyEl.addEventListener("pointerdown", () => handleKeyPress(noteName, keyEl));
      }
      
      container.appendChild(keyEl);
      whiteKeyMap.push({ note: noteName, index: whiteKeyCount });
      whiteKeyCount++;
    });
  });

  container.style.width = `${whiteKeyCount * 32}px`;

  // 2. Black keys
  const blackNotes = [
    { pitch: "C#", after: "C" },
    { pitch: "D#", after: "D" },
    { pitch: "F#", after: "F" },
    { pitch: "G#", after: "G" },
    { pitch: "A#", after: "A" }
  ];

  octaves.forEach(oct => {
    blackNotes.forEach(bn => {
      const noteName = bn.pitch + oct;
      const afterNoteName = bn.after + oct;
      
      const whiteKey = whiteKeyMap.find(wk => wk.note === afterNoteName);
      if (!whiteKey) return;
      
      const keyEl = document.createElement("div");
      keyEl.className = "piano-key black";
      keyEl.dataset.note = noteName;
      
      const leftPos = (whiteKey.index + 1) * 32 - 9;
      keyEl.style.left = `${leftPos}px`;
      
      const isAllowed = availableNotes.length === 0 || availableNotes.includes(noteName);
      if (!isAllowed) {
        keyEl.classList.add("disabled");
      } else {
        keyEl.addEventListener("pointerdown", () => handleKeyPress(noteName, keyEl));
      }
      
      container.appendChild(keyEl);
    });
  });
}

function handleKeyPress(noteName, keyEl) {
  if (isPlayingAudio) return;
  
  keyEl.classList.add("active");
  setTimeout(() => keyEl.classList.remove("active"), 150);
  
  if (gameManager.isNoteAllowed(noteName)) {
    tryAddNote(noteName);
  }
}

function buildMeasureNav(measureCount) {
  const container = document.getElementById("measure-nav-container");
  if (!container) return;
  container.innerHTML = "";

  for (let i = 0; i < measureCount; i++) {
    const btn = document.createElement("button");
    btn.className = "measure-btn";
    if (i === currentMeasureIndex) {
      btn.classList.add("active");
    }
    btn.textContent = i + 1;
    btn.title = `Compás ${i + 1}`;
    btn.addEventListener("click", () => {
      currentMeasureIndex = i;
      container.querySelectorAll(".measure-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      gameManager.render(currentMeasureIndex);
    });
    container.appendChild(btn);
  }
}

function updateMeasureIndicators() {
  const container = document.getElementById("measure-nav-container");
  if (!container) return;
  container.querySelectorAll(".measure-btn").forEach((b, idx) => {
    if (idx === currentMeasureIndex) {
      b.classList.add("active");
    } else {
      b.classList.remove("active");
    }
  });
}

// Transport Button Handlers
function handlePlay() {
  const playBtn = document.getElementById("btn-play");
  const stopBtn = document.getElementById("btn-stop");
  if (!playBtn || !stopBtn) return;

  playBtn.style.display = "none";
  stopBtn.style.display = "inline-flex";
  
  isPlayingAudio = true;
  gameManager.play();
  
  const comp = gameManager.currentComposition;
  const timeSig = comp.timeSignature || [4, 4];
  const bpm = 100;
  const durationSec = comp.measures.length * timeSig[0] * (60 / bpm);
  
  if (playTimeout) clearTimeout(playTimeout);
  playTimeout = setTimeout(() => {
    handleStop();
  }, durationSec * 1000 + 300);
}

function handleStop() {
  const playBtn = document.getElementById("btn-play");
  const stopBtn = document.getElementById("btn-stop");
  if (!playBtn || !stopBtn) return;

  playBtn.style.display = "inline-flex";
  stopBtn.style.display = "none";
  
  isPlayingAudio = false;
  gameManager.stop();
  if (playTimeout) {
    clearTimeout(playTimeout);
    playTimeout = null;
  }
}

// Initialize workspace
async function initWorkspace() {
  // Setup HUD
  updateHud(currentModule);

  // Setup GameManager
  gameManager = new GameManager();
  await gameManager.init("opus-staff-area", currentModule);
  
  // Set composition
  const comp = gameManager.createBlankComposition();
  gameManager.currentComposition = comp;

  // Add initial note placeholder if needed, e.g. for first challenge
  const avail = currentModule.challenge?.availableNotes || [];
  if (avail.length >= 3) {
    comp.measures[0]?.voices[0]?.push({ pitch: avail[0], duration: "4" });
    comp.measures[0]?.voices[0]?.push({ pitch: avail[2] || avail[0], duration: "4" });
  }

  // Render initial staff
  gameManager.render(currentMeasureIndex);

  // Wire up staff click to select measure directly
  const staffArea = document.getElementById("opus-staff-area");
  if (staffArea) {
    staffArea.addEventListener("click", (e) => {
      if (isPlayingAudio) return;
      const rect = staffArea.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      
      const comp = gameManager.currentComposition;
      if (!comp) return;
      
      const clickedMeasureIdx = getMeasureIndexAtCoords(offsetX, offsetY, comp, staffArea.clientWidth);
      if (clickedMeasureIdx !== null) {
        currentMeasureIndex = clickedMeasureIdx;
        gameManager.render(currentMeasureIndex);
        updateMeasureIndicators();
      }
    });
  }

  // Build controls UI
  buildMeasureNav(comp.measures.length);
  buildDurationPalette(currentModule.challenge?.availableDurations);
  buildNotePalette(avail);
  buildPianoKeyboard(avail);

  // Wire up transport event listeners
  document.getElementById("btn-reset")?.addEventListener("click", () => {
    if (isPlayingAudio) handleStop();
    gameManager.currentComposition = gameManager.createBlankComposition();
    currentMeasureIndex = 0;
    gameManager.render(currentMeasureIndex);
    updateMeasureIndicators();
    showFeedback("Composición reiniciada.", "info");
  });

  document.getElementById("btn-undo")?.addEventListener("click", () => {
    if (isPlayingAudio) handleStop();
    
    const comp = gameManager.currentComposition;
    if (!comp) return;

    let targetMeasureIdx = currentMeasureIndex;
    const currentVoice = comp.measures?.[currentMeasureIndex]?.voices?.[0] || [];
    if (currentVoice.length === 0 && currentMeasureIndex > 0) {
      currentMeasureIndex--;
      targetMeasureIdx = currentMeasureIndex;
    }

    gameManager.removeLastNote(targetMeasureIdx, 0);
    gameManager.render(currentMeasureIndex);
    updateMeasureIndicators();
    showFeedback("Última nota eliminada.", "info");
  });

  document.getElementById("btn-play")?.addEventListener("click", handlePlay);
  document.getElementById("btn-stop")?.addEventListener("click", handleStop);

  document.getElementById("btn-evaluate")?.addEventListener("click", () => {
    if (isPlayingAudio) handleStop();
    const result = gameManager.evaluate();
    if (result.passed) {
      showFeedback(`✅ ¡Desafío superado con éxito! ${result.stars}⭐ (${result.totalScore}%)`, "success");
    } else {
      showFeedback(`❌ No se cumplen todos los requisitos (${result.totalScore}%). ¡Inténtalo de nuevo!`, "error");
    }
  });

  document.getElementById("btn-submit")?.addEventListener("click", () => {
    if (isPlayingAudio) handleStop();
    const result = gameManager.submit();
    showResultModal(result);
  });
}

// Show results popup modal
function showResultModal(submitResult) {
  const modal = document.getElementById("result-modal");
  const title = document.getElementById("result-title");
  const subtitle = document.getElementById("result-subtitle");
  const starsContainer = document.getElementById("result-stars-container");
  const scoreVal = document.getElementById("result-score-value");
  const xpVal = document.getElementById("result-xp-value");
  
  if (!modal) return;

  const stars = submitResult.stars || 0;
  const score = submitResult.totalScore || 0;
  const xpEarned = submitResult.xpEarned || 0;
  const nextId = getNextModuleId(currentModule.order);

  // Stars text
  if (starsContainer) {
    starsContainer.textContent = "⭐".repeat(stars) + "☆".repeat(Math.max(0, 3 - stars));
  }

  // Titles
  if (title) {
    if (stars >= 3) title.textContent = "¡Perfecto!";
    else if (stars >= 2) title.textContent = "¡Excelente!";
    else if (stars >= 1) title.textContent = "¡Bien hecho!";
    else title.textContent = "Sigue practicando";
  }

  if (subtitle) {
    subtitle.textContent = currentModule.name[locale] || currentModule.name.en || "";
  }

  if (scoreVal) scoreVal.textContent = `${score}%`;
  if (xpVal) xpVal.textContent = `+${xpEarned} XP`;

  // Streak
  const streak = getStreak();
  const streakContainer = document.getElementById("result-streak-container");
  const streakVal = document.getElementById("result-streak-value");
  if (streakContainer && streakVal) {
    if (streak >= 2) {
      streakContainer.style.display = "block";
      streakVal.textContent = streak;
    } else {
      streakContainer.style.display = "none";
    }
  }

  // Next module button
  const nextBtn = document.getElementById("result-btn-next");
  if (nextBtn) {
    if (nextId && submitResult.passed) {
      nextBtn.style.display = "inline-flex";
      nextBtn.onclick = () => {
        window.location.href = `/${locale}/play/?module=${nextId}`;
      };
    } else {
      nextBtn.style.display = "none";
    }
  }

  // Retry
  const retryBtn = document.getElementById("result-btn-retry");
  if (retryBtn) {
    retryBtn.onclick = () => {
      modal.classList.add("hidden");
      currentMeasureIndex = 0;
      gameManager.currentComposition = gameManager.createBlankComposition();
      gameManager.render(currentMeasureIndex);
      updateMeasureIndicators();
      showFeedback("Composición reiniciada.", "info");
    };
  }

  // Back to menu
  const menuBtn = document.getElementById("result-btn-menu");
  if (menuBtn) {
    menuBtn.onclick = () => {
      window.location.href = `/${locale}/modules/`;
    };
  }

  // Show modal
  modal.classList.remove("hidden");
}

// Start game when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Load the lesson stage first
  try {
    loadLesson();
  } catch (err) {
    console.error("Error al cargar la lección de teoría:", err);
    showFeedback("Error al inicializar la lección teórica.", "error");
  }
});

// Clean up
window.addEventListener("beforeunload", () => {
  if (playTimeout) clearTimeout(playTimeout);
  if (examplePlayTimeout) clearTimeout(examplePlayTimeout);
  if (gameManager) {
    try {
      gameManager.dispose();
    } catch (e) {
      // Ignore
    }
  }
  if (lessonRenderer) {
    try {
      lessonRenderer.destroy();
    } catch (e) {
      // Ignore
    }
  }
});
