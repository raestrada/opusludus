export const DICTATIONS_CHALLENGES = [
  {
    id: "bach-minuet",
    name: {
      en: "J.S. Bach — Minuet in G (BWV Anh. 114)",
      es: "J.S. Bach — Minueto en Sol (BWV Anh. 114)"
    },
    difficulty: {
      en: "Easy",
      es: "Fácil"
    },
    concept: {
      en: "Diatonic Steps & Skips",
      es: "Pasos y Saltos Diatónicos"
    },
    description: {
      en: "Listen to the Minuet in G and reconstruct the missing notes in measures 1 to 4. Find the silent notes on the staff and replace them with the correct pitches.",
      es: "Escucha el Minueto en Sol y reconstruye las notas que faltan en los compases 1 al 4. Encuentra las notas silenciosas en el pentagrama y reemplázalas con las alturas correctas."
    },
    theory: {
      en: "### Diatonic Steps and Skips\n\nBach's Minuet in G is a masterclass in elegant, step-wise motion. Melodies in the Baroque era often move step-by-step (conjunct motion) or by skipping small intervals like thirds or fifths (disjunct motion) along the major scale.\n\nDeveloping your ear to differentiate a step (second) from a skip (third or fifth) is the core foundation of musical dictation.",
      es: "### Pasos y Saltos Diatónicos\n\nEl Minueto en Sol de Bach es una lección magistral de movimiento melódico elegante. Las melodías en la era barroca a menudo se mueven grado por grado (movimiento conjunto) o mediante saltos de pequeños intervalos como terceras o quintas (movimiento disjunto) dentro de la escala mayor.\n\nEntrenar el oído para diferenciar un paso (segunda) de un salto (tercera o quinta) es la base fundamental del dictado musical."
    },
    composition: {
      clef: "treble",
      timeSignature: [3, 4],
      keySignature: "G",
      measures: [
        {
          voices: [
            [
              { pitch: "D5", duration: "4" },
              { pitch: "G4", duration: "8" },
              { duration: "8" }, // Expected A4 (noteIdx: 2)
              { pitch: "B4", duration: "8" },
              { duration: "8" }  // Expected C5 (noteIdx: 4)
            ]
          ]
        },
        {
          voices: [
            [
              { pitch: "D5", duration: "4" },
              { pitch: "G4", duration: "4" },
              { duration: "4" }  // Expected G4 (noteIdx: 2)
            ]
          ]
        },
        {
          voices: [
            [
              { pitch: "E5", duration: "4" },
              { pitch: "C5", duration: "8" },
              { pitch: "D5", duration: "8" },
              { pitch: "E5", duration: "8" },
              { duration: "8" }  // Expected F#5 (noteIdx: 4)
            ]
          ]
        },
        {
          voices: [
            [
              { duration: "4" }, // Expected G5 (noteIdx: 0)
              { pitch: "G4", duration: "4" },
              { pitch: "G4", duration: "4" }
            ]
          ]
        }
      ]
    },
    availableNotes: ["G4", "A4", "B4", "C5", "D5", "E5", "F#5", "G5"],
    expectedAnswers: {
      reconstruction: [
        { measure: 0, voice: 0, noteIdx: 2, pitch: "A4" },
        { measure: 0, voice: 0, noteIdx: 4, pitch: "C5" },
        { measure: 1, voice: 0, noteIdx: 2, pitch: "G4" },
        { measure: 2, voice: 0, noteIdx: 4, pitch: "F#5" },
        { measure: 3, voice: 0, noteIdx: 0, pitch: "G5" }
      ]
    },
    question: {
      en: "Which musical interval separates the first two notes of Bach's Minuet?",
      es: "¿Qué intervalo musical separa las dos primeras notas del Minueto de Bach?",
      options: [
        { en: "Perfect Fifth", es: "Quinta Justa", correct: true },
        { en: "Perfect Fourth", es: "Cuarta Justa", correct: false },
        { en: "Major Third", es: "Tercera Mayor", correct: false },
        { en: "Octave", es: "Octava", correct: false }
      ]
    },
    xpBase: 70
  },
  {
    id: "beethoven-fifth-dictation",
    name: {
      en: "L. van Beethoven — Symphony No. 5 (Motif)",
      es: "L. van Beethoven — Sinfonía N° 5 (Motivo)"
    },
    difficulty: {
      en: "Medium",
      es: "Medio"
    },
    concept: {
      en: "Repeated Notes & Rests",
      es: "Notas Repetidas y Silencios"
    },
    description: {
      en: "Reconstruct the famous 'Fate Motif' opening of Beethoven's 5th Symphony. Reconstruct the missing repeating notes and the final held notes.",
      es: "Reconstruye la famosa obertura del 'Motivo del Destino' de la Quinta Sinfonía de Beethoven. Rellena las notas repetitivas y las notas largas finales."
    },
    theory: {
      en: "### Rhythmic Precision & Repeated Notes\n\nBeethoven's 5th Symphony starts with a dramatic rest on beat 1, followed by three rapid, driving repeated eighth notes that drop down to a long, sustained note. Listening to rhythmic values and recognizing when pitches repeat is vital for dictation.\n\nNotice how the motif repeats a step lower immediately after, establishing the dark, intense mood of C minor.",
      es: "### Precisión Rítmica y Notas Repetidas\n\nLa 5ª Sinfonía de Beethoven comienza con un silencio dramático en el primer tiempo, seguido de tres corcheas rápidas y repetidas que descienden a una nota larga sostenida. Identificar la repetición de alturas y los silencios rítmicos es de suma importancia en el entrenamiento auditivo.\n\nObserva cómo el motivo se repite un tono más abajo inmediatamente después, estableciendo el tono tenso y oscuro de Do menor."
    },
    composition: {
      clef: "treble",
      timeSignature: [2, 4],
      keySignature: "Eb",
      measures: [
        {
          voices: [
            [
              { duration: "8" }, // Silent Rest
              { pitch: "G4", duration: "8" },
              { duration: "8" }, // Expected G4 (noteIdx: 2)
              { duration: "8" }  // Expected G4 (noteIdx: 3)
            ]
          ]
        },
        {
          voices: [
            [
              { duration: "2" }  // Expected Eb4 (noteIdx: 0)
            ]
          ]
        },
        {
          voices: [
            [
              { duration: "8" }, // Silent Rest
              { pitch: "F4", duration: "8" },
              { pitch: "F4", duration: "8" },
              { pitch: "F4", duration: "8" }
            ]
          ]
        },
        {
          voices: [
            [
              { duration: "2" }  // Expected D4 (noteIdx: 0)
            ]
          ]
        }
      ]
    },
    availableNotes: ["C4", "D4", "Eb4", "F4", "G4", "Ab4"],
    expectedAnswers: {
      reconstruction: [
        { measure: 0, voice: 0, noteIdx: 2, pitch: "G4" },
        { measure: 0, voice: 0, noteIdx: 3, pitch: "G4" },
        { measure: 1, voice: 0, noteIdx: 0, pitch: "Eb4" },
        { measure: 3, voice: 0, noteIdx: 0, pitch: "D4" }
      ]
    },
    question: {
      en: "Which note values form the opening rhythmic motif of Beethoven's 5th?",
      es: "¿Qué valores de nota forman el motivo rítmico de apertura de la 5ª de Beethoven?",
      options: [
        { en: "Three eighth notes followed by a half note", es: "Tres corcheas seguidas de una blanca", correct: true },
        { en: "Three quarter notes followed by a whole note", es: "Tres negras seguidas de una redonda", correct: false },
        { en: "Three sixteenth notes followed by a quarter note", es: "Tres semicorcheas seguidas de una negra", correct: false },
        { en: "Four eighth notes in succession", es: "Cuatro corcheas consecutivas", correct: false }
      ]
    },
    xpBase: 80
  },
  {
    id: "mozart-nachtmusik-dictation",
    name: {
      en: "W.A. Mozart — Eine kleine Nachtmusik",
      es: "W.A. Mozart — Pequeña Serenata Nocturna"
    },
    difficulty: {
      en: "Medium",
      es: "Medio"
    },
    concept: {
      en: "Arpeggios & Triad Outlines",
      es: "Arpegios y Esquemas de Tríada"
    },
    description: {
      en: "Listen to the famous ascending arpeggiated theme and reconstruct the missing pitches in the arpeggios of G major and D major.",
      es: "Escucha el famoso tema de arpegios ascendentes de Mozart y reconstruye las alturas que faltan en los arpegios de Sol mayor y Re mayor."
    },
    theory: {
      en: "### Arpeggios and Chord Outlines\n\nAn **arpeggio** occurs when the notes of a chord are played one after another rather than simultaneously. Mozart outlines key harmonies (G major tonic, D major dominant) in this opening fanfare.\n\nLearning to identify arpeggiated triad tones (root, third, fifth) helps you locate chord structures in melodies quickly by ear.",
      es: "### Arpegios y Perfiles de Acorde\n\nUn **arpegio** ocurre cuando las notas de un acorde se tocan una tras otra en lugar de sonar en simultáneo. Mozart perfila las armonías principales (tónica de Sol mayor, dominante de Re mayor) en esta fanfarria de apertura.\n\nAprender a reconocer las notas de un acorde arpegiado (fundamental, tercera, quinta) te ayuda a ubicar rápidamente estructuras armónicas por oído."
    },
    composition: {
      clef: "treble",
      timeSignature: [4, 4],
      keySignature: "G",
      measures: [
        {
          voices: [
            [
              { pitch: "G4", duration: "4" },
              { duration: "4" }, // Expected D4 (noteIdx: 1)
              { pitch: "G4", duration: "4" },
              { duration: "4" }  // Expected B4 (noteIdx: 3)
            ]
          ]
        },
        {
          voices: [
            [
              { pitch: "D5", duration: "2" },
              { duration: "2" }  // Expected B4 (noteIdx: 1)
            ]
          ]
        },
        {
          voices: [
            [
              { pitch: "C5", duration: "4" },
              { pitch: "A4", duration: "4" },
              { duration: "4" }, // Expected C5 (noteIdx: 2)
              { pitch: "F#4", duration: "4" }
            ]
          ]
        },
        {
          voices: [
            [
              { duration: "2" }, // Expected A4 (noteIdx: 0)
              { pitch: "D4", duration: "2" }
            ]
          ]
        }
      ]
    },
    availableNotes: ["D4", "F#4", "G4", "A4", "B4", "C5", "D5"],
    expectedAnswers: {
      reconstruction: [
        { measure: 0, voice: 0, noteIdx: 1, pitch: "D4" },
        { measure: 0, voice: 0, noteIdx: 3, pitch: "B4" },
        { measure: 1, voice: 0, noteIdx: 1, pitch: "B4" },
        { measure: 2, voice: 0, noteIdx: 2, pitch: "C5" },
        { measure: 3, voice: 0, noteIdx: 0, pitch: "A4" }
      ]
    },
    question: {
      en: "Which triad form is outlined by the first four notes of the theme?",
      es: "¿Qué tipo de tríada perfilan las primeras cuatro notas del tema?",
      options: [
        { en: "G Major Triad", es: "Tríada de Sol Mayor", correct: true },
        { en: "G Minor Triad", es: "Tríada de Sol Menor", correct: false },
        { en: "C Major Triad", es: "Tríada de Do Mayor", correct: false },
        { en: "D Dominant Seventh", es: "Séptima de Dominante de Re", correct: false }
      ]
    },
    xpBase: 85
  },
  {
    id: "tchaikovsky-swanlake-dictation",
    name: {
      en: "P. Tchaikovsky — Swan Lake Theme",
      es: "P. Tchaikovsky — Lago de los Cisnes"
    },
    difficulty: {
      en: "Hard",
      es: "Difícil"
    },
    concept: {
      en: "Minor Mode & Melodic Contours",
      es: "Modo Menor y Contornos Melódicos"
    },
    description: {
      en: "Listen to the famous mournful theme from Swan Lake in A minor and reconstruct the missing notes to complete the expressive melodic arc.",
      es: "Escucha el melancólico tema principal del Lago de los Cisnes en La menor y reconstruye las notas faltantes para completar su expresivo arco melódico."
    },
    theory: {
      en: "### The Minor Mode and Melodic Melancholy\n\nTchaikovsky's Swan Lake main theme uses the natural minor scale to evoke deep sadness and longing. The melody features stepwise motion offset by dramatic leaps, winding down to resolve on the tonic note A.\n\nIn minor keys, identifying the half-step between degrees 5 and 6 (E to F in A minor) is key to hearing its mournful character.",
      es: "### El Modo Menor y la Melancolía Melódica\n\nEl tema del Lago de los Cisnes de Tchaikovsky utiliza la escala menor natural para evocar una profunda tristeza y anhelo. La melodía se caracteriza por un movimiento conjunto interrumpido por saltos dramáticos, resolviendo finalmente en la tónica La.\n\nEn tonalidades menores, reconocer el semitono entre los grados 5 y 6 (Mi a Fa en La menor) es clave para percibir su carácter melancólico."
    },
    composition: {
      clef: "treble",
      timeSignature: [4, 4],
      keySignature: "C", // A Minor uses no accidentals in key signature
      measures: [
        {
          voices: [
            [
              { pitch: "A4", duration: "2" },
              { pitch: "C5", duration: "4" },
              { duration: "4" }  // Expected D5 (noteIdx: 2)
            ]
          ]
        },
        {
          voices: [
            [
              { duration: "2d" }, // Expected E5 (noteIdx: 0)
              { pitch: "F5", duration: "4" }
            ]
          ]
        },
        {
          voices: [
            [
              { pitch: "E5", duration: "4" },
              { duration: "4" }, // Expected D5 (noteIdx: 1)
              { pitch: "C5", duration: "4" },
              { duration: "4" }  // Expected B4 (noteIdx: 3)
            ]
          ]
        },
        {
          voices: [
            [
              { duration: "1" }  // Expected A4 (noteIdx: 0)
            ]
          ]
        }
      ]
    },
    availableNotes: ["A4", "B4", "C5", "D5", "E5", "F5"],
    expectedAnswers: {
      reconstruction: [
        { measure: 0, voice: 0, noteIdx: 2, pitch: "D5" },
        { measure: 1, voice: 0, noteIdx: 0, pitch: "E5" },
        { measure: 2, voice: 0, noteIdx: 1, pitch: "D5" },
        { measure: 2, voice: 0, noteIdx: 3, pitch: "B4" },
        { measure: 3, voice: 0, noteIdx: 0, pitch: "A4" }
      ]
    },
    question: {
      en: "What key is the Swan Lake main theme written in?",
      es: "¿En qué tonalidad está escrito el tema principal del Lago de los Cisnes?",
      options: [
        { en: "A Minor", es: "La Menor", correct: true },
        { en: "A Major", es: "La Mayor", correct: false },
        { en: "D Minor", es: "Re Menor", correct: false },
        { en: "C Major", es: "Do Mayor", correct: false }
      ]
    },
    xpBase: 100
  }
];
