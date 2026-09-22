import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDifficultyColor(difficulty: string): { bg: string; text: string; border: string; xp: number } {
  switch (difficulty) {
    case 'EASY':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', xp: 50 };
    case 'MEDIUM':
      return { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30', xp: 100 };
    case 'HARD':
      return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', xp: 150 };
    case 'EPIC':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', xp: 300 };
    default:
      return { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30', xp: 50 };
  }
}

// XP needed for current level and next level
export function getLevelProgress(totalXP: number, currentLevel: number) {
  // Formula: level = floor(sqrt(total_xp / 50)) + 1
  // XP for level L = (L - 1)^2 * 50
  const xpCurrentLevelBase = Math.pow(currentLevel - 1, 2) * 50;
  const xpNextLevelBase = Math.pow(currentLevel, 2) * 50;
  const neededForNext = xpNextLevelBase - xpCurrentLevelBase;
  const progressInLevel = Math.max(0, totalXP - xpCurrentLevelBase);
  const percentage = Math.min(100, Math.round((progressInLevel / (neededForNext || 1)) * 100));

  return {
    currentLevelBase: xpCurrentLevelBase,
    nextLevelBase: xpNextLevelBase,
    progressInLevel,
    neededForNext,
    percentage,
  };
}

