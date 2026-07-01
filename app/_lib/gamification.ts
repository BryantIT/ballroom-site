export const XP_LEVELS = [
  { name: "Beginner",     min: 0,    max: 499  },
  { name: "Developing",   min: 500,  max: 1499 },
  { name: "Intermediate", min: 1500, max: 3499 },
  { name: "Advanced",     min: 3500, max: 7499 },
  { name: "Champion",     min: 7500, max: Infinity },
] as const;

export type DancerLevel = (typeof XP_LEVELS)[number];

export function getDancerLevel(totalXp: number): DancerLevel {
  return (
    [...XP_LEVELS].reverse().find((l) => totalXp >= l.min) ?? XP_LEVELS[0]
  );
}

export function getXpProgress(totalXp: number): {
  level: DancerLevel;
  nextLevel: DancerLevel | null;
  pct: number;
  xpInLevel: number;
  xpToNext: number | null;
} {
  const level = getDancerLevel(totalXp);
  const idx = XP_LEVELS.findIndex((l) => l.name === level.name);
  const nextLevel = idx < XP_LEVELS.length - 1 ? XP_LEVELS[idx + 1] : null;

  if (!nextLevel || level.max === Infinity) {
    return { level, nextLevel: null, pct: 100, xpInLevel: totalXp - level.min, xpToNext: null };
  }

  const range = level.max - level.min + 1;
  const xpInLevel = totalXp - level.min;
  const pct = Math.min((xpInLevel / range) * 100, 100);
  const xpToNext = level.max - totalXp + 1;

  return { level, nextLevel, pct, xpInLevel, xpToNext };
}
