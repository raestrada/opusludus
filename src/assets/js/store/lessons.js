// Lessons Catalog — Educational content for each module
export const LESSONS = {
  "l1-m01": {
    es: {
      intro: "La música se escribe en un conjunto de 5 líneas y 4 espacios llamado **pentagrama**. Las líneas y espacios se cuentan de abajo hacia arriba.",
      details: [
        "**Clave de Sol**: Se usa para instrumentos agudos (como el **violín** y la mano derecha del piano). Sitúa la nota Sol en la segunda línea.",
        "**Notas en líneas (Clave de Sol)**: Mi, Sol, Si, Re, Fa (E, G, B, D, F).",
        "**Notas en espacios (Clave de Sol)**: Fa, La, Do, Mi (F, A, C, E), que forman la palabra inglesa *FACE*.",
        "En este primer desafío, practicarás ubicando las notas naturales (Do, Re, Mi, Fa, Sol, La, Si) dentro del pentagrama."
      ],
      exampleTitle: "Ejemplo: Escala de Do Mayor en el Pentagrama",
      exampleDesc: "Escucha cómo suenan las notas ordenadas en sentido ascendente desde el Do central (C4)."
    },
    en: {
      intro: "Music is written on a set of 5 lines and 4 spaces called the **staff**. Lines and spaces are counted from bottom to top.",
      details: [
        "**Treble Clef**: Used for high-pitched instruments (like the **violin** and the piano's right hand). It centers on the G note on the second line.",
        "**Line Notes (Treble Clef)**: E, G, B, D, F.",
        "**Space Notes (Treble Clef)**: F, A, C, E (spelling *FACE*).",
        "In this first challenge, you will practice placing natural notes on the correct lines and spaces."
      ],
      exampleTitle: "Example: C Major Scale on the Staff",
      exampleDesc: "Listen to the notes ascending from middle C (C4)."
    },
    exampleComposition: {
      clef: "treble",
      timeSignature: [4, 4],
      keySignature: "C",
      measures: [
        {
          voices: [[
            { pitch: "C4", duration: "4" },
            { pitch: "D4", duration: "4" },
            { pitch: "E4", duration: "4" },
            { pitch: "F4", duration: "4" }
          ]]
        },
        {
          voices: [[
            { pitch: "G4", duration: "4" },
            { pitch: "A4", duration: "4" },
            { pitch: "B4", duration: "4" },
            { pitch: "C5", duration: "4" }
          ]]
        }
      ]
    }
  },
  "l1-m02": {
    es: {
      intro: "El ritmo determina cuánto dura cada sonido en el tiempo. Las duraciones se representan con **figuras rítmicas**.",
      details: [
        "**Redonda (1)**: Dura 4 tiempos. Ocupa todo un compás de 4/4.",
        "**Blanca (2)**: Dura 2 tiempos. Se necesitan dos blancas para llenar un compás.",
        "**Negra (4)**: Dura 1 tiempo (es la unidad básica en compás de 4/4).",
        "**Corchea (8)**: Dura 1/2 tiempo. Dos corcheas caben en un solo tiempo.",
        "En un compás de 4/4, la suma de las figuras de cada compás debe sumar exactamente **4 tiempos**."
      ],
      exampleTitle: "Ejemplo: Combinaciones Rítmicas en 4/4",
      exampleDesc: "Escucha cómo fluyen diferentes duraciones en un compás: una redonda (4 tiempos), luego dos blancas (2+2) y finalmente cuatro negras (1+1+1+1)."
    },
    en: {
      intro: "Rhythm determines how long each sound lasts. Durations are represented by **rhythmic figures**.",
      details: [
        "**Whole Note (1)**: Lasts 4 beats. Fills an entire 4/4 measure.",
        "**Half Note (2)**: Lasts 2 beats. You need two half notes to fill a measure.",
        "**Quarter Note (4)**: Lasts 1 beat (the basic pulse in 4/4 time).",
        "**Eighth Note (8)**: Lasts 1/2 beat. Two eighth notes fit in one beat.",
        "In a 4/4 time signature, the sum of all durations in a measure must equal exactly **4 beats**."
      ],
      exampleTitle: "Example: Rhythmic Combinations in 4/4",
      exampleDesc: "Listen to how different durations flow: a whole note (4 beats), then two half notes (2+2), and finally four quarter notes (1+1+1+1)."
    },
    exampleComposition: {
      clef: "treble",
      timeSignature: [4, 4],
      keySignature: "C",
      measures: [
        {
          voices: [[
            { pitch: "G4", duration: "1" }
          ]]
        },
        {
          voices: [[
            { pitch: "E4", duration: "2" },
            { pitch: "G4", duration: "2" }
          ]]
        },
        {
          voices: [[
            { pitch: "C4", duration: "4" },
            { pitch: "D4", duration: "4" },
            { pitch: "E4", duration: "4" },
            { pitch: "C4", duration: "4" }
          ]]
        }
      ]
    }
  },
  "l1-m03": {
    es: {
      intro: "La **métrica** organiza los pulsos en grupos regulares mediante indicaciones de compás.",
      details: [
        "**Compás 4/4**: 4 tiempos por compás. Acento fuerte en el tiempo 1, acento semifuerte en el tiempo 3.",
        "**Compás 3/4**: 3 tiempos por compás (ritmo de vals: **UNO**-dos-tres). Acento fuerte en el tiempo 1.",
        "**Compás 2/4**: 2 tiempos por compás (ritmo de marcha: **UNO**-dos). Acento fuerte en el tiempo 1.",
        "En composición clásica, colocar notas más largas en los tiempos fuertes (tiempo 1) da estabilidad a la melodía."
      ],
      exampleTitle: "Ejemplo: Melodía en Métrica de 3/4 (Vals)",
      exampleDesc: "Presta atención al acento natural que ocurre en la primera nota de cada compás."
    },
    en: {
      intro: "The **time signature** organizes beats into regular groups or bars.",
      details: [
        "**4/4 Meter**: 4 beats per bar. Strong accent on beat 1, semi-strong on beat 3.",
        "**3/4 Meter**: 3 beats per bar (waltz rhythm: **ONE**-two-three). Strong accent on beat 1.",
        "**2/4 Meter**: 2 beats per bar (march rhythm: **ONE**-two). Strong accent on beat 1.",
        "In classical composition, placing longer notes on strong beats (beat 1) provides melodic stability."
      ],
      exampleTitle: "Example: Melody in 3/4 Meter (Waltz)",
      exampleDesc: "Pay attention to the natural accent that occurs on the first note of each measure."
    },
    exampleComposition: {
      clef: "treble",
      timeSignature: [3, 4],
      keySignature: "C",
      measures: [
        {
          voices: [[
            { pitch: "C4", duration: "4" },
            { pitch: "E4", duration: "4" },
            { pitch: "G4", duration: "4" }
          ]]
        },
        {
          voices: [[
            { pitch: "A4", duration: "2" },
            { pitch: "G4", duration: "4" }
          ]]
        },
        {
          voices: [[
            { pitch: "F4", duration: "4" },
            { pitch: "E4", duration: "4" },
            { pitch: "D4", duration: "4" }
          ]]
        },
        {
          voices: [[
            { pitch: "C4", duration: "2d" }
          ]]
        }
      ]
    }
  },
  "l1-m05": {
    es: {
      intro: "Una **escala mayor** es una secuencia ordenada de notas que transmite una sensación alegre y brillante.",
      details: [
        "Se construye siguiendo un patrón específico de intervalos (distancias) de **Tono (T)** y **Semitono (S)**:",
        "**Patrón Mayor**: Tono - Tono - Semitono - Tono - Tono - Tono - Semitono (T - T - S - T - T - T - S).",
        "La escala de **Do Mayor** no tiene alteraciones (todas son teclas blancas).",
        "Otras escalas requieren sostenidos (#) o bemoles (b) para mantener el patrón. Por ejemplo, **Sol Mayor** necesita Fa# (F#) y **Fa Mayor** necesita Si♭ (Bb)."
      ],
      exampleTitle: "Ejemplo: Escala de Do Mayor Ascendente",
      exampleDesc: "Escucha la secuencia ordenada de tonos y semitonos partiendo de Do hasta el Do de la octava superior."
    },
    en: {
      intro: "A **major scale** is an ordered sequence of notes that conveys a bright, happy character.",
      details: [
        "It is built using a specific pattern of intervals: **Whole steps (W)** and **Half steps (H)**:",
        "**Major Pattern**: Whole - Whole - Half - Whole - Whole - Whole - Half (W - W - H - W - W - W - H).",
        "The **C Major** scale has no accidentals (all white keys).",
        "Other keys require sharps (#) or flats (b) to preserve the pattern. For instance, **G Major** needs F#, and **F Major** needs Bb."
      ],
      exampleTitle: "Example: Ascending C Major Scale",
      exampleDesc: "Listen to the ordered sequence of whole and half steps starting from C up to C an octave higher."
    },
    exampleComposition: {
      clef: "treble",
      timeSignature: [4, 4],
      keySignature: "C",
      measures: [
        {
          voices: [[
            { pitch: "C4", duration: "4" },
            { pitch: "D4", duration: "4" },
            { pitch: "E4", duration: "4" },
            { pitch: "F4", duration: "4" }
          ]]
        },
        {
          voices: [[
            { pitch: "G4", duration: "4" },
            { pitch: "A4", duration: "4" },
            { pitch: "B4", duration: "4" },
            { pitch: "C5", duration: "4" }
          ]]
        }
      ]
    }
  }
};
