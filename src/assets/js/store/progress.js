const STORAGE_KEY = "opus-ludus-progress";
const STREAK_KEY = "opus-ludus-streak";

function now() {
  return new Date().toISOString();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultProgress() {
  return {
    modules: {},
    totalXp: 0,
    rank: "novice",
    badges: [],
    startDate: today(),
    lastActive: today(),
  };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : getDefaultProgress();
    // Merge with defaults to handle schema additions
    return { ...getDefaultProgress(), ...data };
  } catch (e) {
    return getDefaultProgress();
  }
}

export function saveProgress(progress) {
  progress.lastActive = today();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn("Failed to save progress:", e);
  }
}

export function saveModuleResult(moduleId, stars, xpEarned) {
  const progress = loadProgress();
  const existing = progress.modules[moduleId];
  const prevStars = existing ? existing.stars || 0 : 0;
  const prevXp = existing ? existing.xpEarned || 0 : 0;

  // Only update if better result
  if (stars > prevStars || (stars === prevStars && xpEarned > prevXp)) {
    progress.modules[moduleId] = {
      completed: true,
      stars: Math.max(prevStars, stars),
      xpEarned: Math.max(prevXp, xpEarned),
      completedAt: now(),
      attempts: (existing ? existing.attempts || 0 : 0) + 1,
      bestStars: Math.max(prevStars, stars),
    };

    // Recalculate total XP from all modules
    progress.totalXp = Object.values(progress.modules).reduce(
      (sum, m) => sum + (m.xpEarned || 0),
      0
    );

    // Update rank based on XP
    const RANK_THRESHOLDS = [500, 1500, 3500, 7000];
    const RANKS = ["novice", "apprentice", "composer", "maestro", "virtuoso"];
    let newRank = "novice";
    for (let i = 0; i < RANK_THRESHOLDS.length; i++) {
      if (progress.totalXp >= RANK_THRESHOLDS[i]) {
        newRank = RANKS[i + 1];
      }
    }
    const rankChanged = newRank !== progress.rank;
    progress.rank = newRank;

    saveProgress(progress);
    return { progress, rankChanged };
  }

  // Still count attempt even if not better
  if (existing) {
    existing.attempts = (existing.attempts || 0) + 1;
    progress.modules[moduleId] = existing;
    saveProgress(progress);
  }

  return { progress, rankChanged: false };
}

export function getModuleProgress(moduleId) {
  const progress = loadProgress();
  return progress.modules[moduleId] || null;
}

export function isModuleUnlocked(moduleOrder, allModules) {
  if (moduleOrder <= 1) return true;
  const progress = loadProgress();
  const previousModule = allModules.find((m) => m.order === moduleOrder - 1);
  if (!previousModule) return true;
  const prev = progress.modules[previousModule.id];
  return prev && prev.completed;
}

export function getStreak() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    const data = raw ? JSON.parse(raw) : { days: 0, lastDate: null };
    const t = today();
    if (data.lastDate === t) return data.days;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    if (data.lastDate === yesterdayStr) {
      data.days += 1;
      data.lastDate = t;
      localStorage.setItem(STREAK_KEY, JSON.stringify(data));
      return data.days;
    }
    // Reset streak
    data.days = 1;
    data.lastDate = t;
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
    return 1;
  } catch (e) {
    return 1;
  }
}

export function calculateXp(baseXp, scorePercent, streak) {
  const streakBonus = Math.min(0.5, (streak - 1) * 0.1);
  return Math.round(baseXp * (scorePercent / 100) * (1 + streakBonus));
}

export function getStarCount(scorePercent) {
  if (scorePercent >= 95) return 3;
  if (scorePercent >= 75) return 2;
  if (scorePercent >= 50) return 1;
  return 0;
}
