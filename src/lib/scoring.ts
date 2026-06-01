import type { Badge } from "./types";

export const QUESTION_SECONDS = 45;
export const BASE_POINTS = 100;
export const MAX_SPEED_BONUS = 100;
export const STREAK_STEP = 25;
export const MAX_STREAK_BONUS = 100;

export interface AnswerResult {
  correct: boolean;
  basePoints: number;
  speedBonus: number;
  streakBonus: number;
  total: number;
  newStreak: number;
}

export function scoreAnswer(
  correct: boolean,
  timeLeftMs: number,
  currentStreak: number
): AnswerResult {
  if (!correct) {
    return {
      correct: false,
      basePoints: 0,
      speedBonus: 0,
      streakBonus: 0,
      total: 0,
      newStreak: 0,
    };
  }
  const fraction = Math.max(0, Math.min(1, timeLeftMs / (QUESTION_SECONDS * 1000)));
  const speedBonus = Math.round(fraction * MAX_SPEED_BONUS);
  const newStreak = currentStreak + 1;
  const streakBonus = Math.min(MAX_STREAK_BONUS, (newStreak - 1) * STREAK_STEP);
  return {
    correct: true,
    basePoints: BASE_POINTS,
    speedBonus,
    streakBonus,
    total: BASE_POINTS + speedBonus + streakBonus,
    newStreak,
  };
}

export interface BadgeAssignment {
  badge: Badge;
  blurb: string;
}

export function assignBadge(correct: number, total: number, score: number): BadgeAssignment {
  const pct = total > 0 ? correct / total : 0;
  if (pct === 1 && score >= 1100) {
    return {
      badge: "FanLinc MVP",
      blurb: "Perfect score with bonus. You're the franchise player.",
    };
  }
  if (pct >= 0.8) {
    return {
      badge: "GameDay Expert",
      blurb: "Encyclopedic fan brain. You belong on the broadcast desk.",
    };
  }
  if (pct >= 0.6) {
    return {
      badge: "Superfan",
      blurb: "True fan energy. The community needs you.",
    };
  }
  if (pct >= 0.4) {
    return {
      badge: "Future GM",
      blurb: "You see the game. Keep building your knowledge.",
    };
  }
  return {
    badge: "Rookie Fan",
    blurb: "Every fan starts here. Welcome to the squad.",
  };
}
