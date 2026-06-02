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
    theory: {
      en: "### The Perfect Authentic Cadence (V-I)\n\nA **cadence** is a point of resolution or rest at the end of a musical phrase. A Perfect Authentic Cadence occurs when the dominant chord (degree V, G major in C major) resolves to the tonic chord (degree I, C major in C major), with both chords in root position (the bass moving from G to C).\n\nThis movement creates the strongest sense of finality in classical tonal music.",
      es: "### La Cadencia Armónica Perfecta (V-I)\n\nUna **cadencia** es el punto de resolución o descanso al final de una frase musical. La Cadencia Auténtica Perfecta se produce cuando el acorde de dominante (grado V, Sol en Do mayor) resuelve en el acorde de tónica (grado I, Do en Do mayor), con ambos acordes en estado fundamental (las fundamentales en el bajo: Sol2 resolviendo a Do3).\n\nEste movimiento crea la sensación más fuerte de conclusión en la música clásica tonal."
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
    theory: {
      en: "### Voice Leading: Parallel Octaves\n\nIn classical harmony, each voice (soprano, alto, tenor, bass) must maintain its melodic independence. **Parallel octaves** occur when two voices separated by an octave move in the same direction to another octave (e.g., soprano moving D4 to C4, while bass moves D3 to C3).\n\nThis is forbidden in classical style because it momentarily merges the two voices, destroying their independence and textural richness.",
      es: "### Conducción de Voces: Octavas Paralelas\n\nEn la armonía clásica, cada voz (soprano, contralto, tenor, bajo) debe mantener su independencia melódica. Las **octavas paralelas** ocurren cuando dos voces separadas por una octava se mueven en la misma dirección hacia otra octava (ej. la soprano se mueve de Re4 a Do4, mientras el bajo se mueve de Re3 a Do3).\n\nEsto está prohibido en el estilo clásico porque fusiona momentáneamente las dos voces, destruyendo su independencia e individualidad tímbrica."
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
    theory: {
      en: "### Period Structure & Half Cadence\n\nA **musical period** is often split into two phrases: an **antecedent** (question) and a **consequent** (answer). The antecedent typically ends with a **half cadence** on degree V (dominant pitch A in G major key), which leaves the melody suspended or unfinished.\n\nThe consequent phrase then repeats the opening but resolves stably on the tonic (G major), completing the cycle of tension and resolution.",
      es: "### La Estructura de Período y la Semicadencia\n\nUn **período musical** a menudo se divide en dos frases: un **antecedente** (pregunta) y un **consecuente** (respuesta). El antecedente suele terminar con una **semicadencia** en el grado V (nota La en tonalidad de Sol mayor), lo que genera tensión y deja la melodía suspendida o inconclusa.\n\nLa frase consecuente repite el tema pero concluye de forma estable en la tónica (Sol mayor), cerrando el ciclo de tensión-resolución."
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
  },
  {
    id: "pachelbel-canon",
    name: {
      en: "J. Pachelbel — Canon in D",
      es: "J. Pachelbel — Canon en Re"
    },
    difficulty: {
      en: "Easy",
      es: "Fácil"
    },
    concept: {
      en: "Ground Bass (Basso Ostinato)",
      es: "Bajo Ostinato"
    },
    description: {
      en: "Pachelbel's famous Canon uses a repeating bass line (ground bass). The fourth note of the bass pattern in measure 1 is incorrect — it should be F#3 but an E3 has taken its place. Find it and correct it to restore the harmonic progression.",
      es: "El famoso Canon de Pachelbel usa una línea de bajo repetitiva (bajo ostinato). La cuarta nota del patrón del bajo en el compás 1 es incorrecta — debería ser Fa#3 pero un Mi3 ha tomado su lugar. Encuéntrala y corrígela para restaurar la progresión armónica."
    },
    theory: {
      en: "### Ground Bass (Basso Ostinato)\n\nA **ground bass** is a short, repeating bass line that serves as the harmonic and structural foundation of a piece. Pachelbel's Canon in D is the most famous example: the same 8-note bass pattern (D–A–B–F#–G–D–G–A) repeats throughout the entire work while the upper voices weave increasingly elaborate variations.\n\nThis technique creates a hypnotic sense of continuity — the bass is the anchor, while everything above it blossoms.",
      es: "### Bajo Ostinato\n\nUn **bajo ostinato** es una línea de bajo corta y repetitiva que sirve como fundamento armónico y estructural de una pieza. El Canon en Re de Pachelbel es el ejemplo más famoso: el mismo patrón de 8 notas (Re–La–Si–Fa#–Sol–Re–Sol–La) se repite durante toda la obra mientras las voces superiores tejen variaciones cada vez más elaboradas.\n\nEsta técnica crea una sensación hipnótica de continuidad — el bajo es el ancla, mientras todo lo que está por encima florece."
    },
    composition: {
      clef: "grand",
      timeSignature: [4, 4],
      keySignature: "D",
      measures: [
        {
          voices: [
            [
              { pitch: "D5", duration: "2" },
              { pitch: "C#5", duration: "2" }
            ],
            [
              { pitch: "D3", duration: "4" },
              { pitch: "A2", duration: "4" },
              { pitch: "B2", duration: "4" },
              { pitch: "E3", duration: "4" }
            ]
          ]
        },
        {
          voices: [
            [
              { pitch: "B4", duration: "2" },
              { pitch: "A4", duration: "2" }
            ],
            [
              { pitch: "G3", duration: "4" },
              { pitch: "D3", duration: "4" },
              { pitch: "G3", duration: "4" },
              { pitch: "A2", duration: "4" }
            ]
          ]
        }
      ]
    },
    availableNotes: ["D3", "E3", "F#3", "G3", "A2", "B2", "C#3"],
    expectedAnswers: {
      reconstruction: [
        { measure: 0, voice: 1, noteIdx: 3, pitch: "F#3" }
      ]
    },
    question: {
      en: "What is the purpose of a ground bass (basso ostinato) in Baroque music?",
      es: "¿Cuál es la función de un bajo ostinato en la música barroca?",
      options: [
        { en: "To provide a repeating harmonic foundation over which variations are built", es: "Proveer una base armónica repetitiva sobre la cual se construyen variaciones", correct: true },
        { en: "To double the melody one octave lower", es: "Duplicar la melodía una octava más grave", correct: false },
        { en: "To play only on the strong beats of each measure", es: "Tocar solo en los tiempos fuertes de cada compás", correct: false },
        { en: "To introduce random modulations", es: "Introducir modulaciones aleatorias", correct: false }
      ]
    },
    xpBase: 60
  },
  {
    id: "beethoven-fifth",
    name: {
      en: "L. van Beethoven — Symphony No. 5",
      es: "L. van Beethoven — Sinfonía N° 5"
    },
    difficulty: {
      en: "Easy",
      es: "Fácil"
    },
    concept: {
      en: "Motivic Development",
      es: "Desarrollo Motívico"
    },
    description: {
      en: "Beethoven's iconic four-note motif (short-short-short-long) is presented and then sequenced a step lower. The second appearance has a wrong note that breaks the sequential pattern. Correct it to restore the development.",
      es: "El icónico motivo de cuatro notas de Beethoven (corto-corto-corto-largo) se presenta y luego se secuencia un grado más bajo. La segunda aparición tiene una nota incorrecta que rompe el patrón secuencial. Corrígela para restaurar el desarrollo."
    },
    theory: {
      en: "### Motivic Development\n\nA **motif** is the shortest recognizable musical idea — a handful of notes with a distinct rhythm and contour. Beethoven's Fifth Symphony opens with perhaps the most famous motif in history: three short notes followed by a long one (G–G–G–E♭).\n\n**Motivic development** transforms this tiny cell: it is sequenced (repeated at different pitch levels), fragmented, inverted, and threaded through the entire symphony. This technique gives a piece organic unity — everything grows from the same seed.",
      es: "### Desarrollo Motívico\n\nUn **motivo** es la idea musical reconocible más corta — un puñado de notas con ritmo y contorno distintivos. La Quinta Sinfonía de Beethoven abre con quizás el motivo más famoso de la historia: tres notas cortas seguidas de una larga (Sol–Sol–Sol–Mi♭).\n\nEl **desarrollo motívico** transforma esta diminuta célula: se secuencia (se repite a diferentes alturas), se fragmenta, se invierte y se entreteje a través de toda la sinfonía. Esta técnica da unidad orgánica a la pieza — todo crece de la misma semilla."
    },
    composition: {
      clef: "treble",
      timeSignature: [4, 4],
      keySignature: "C",
      measures: [
        {
          voices: [
            [
              { pitch: "G4", duration: "4" },
              { pitch: "G4", duration: "4" },
              { pitch: "G4", duration: "4" },
              { pitch: "Eb4", duration: "4" }
            ]
          ]
        },
        {
          voices: [
            [
              { pitch: "F4", duration: "4" },
              { pitch: "F4", duration: "4" },
              { pitch: "F4", duration: "4" },
              { duration: "4" }
            ]
          ]
        }
      ]
    },
    availableNotes: ["C4", "D4", "Eb4", "F4", "G4"],
    expectedAnswers: {
      reconstruction: [
        { measure: 1, voice: 0, noteIdx: 3, pitch: "D4" }
      ]
    },
    question: {
      en: "What is motivic development in classical composition?",
      es: "¿Qué es el desarrollo motívico en la composición clásica?",
      options: [
        { en: "Transforming a short musical idea through sequence, inversion, and fragmentation", es: "Transformar una idea musical breve mediante secuencia, inversión y fragmentación", correct: true },
        { en: "Writing a completely new theme for each section of the piece", es: "Escribir un tema completamente nuevo para cada sección de la pieza", correct: false },
        { en: "Repeating the same melody without any change", es: "Repetir la misma melodía sin ningún cambio", correct: false },
        { en: "Gradually increasing the tempo throughout the piece", es: "Aumentar gradualmente el tempo a lo largo de la pieza", correct: false }
      ]
    },
    xpBase: 55
  },
  {
    id: "mozart-nachtmusik",
    name: {
      en: "W.A. Mozart — Eine Kleine Nachtmusik",
      es: "W.A. Mozart — Pequeña Serenata Nocturna"
    },
    difficulty: {
      en: "Medium",
      es: "Medio"
    },
    concept: {
      en: "Alberti Bass",
      es: "Bajo Alberti"
    },
    description: {
      en: "Mozart accompanies his melody with an Alberti bass — a broken chord pattern. In measure 1, the third note of the Alberti figure is wrong (G3 instead of D4, the fifth of the chord). Restore the correct note to fix the accompaniment.",
      es: "Mozart acompaña su melodía con un bajo Alberti — un patrón de acorde quebrado. En el compás 1, la tercera nota de la figura Alberti es incorrecta (Sol3 en lugar de Re4, la quinta del acorde). Restaura la nota correcta para arreglar el acompañamiento."
    },
    theory: {
      en: "### The Alberti Bass\n\nThe **Alberti bass** is a broken-chord accompaniment pattern where the notes of a chord are played in the order: low, high, middle, high. For a C major triad (C–E–G), the Alberti pattern would be: C3–G3–E3–G3.\n\nNamed after the Italian composer Domenico Alberti, this pattern became the signature of Classical-period keyboard accompaniment (especially in Mozart and early Beethoven). It provides harmonic support without overpowering the melody.",
      es: "### El Bajo Alberti\n\nEl **bajo Alberti** es un patrón de acompañamiento de acorde quebrado donde las notas de un acorde se tocan en el orden: grave, aguda, media, aguda. Para una tríada de Do mayor (Do–Mi–Sol), el patrón Alberti sería: Do3–Sol3–Mi3–Sol3.\n\nNombrado en honor al compositor italiano Domenico Alberti, este patrón se convirtió en la firma del acompañamiento de teclado del período Clásico (especialmente en Mozart y el primer Beethoven). Proporciona soporte armónico sin opacar la melodía."
    },
    composition: {
      clef: "grand",
      timeSignature: [4, 4],
      keySignature: "G",
      measures: [
        {
          voices: [
            [
              { pitch: "G4", duration: "4" },
              { pitch: "D5", duration: "2" },
              { pitch: "B4", duration: "4" }
            ],
            [
              { pitch: "G3", duration: "8" },
              { pitch: "B3", duration: "8" },
              { pitch: "G3", duration: "8" },
              { pitch: "B3", duration: "8" },
              { pitch: "G3", duration: "8" },
              { pitch: "B3", duration: "8" },
              { pitch: "D4", duration: "8" },
              { pitch: "B3", duration: "8" }
            ]
          ]
        },
        {
          voices: [
            [
              { pitch: "A4", duration: "4" },
              { pitch: "F#4", duration: "2" },
              { pitch: "D4", duration: "4" }
            ],
            [
              { pitch: "D3", duration: "8" },
              { pitch: "F#3", duration: "8" },
              { pitch: "A3", duration: "8" },
              { pitch: "F#3", duration: "8" },
              { pitch: "D3", duration: "8" },
              { pitch: "F#3", duration: "8" },
              { pitch: "A3", duration: "8" },
              { pitch: "F#3", duration: "8" }
            ]
          ]
        }
      ]
    },
    availableNotes: ["D3", "E3", "F#3", "G3", "A3", "B3", "C4", "D4"],
    expectedAnswers: {
      reconstruction: [
        { measure: 0, voice: 1, noteIdx: 2, pitch: "D4" }
      ]
    },
    question: {
      en: "What is the pattern of an Alberti bass for a G major triad (G–B–D)?",
      es: "¿Cuál es el patrón de un bajo Alberti para una tríada de Sol mayor (Sol–Si–Re)?",
      options: [
        { en: "G – D – B – D (low, high, middle, high)", es: "Sol – Re – Si – Re (grave, aguda, media, aguda)", correct: true },
        { en: "G – B – D – G (ascending arpeggio)", es: "Sol – Si – Re – Sol (arpegio ascendente)", correct: false },
        { en: "G – G – D – B (two roots then fifth then third)", es: "Sol – Sol – Re – Si (dos fundamentales, luego quinta, luego tercera)", correct: false },
        { en: "B – G – D – G (starting on the third)", es: "Si – Sol – Re – Sol (comenzando en la tercera)", correct: false }
      ]
    },
    xpBase: 70
  },
  {
    id: "chopin-prelude4",
    name: {
      en: "F. Chopin — Prelude Op. 28 No. 4",
      es: "F. Chopin — Preludio Op. 28 N° 4"
    },
    difficulty: {
      en: "Hard",
      es: "Difícil"
    },
    concept: {
      en: "Chromatic Harmony",
      es: "Armonía Cromática"
    },
    description: {
      en: "Chopin's 'Suffocation' prelude features a haunting chromatic descent in the bass. The second bass note in measure 2 is missing. Fill it with the correct pitch (G#2) to complete the chromatic line that descends by half steps.",
      es: "El preludio 'Sofocación' de Chopin presenta un descenso cromático inquietante en el bajo. La segunda nota del bajo en el compás 2 está ausente. Complétala con la altura correcta (Sol#2) para completar la línea cromática que desciende por semitonos."
    },
    theory: {
      en: "### Chromaticism\n\n**Chromaticism** is the use of notes outside the prevailing key signature — moving by half steps (semitones) rather than sticking to the diatonic scale. While diatonic melodies step through the scale (e.g., C–D–E–F), a chromatic line fills in every semitone (C–C#–D–D#–E–F).\n\nIn Chopin's E minor Prelude, the left hand descends chromatically: B–A#–A–G#–G–F#. This relentless half-step descent creates an atmosphere of inevitability and despair — the music seems to be slowly sinking.",
      es: "### Cromatismo\n\nEl **cromatismo** es el uso de notas fuera de la armadura de clave predominante — moviéndose por semitonos en lugar de ceñirse a la escala diatónica. Mientras que las melodías diatónicas avanzan por grados de la escala (ej. Do–Re–Mi–Fa), una línea cromática llena cada semitono (Do–Do#–Re–Re#–Mi–Fa).\n\nEn el Preludio en Mi menor de Chopin, la mano izquierda desciende cromáticamente: Si–La#–La–Sol#–Sol–Fa#. Este descenso implacable crea una atmósfera de inevitabilidad y desesperación — la música parece hundirse lentamente."
    },
    composition: {
      clef: "grand",
      timeSignature: [4, 4],
      keySignature: "G",
      measures: [
        {
          voices: [
            [
              { pitch: "B4", duration: "4" },
              { pitch: "E4", duration: "4" },
              { pitch: "B4", duration: "4" },
              { pitch: "E4", duration: "4" }
            ],
            [
              { pitch: "B2", duration: "2" },
              { pitch: "A#2", duration: "2" }
            ]
          ]
        },
        {
          voices: [
            [
              { pitch: "B4", duration: "4" },
              { pitch: "E4", duration: "4" },
              { pitch: "B4", duration: "4" },
              { pitch: "E4", duration: "4" }
            ],
            [
              { pitch: "A2", duration: "2" },
              { duration: "2" }
            ]
          ]
        }
      ]
    },
    availableNotes: ["F#2", "G2", "G#2", "A2", "A#2", "B2"],
    expectedAnswers: {
      reconstruction: [
        { measure: 1, voice: 1, noteIdx: 1, pitch: "G#2" }
      ]
    },
    question: {
      en: "What distinguishes a chromatic line from a diatonic one?",
      es: "¿Qué distingue una línea cromática de una diatónica?",
      options: [
        { en: "It moves by half steps, filling all semitones between points", es: "Se mueve por semitonos, llenando todos los semitonos entre puntos", correct: true },
        { en: "It only uses the notes of the major scale", es: "Solo usa las notas de la escala mayor", correct: false },
        { en: "It always ascends", es: "Siempre asciende", correct: false },
        { en: "It avoids any repeated notes", es: "Evita cualquier nota repetida", correct: false }
      ]
    },
    xpBase: 110
  },
  {
    id: "vivaldi-spring",
    name: {
      en: "A. Vivaldi — Spring (The Four Seasons)",
      es: "A. Vivaldi — La Primavera (Las Cuatro Estaciones)"
    },
    difficulty: {
      en: "Easy",
      es: "Fácil"
    },
    concept: {
      en: "Melodic Sequence",
      es: "Secuencia Melódica"
    },
    description: {
      en: "Vivaldi's Spring theme uses a melodic sequence — the same rhythmic pattern repeated at different pitch levels. In measure 2, the last note is missing. Fill it with C#5 to maintain the ascending sequence pattern.",
      es: "El tema de La Primavera de Vivaldi usa una secuencia melódica — el mismo patrón rítmico repetido a diferentes alturas. En el compás 2, la última nota está ausente. Complétala con Do#5 para mantener el patrón de secuencia ascendente."
    },
    theory: {
      en: "### Melodic Sequence\n\nA **melodic sequence** is the repetition of a melodic pattern at a different pitch level — higher or lower. It's one of the most powerful tools for creating momentum and direction in music.\n\nVivaldi was a master of sequence. In Spring, the same rhythmic figure (quarter–quarter–quarter–quarter) is stated first on E5, then repeated a step higher: the first measure peaks on E5, and the second should peak on a higher note following the ascending sequence. Sequences drive music forward while maintaining coherence — the listener feels movement but recognizes familiarity.",
      es: "### Secuencia Melódica\n\nUna **secuencia melódica** es la repetición de un patrón melódico a diferente altura — más aguda o más grave. Es una de las herramientas más poderosas para crear impulso y dirección en la música.\n\nVivaldi fue un maestro de la secuencia. En La Primavera, la misma figura rítmica (negra–negra–negra–negra) se presenta primero en Mi5, y luego se repite un grado más arriba: el primer compás alcanza su pico en Mi5, y el segundo debería alcanzar una nota más aguda siguiendo la secuencia ascendente. Las secuencias impulsan la música hacia adelante manteniendo coherencia — el oyente siente movimiento pero reconoce familiaridad."
    },
    composition: {
      clef: "treble",
      timeSignature: [4, 4],
      keySignature: "E",
      measures: [
        {
          voices: [
            [
              { pitch: "B4", duration: "4" },
              { pitch: "E5", duration: "4" },
              { pitch: "E5", duration: "4" },
              { pitch: "E5", duration: "4" }
            ]
          ]
        },
        {
          voices: [
            [
              { pitch: "B4", duration: "4" },
              { pitch: "E5", duration: "4" },
              { pitch: "E5", duration: "4" },
              { duration: "4" }
            ]
          ]
        },
        {
          voices: [
            [
              { pitch: "C#5", duration: "4" },
              { pitch: "B4", duration: "4" },
              { pitch: "A4", duration: "4" },
              { pitch: "G#4", duration: "4" }
            ]
          ]
        }
      ]
    },
    availableNotes: ["G#4", "A4", "B4", "C#5", "D#5", "E5", "F#5"],
    expectedAnswers: {
      reconstruction: [
        { measure: 1, voice: 0, noteIdx: 3, pitch: "C#5" }
      ]
    },
    question: {
      en: "What is a melodic sequence?",
      es: "¿Qué es una secuencia melódica?",
      options: [
        { en: "A pattern repeated at different pitch levels", es: "Un patrón repetido a diferentes alturas", correct: true },
        { en: "A random series of notes without repetition", es: "Una serie aleatoria de notas sin repetición", correct: false },
        { en: "A chord progression that modulates to a new key", es: "Una progresión de acordes que modula a una nueva tonalidad", correct: false },
        { en: "A melody played backwards", es: "Una melodía tocada al revés", correct: false }
      ]
    },
    xpBase: 50
  },
  {
    id: "schubert-avemaria",
    name: {
      en: "F. Schubert — Ave Maria",
      es: "F. Schubert — Ave María"
    },
    difficulty: {
      en: "Easy",
      es: "Fácil"
    },
    concept: {
      en: "Melodic Contour & Phrasing",
      es: "Contorno Melódico y Fraseo"
    },
    description: {
      en: "Schubert's Ave Maria traces a graceful arch-shaped melodic contour. In measure 2, the third note is missing. Fill it with B4 to restore the smooth descent of the melodic arch.",
      es: "El Ave María de Schubert traza un elegante contorno melódico en forma de arco. En el compás 2, la tercera nota está ausente. Complétala con Si4 para restaurar el descenso suave del arco melódico."
    },
    theory: {
      en: "### Melodic Contour\n\nThe **melodic contour** is the overall shape of a melody — the pattern of rising and falling pitches. A good melody often has a clear contour: it rises to a climax and then descends to a point of rest (an *arch* contour), or it may follow an ascending line, a descending line, or an undulating wave.\n\nSchubert's Ave Maria features an arch contour: it rises from C5 to E5 (the peak), then gently descends back toward the tonic. This shape gives the melody a natural, breathing quality — like a vocal phrase.",
      es: "### Contorno Melódico\n\nEl **contorno melódico** es la forma general de una melodía — el patrón de ascensos y descensos. Una buena melodía suele tener un contorno claro: asciende hasta un clímax y luego desciende hasta un punto de reposo (contorno en *arco*), o puede seguir una línea ascendente, descendente u ondulante.\n\nEl Ave María de Schubert presenta un contorno en arco: asciende de Do5 a Mi5 (el pico), luego desciende suavemente hacia la tónica. Esta forma le da a la melodía una cualidad natural y respiratoria — como una frase vocal."
    },
    composition: {
      clef: "treble",
      timeSignature: [4, 4],
      keySignature: "C",
      measures: [
        {
          voices: [
            [
              { pitch: "C5", duration: "2" },
              { pitch: "C5", duration: "8" },
              { pitch: "B4", duration: "8" },
              { pitch: "C5", duration: "8" },
              { pitch: "E5", duration: "8" }
            ]
          ]
        },
        {
          voices: [
            [
              { pitch: "D5", duration: "4" },
              { pitch: "C5", duration: "4" },
              { duration: "4" },
              { pitch: "C5", duration: "4" }
            ]
          ]
        }
      ]
    },
    availableNotes: ["A4", "B4", "C5", "D5", "E5", "F5", "G5"],
    expectedAnswers: {
      reconstruction: [
        { measure: 1, voice: 0, noteIdx: 2, pitch: "B4" }
      ]
    },
    question: {
      en: "What type of melodic contour rises, reaches a peak, and then descends?",
      es: "¿Qué tipo de contorno melódico asciende, alcanza un pico y luego desciende?",
      options: [
        { en: "Arch contour", es: "Contorno en arco", correct: true },
        { en: "Static contour", es: "Contorno estático", correct: false },
        { en: "Angular contour", es: "Contorno angular", correct: false },
        { en: "Descending contour", es: "Contorno descendente", correct: false }
      ]
    },
    xpBase: 45
  },
  {
    id: "wagner-tristan",
    name: {
      en: "R. Wagner — Tristan und Isolde Prelude",
      es: "R. Wagner — Tristán e Isolda, Preludio"
    },
    difficulty: {
      en: "Hard",
      es: "Difícil"
    },
    concept: {
      en: "Chromaticism & Extended Harmony",
      es: "Cromatismo y Armonía Extendida"
    },
    description: {
      en: "Wagner's 'Tristan chord' (F–B–D#–G#) challenged 19th-century harmony. The second note of the held chord in measure 2 is missing. Fill it with B3 to complete the famous Tristan sonority.",
      es: "El 'acorde de Tristán' de Wagner (Fa–Si–Re#–Sol#) desafió la armonía del siglo XIX. La segunda nota del acorde sostenido en el compás 2 está ausente. Complétala con Si3 para completar la famosa sonoridad tristanesca."
    },
    theory: {
      en: "### The Tristan Chord\n\nThe **Tristan chord** (F–B–D#–G#) is arguably the most analyzed sonority in Western music. It appears in the opening bars of Wagner's opera *Tristan und Isolde* and resists traditional harmonic classification. Its genius lies in its ambiguity: it could be analyzed as a half-diminished seventh chord, a French augmented sixth, or a chromatic alteration — but its true power is in what it refuses to do: resolve.\n\nThis chord became a symbol of unfulfilled longing (*Sehnsucht*) and pointed the way toward the dissolution of traditional tonality in the 20th century.",
      es: "### El Acorde de Tristán\n\nEl **acorde de Tristán** (Fa–Si–Re#–Sol#) es posiblemente la sonoridad más analizada de la música occidental. Aparece en los compases iniciales de la ópera *Tristán e Isolda* de Wagner y se resiste a la clasificación armónica tradicional. Su genialidad radica en su ambigüedad: podría analizarse como un acorde de séptima semidisminuida, una sexta francesa aumentada o una alteración cromática — pero su verdadero poder está en lo que se niega a hacer: resolver.\n\nEste acorde se convirtió en símbolo del anhelo insatisfecho (*Sehnsucht*) y señaló el camino hacia la disolución de la tonalidad tradicional en el siglo XX."
    },
    composition: {
      clef: "grand",
      timeSignature: [4, 4],
      keySignature: "C",
      measures: [
        {
          voices: [
            [
              { pitch: "A4", duration: "4" },
              { pitch: "F4", duration: "4" },
              { pitch: "E4", duration: "4" },
              { pitch: "D#4", duration: "4" }
            ],
            [
              { pitch: "A2", duration: "2" },
              { pitch: "F3", duration: "2" }
            ]
          ]
        },
        {
          voices: [
            [
              { pitch: "G#4", duration: "1" }
            ],
            [
              { pitch: "F3", duration: "2" },
              { duration: "2" }
            ]
          ]
        }
      ]
    },
    availableNotes: ["A3", "B3", "C4", "D4", "D#4", "E4", "F3", "G#4"],
    expectedAnswers: {
      reconstruction: [
        { measure: 1, voice: 1, noteIdx: 1, pitch: "B3" }
      ]
    },
    question: {
      en: "What makes the 'Tristan chord' historically significant?",
      es: "¿Qué hace al 'acorde de Tristán' históricamente significativo?",
      options: [
        { en: "Its unresolved dissonance that pushed harmony toward atonality", es: "Su disonancia no resuelta que empujó la armonía hacia la atonalidad", correct: true },
        { en: "It was the first chord to use all twelve chromatic notes", es: "Fue el primer acorde en usar las doce notas cromáticas", correct: false },
        { en: "It is the loudest chord ever written for orchestra", es: "Es el acorde más fuerte jamás escrito para orquesta", correct: false },
        { en: "It was the first chord to be played on the piano", es: "Fue el primer acorde en tocarse en el piano", correct: false }
      ]
    },
    xpBase: 120
  },
  {
    id: "brahms-lullaby",
    name: {
      en: "J. Brahms — Lullaby Op. 49 No. 4",
      es: "J. Brahms — Canción de Cuna Op. 49 N° 4"
    },
    difficulty: {
      en: "Easy",
      es: "Fácil"
    },
    concept: {
      en: "Rhythmic Patterns in Triple Meter",
      es: "Patrones Rítmicos en Compás Ternario"
    },
    description: {
      en: "Brahms' beloved lullaby flows in a gentle 3/4 rhythm. The third note of measure 3 is missing. Fill it with E4 to complete the rocking triple-meter pattern that characterizes the lullaby form.",
      es: "La querida canción de cuna de Brahms fluye en un suave ritmo de 3/4. La tercera nota del compás 3 está ausente. Complétala con Mi4 para completar el patrón de balanceo en compás ternario que caracteriza la forma de canción de cuna."
    },
    theory: {
      en: "### Triple Meter & the Lullaby\n\n**Triple meter** (3/4 time) has three beats per measure, creating a natural rocking or swaying feel — strong-weak-weak. This is why lullabies, waltzes, and minuets overwhelmingly use triple meter: it mimics the gentle motion of rocking a baby to sleep.\n\nBrahms' Wiegenlied (Lullaby) is the quintessential example. The steady quarter-note pulse in 3/4 creates a hypnotic, comforting regularity. The melody outlines the tonic chord (C major) with a simple, stepwise contour — everything about it conveys warmth and security.",
      es: "### Compás Ternario y la Canción de Cuna\n\nEl **compás ternario** (3/4) tiene tres tiempos por compás, creando una sensación natural de balanceo — fuerte-débil-débil. Por eso las canciones de cuna, los valses y los minuetos usan abrumadoramente el compás ternario: imita el movimiento suave de mecer a un bebé.\n\nEl Wiegenlied (Canción de Cuna) de Brahms es el ejemplo por excelencia. El pulso constante de negras en 3/4 crea una regularidad hipnótica y reconfortante. La melodía perfila el acorde de tónica (Do mayor) con un contorno simple y por grados conjuntos — todo en ella transmite calidez y seguridad."
    },
    composition: {
      clef: "treble",
      timeSignature: [3, 4],
      keySignature: "C",
      measures: [
        {
          voices: [
            [
              { pitch: "G4", duration: "4" },
              { pitch: "G4", duration: "4" },
              { pitch: "G4", duration: "4" }
            ]
          ]
        },
        {
          voices: [
            [
              { pitch: "A4", duration: "4" },
              { pitch: "A4", duration: "4" },
              { pitch: "A4", duration: "4" }
            ]
          ]
        },
        {
          voices: [
            [
              { pitch: "G4", duration: "4" },
              { pitch: "F#4", duration: "4" },
              { duration: "4" }
            ]
          ]
        },
        {
          voices: [
            [
              { pitch: "D4", duration: "4" },
              { pitch: "D4", duration: "4" },
              { pitch: "C4", duration: "4" }
            ]
          ]
        }
      ]
    },
    availableNotes: ["C4", "D4", "E4", "F#4", "G4", "A4", "B4"],
    expectedAnswers: {
      reconstruction: [
        { measure: 2, voice: 0, noteIdx: 2, pitch: "E4" }
      ]
    },
    question: {
      en: "Why are lullabies traditionally written in triple meter (3/4)?",
      es: "¿Por qué las canciones de cuna se escriben tradicionalmente en compás ternario (3/4)?",
      options: [
        { en: "The strong-weak-weak pattern mimics a gentle rocking motion", es: "El patrón fuerte-débil-débil imita un suave movimiento de balanceo", correct: true },
        { en: "Because 3/4 is the fastest time signature", es: "Porque 3/4 es el compás más rápido", correct: false },
        { en: "Because babies can only count to three", es: "Porque los bebés solo pueden contar hasta tres", correct: false },
        { en: "Because it was the only meter allowed by 19th-century publishers", es: "Porque era el único compás permitido por los editores del siglo XIX", correct: false }
      ]
    },
    xpBase: 40
  }
];
