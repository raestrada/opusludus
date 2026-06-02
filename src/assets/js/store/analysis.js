export const ANALYSIS_CHALLENGES = [
  {
    id: "bach-chorale",
    name: {
      en: "J.S. Bach — Chorale BWV 514",
      es: "J.S. Bach — Coral BWV 514"
    },
    difficulty: {
      en: "Medium",
      es: "Medio"
    },
    concept: {
      en: "Cadence & Resolution",
      es: "Cadencia y Resolución"
    },
    description: {
      en: "The final cadence (V-I) of this Bach chorale is missing the bass voice in measure 2. The V chord (G major) must resolve to the I chord (C major). Assign the correct notes to the bass to resolve the tension.",
      es: "A la cadencia final (V-I) de este coral de Bach le faltan las notas del bajo en el compás 2. El acorde V (Sol mayor) debe resolver al acorde I (Do mayor). Asigna las notas correspondientes al bajo para resolver la tensión."
    },
    composition: {
      clef: "grand",
      timeSignature: [4, 4],
      keySignature: "C",
      measures: [
        {
          voices: [
            [
              { pitch: "E4", duration: "2" },
              { pitch: "D4", duration: "2" }
            ],
            [
              { pitch: "C3", duration: "2" },
              { pitch: "B2", duration: "2" }
            ]
          ]
        },
        {
          voices: [
            [
              { pitch: "C4", duration: "1" }
            ],
            [
              { duration: "2" }, // Slot 1: expected G2 (pitch class 7)
              { duration: "2" }  // Slot 2: expected C3 (pitch class 0)
            ]
          ]
        }
      ]
    },
    availableNotes: ["G2", "A2", "B2", "C3", "D3", "E3"],
    expectedAnswers: {
      reconstruction: [
        { measure: 1, voice: 1, noteIdx: 0, pitch: "G2" },
        { measure: 1, voice: 1, noteIdx: 1, pitch: "C3" }
      ]
    },
    question: {
      en: "What type of harmonic cadence is formed by resolving from degree V to I with the bass in root position?",
      es: "¿Qué tipo de cadencia armónica se forma al resolver del grado V al I con el bajo en estado fundamental?",
      options: [
        { en: "Perfect Authentic Cadence", es: "Cadencia Auténtica Perfecta", correct: true },
        { en: "Plagal Cadence", es: "Cadencia Plagal", correct: false },
        { en: "Half Cadence", es: "Semicadencia", correct: false },
        { en: "Deceptive Cadence", es: "Cadencia Rota", correct: false }
      ]
    },
    xpBase: 80
  },
  {
    id: "mozart-symphony40",
    name: {
      en: "W.A. Mozart — Symphony No. 40",
      es: "W.A. Mozart — Sinfonía N° 40"
    },
    difficulty: {
      en: "Hard",
      es: "Difícil"
    },
    concept: {
      en: "Voice Leading",
      es: "Conducción de Voces"
    },
    description: {
      en: "Mozart's famous opening theme contains a severe voice leading error introduced in measure 2 (parallel octaves between melody and bass). Select the incorrect bass note and change it to F (F3) to resolve it.",
      es: "El famoso tema inicial de Mozart contiene un error de conducción de voces en el compás 2 (octavas paralelas entre melodía y bajo). Selecciona la nota incorrecta en el bajo y corrígela a Fa (F3) para resolverlo."
    },
    composition: {
      clef: "grand",
      timeSignature: [4, 4],
      keySignature: "C",
      measures: [
        {
          voices: [
            [
              { pitch: "E4", duration: "4" },
              { pitch: "D4", duration: "4" },
              { pitch: "D4", duration: "2" }
            ],
            [
              { pitch: "C3", duration: "2" },
              { pitch: "B2", duration: "2" }
            ]
          ]
        },
        {
          voices: [
            [
              { pitch: "D4", duration: "4" },
              { pitch: "C4", duration: "4" },
              { pitch: "C4", duration: "2" }
            ],
            [
              { pitch: "D3", duration: "2" }, // Error note: D3 creates parallel octaves with D4 in melody
              { pitch: "C3", duration: "2" }
            ]
          ]
        }
      ]
    },
    availableNotes: ["C3", "D3", "E3", "F3", "G3", "A3"],
    expectedAnswers: {
      reconstruction: [
        { measure: 1, voice: 1, noteIdx: 0, pitch: "F3" }
      ]
    },
    question: {
      en: "Why are parallel octaves and fifths forbidden in classical voice leading?",
      es: "¿Por qué están prohibidas las octavas y quintas paralelas en la conducción de voces clásica?",
      options: [
        { en: "Because they destroy the independence of the voices", es: "Porque destruyen la independencia de las voces", correct: true },
        { en: "Because they are difficult to play on orchestral instruments", es: "Porque son difíciles de tocar en instrumentos de orquesta", correct: false },
        { en: "Because they sound too dissonant to the listener", es: "Porque suenan demasiado disonantes al oyente", correct: false },
        { en: "Because they disrupt the rhythmic flow of the piece", es: "Porque interrumpen el flujo rítmico de la pieza", correct: false }
      ]
    },
    xpBase: 100
  },
  {
    id: "beethoven-ode",
    name: {
      en: "L. van Beethoven — Ode to Joy",
      es: "L. van Beethoven — Himno a la Alegría"
    },
    difficulty: {
      en: "Easy",
      es: "Fácil"
    },
    concept: {
      en: "Melodic Cadence",
      es: "Cadencia Melódica"
    },
    description: {
      en: "The first phrase of Beethoven's theme resolves to the dominant (A4), but it was mistakenly written ending on G4. Select the last note of measure 4 and correct it to A4.",
      es: "La primera frase del tema de Beethoven resuelve a la dominante (La4), pero fue escrita erróneamente terminando en Sol4. Selecciona la última nota del compás 4 y corrígela a La4."
    },
    composition: {
      clef: "treble",
      timeSignature: [4, 4],
      keySignature: "G",
      measures: [
        {
          voices: [
            [
              { pitch: "B4", duration: "4" },
              { pitch: "B4", duration: "4" },
              { pitch: "C5", duration: "4" },
              { pitch: "D5", duration: "4" }
            ]
          ]
        },
        {
          voices: [
            [
              { pitch: "D5", duration: "4" },
              { pitch: "C5", duration: "4" },
              { pitch: "B4", duration: "4" },
              { pitch: "A4", duration: "4" }
            ]
          ]
        },
        {
          voices: [
            [
              { pitch: "G4", duration: "4" },
              { pitch: "G4", duration: "4" },
              { pitch: "A4", duration: "4" },
              { pitch: "B4", duration: "4" }
            ]
          ]
        },
        {
          voices: [
            [
              { pitch: "B4", duration: "4d" },
              { pitch: "A4", duration: "8" },
              { pitch: "G4", duration: "2" } // Error: G4 should be A4 (resolving to dominant)
            ]
          ]
        }
      ]
    },
    availableNotes: ["G4", "A4", "B4", "C5", "D5"],
    expectedAnswers: {
      reconstruction: [
        { measure: 3, voice: 0, noteIdx: 2, pitch: "A4" }
      ]
    },
    question: {
      en: "What type of cadence ends the antecedent phrase of a musical period on the dominant chord?",
      es: "¿Qué tipo de cadencia concluye la frase antecedente de un período musical en el acorde de dominante?",
      options: [
        { en: "Half Cadence", es: "Semicadencia", correct: true },
        { en: "Perfect Authentic Cadence", es: "Cadencia Auténtica Perfecta", correct: false },
        { en: "Plagal Cadence", es: "Cadencia Plagal", correct: false },
        { en: "Deceptive Cadence", es: "Cadencia Rota", correct: false }
      ]
    },
    xpBase: 60
  }
];
