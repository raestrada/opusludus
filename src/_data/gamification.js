// Gamification data — XP tables, ranks, badges, streak bonuses

const RANKS = {
  novice: {
    key: "novice",
    name: { en: "Novice", es: "Novato" },
    minXp: 0,
    maxXp: 500,
    icon: "🎵",
  },
  apprentice: {
    key: "apprentice",
    name: { en: "Apprentice", es: "Aprendiz" },
    minXp: 500,
    maxXp: 1500,
    icon: "🎼",
  },
  composer: {
    key: "composer",
    name: { en: "Composer", es: "Compositor" },
    minXp: 1500,
    maxXp: 3500,
    icon: "🎹",
  },
  maestro: {
    key: "maestro",
    name: { en: "Maestro", es: "Maestro" },
    minXp: 3500,
    maxXp: 7000,
    icon: "🏆",
  },
  virtuoso: {
    key: "virtuoso",
    name: { en: "Virtuoso", es: "Virtuoso" },
    minXp: 7000,
    maxXp: Infinity,
    icon: "👑",
  },
};

const BADGES = [
  {
    id: "first-composition",
    name: { en: "First Composition", es: "Primera composición" },
    description: {
      en: "Complete your first module challenge.",
      es: "Completa tu primer desafío de módulo.",
    },
    icon: "⭐",
  },
  {
    id: "perfect-10",
    name: { en: "Perfect 10", es: "10 perfectos" },
    description: {
      en: "Score 3 stars on 10 modules.",
      es: "Consigue 3 estrellas en 10 módulos.",
    },
    icon: "💎",
  },
  {
    id: "all-scales",
    name: { en: "Scale Master", es: "Maestro de escalas" },
    description: {
      en: "Complete all scale modules.",
      es: "Completa todos los módulos de escalas.",
    },
    icon: "🎶",
  },
  {
    id: "level-2",
    name: { en: "Harmony Adept", es: "Adepto en armonía" },
    description: {
      en: "Complete all Level 2 modules.",
      es: "Completa todos los módulos de Nivel 2.",
    },
    icon: "🔮",
  },
  {
    id: "counterpoint",
    name: {
      en: "Counterpoint Initiate",
      es: "Iniciado en contrapunto",
    },
    description: {
      en: "Complete the first counterpoint module.",
      es: "Completa el primer módulo de contrapunto.",
    },
    icon: "🌀",
  },
  {
    id: "streak-7",
    name: { en: "7-Day Streak", es: "Racha de 7 días" },
    description: {
      en: "Practice 7 days in a row.",
      es: "Practica 7 días seguidos.",
    },
    icon: "🔥",
  },
  {
    id: "all-levels",
    name: { en: "Grand Composer", es: "Gran compositor" },
    description: {
      en: "Complete at least one module in every level.",
      es: "Completa al menos un módulo de cada nivel.",
    },
    icon: "🌟",
  },
];

// Star thresholds: percentage of validation rules passed
const STAR_THRESHOLDS = {
  1: 50, // 1 star at 50%
  2: 75, // 2 stars at 75%
  3: 95, // 3 stars at 95%
};

// XP formula: baseXp * (scorePercent / 100) * (1 + streakBonus)
const STREAK_BONUS = 0.1; // 10% extra per consecutive day, max 50%

module.exports = {
  RANKS,
  BADGES,
  STAR_THRESHOLDS,
  STREAK_BONUS,
};
