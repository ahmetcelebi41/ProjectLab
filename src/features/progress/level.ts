export const XP_PER_LEVEL = 10;

export type LevelProgress = Readonly<{
  level: number;
  currentLevelXp: number;
  xpToNextLevel: number;
  progressPercentage: number;
}>;

export function getLevelProgress(totalXp: number): LevelProgress {
  const normalizedXp = Number.isFinite(totalXp) ? Math.max(0, totalXp) : 0;
  const currentLevelXp = normalizedXp % XP_PER_LEVEL;

  return {
    level: Math.floor(normalizedXp / XP_PER_LEVEL) + 1,
    currentLevelXp,
    xpToNextLevel: XP_PER_LEVEL - currentLevelXp,
    progressPercentage: (currentLevelXp / XP_PER_LEVEL) * 100,
  };
}
