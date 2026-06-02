const translations = {
  en: {
    rank_novice: "Novice",
    rank_apprentice: "Apprentice",
    rank_composer: "Composer",
    rank_maestro: "Maestro",
    rank_virtuoso: "Virtuoso",
    xp: "XP",
    stars: "Stars",
    module_completed: "Module Completed!",
    stars_earned: "You earned {n} star(s)!",
    xp_earned: "+{n} XP",
    next_module: "Next Module",
    back_to_modules: "Back to Modules",
    play: "Play",
    stop: "Stop",
    reset: "Reset",
    submit: "Submit Composition",
    correct: "Correct!",
    incorrect: "Not quite right",
    feedback_great: "Excellent work!",
    feedback_good: "Good job!",
    feedback_try_again: "Keep trying, you're close!",
    rank_up: "Rank Up!",
  },
  es: {
    rank_novice: "Novato",
    rank_apprentice: "Aprendiz",
    rank_composer: "Compositor",
    rank_maestro: "Maestro",
    rank_virtuoso: "Virtuoso",
    xp: "XP",
    stars: "Estrellas",
    module_completed: "¡Módulo completado!",
    stars_earned: "¡Ganaste {n} estrella(s)!",
    xp_earned: "+{n} XP",
    next_module: "Siguiente módulo",
    back_to_modules: "Volver a módulos",
    play: "Reproducir",
    stop: "Detener",
    reset: "Reiniciar",
    submit: "Enviar composición",
    correct: "¡Correcto!",
    incorrect: "No es correcto aún",
    feedback_great: "¡Excelente trabajo!",
    feedback_good: "¡Buen trabajo!",
    feedback_try_again: "¡Sigue intentando, estás cerca!",
    rank_up: "¡Subiste de rango!",
  },
};

function getLocale() {
  return window.__OPUS_LUDUS__ ? window.__OPUS_LUDUS__.locale : "en";
}

export function t(key, replacements) {
  const locale = getLocale();
  const lang = translations[locale] || translations.en;
  let text = lang[key] || translations.en[key] || key;
  if (replacements) {
    Object.keys(replacements).forEach((k) => {
      text = text.replace(`{${k}}`, replacements[k]);
    });
  }
  return text;
}

export default translations;
