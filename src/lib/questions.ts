import bank from "@/data/questions.json";
import type { CategoryId, Question, QuestionBank } from "./types";
import { getQuestionsOverride } from "./store";

const typedBank = bank as unknown as QuestionBank;

export function getCategories() {
  return typedBank.categories;
}

export function getCategoryName(id: CategoryId): string {
  return typedBank.categories.find((c) => c.id === id)?.name ?? id;
}

/**
 * Sync default-only access. Used in admin UI before overrides are loaded
 * and as a fallback. Does NOT hit Supabase.
 */
export function getDefaultQuestions(categoryId: CategoryId): Question[] {
  return typedBank.questions[categoryId] ?? [];
}

/**
 * Returns the active question set for a category — checks Supabase
 * (or localStorage in demo mode) for an admin override first, then
 * falls back to the bundled JSON bank.
 */
export async function getAllQuestions(
  categoryId: CategoryId
): Promise<Question[]> {
  if (typeof window !== "undefined") {
    const overrides = await getQuestionsOverride();
    if (overrides[categoryId] && overrides[categoryId]!.length > 0) {
      return overrides[categoryId]!;
    }
  }
  return getDefaultQuestions(categoryId);
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface RoundQuestion extends Question {
  shuffledOptions: string[];
  shuffledAnswer: number;
}

export async function pickRound(
  categoryId: CategoryId,
  count = 5
): Promise<RoundQuestion[]> {
  const pool = await getAllQuestions(categoryId);
  const picked = shuffle(pool).slice(0, Math.min(count, pool.length));
  return picked.map((q) => {
    const indexed = q.options.map((opt, idx) => ({ opt, idx }));
    const shuffled = shuffle(indexed);
    const newOptions = shuffled.map((s) => s.opt);
    const newAnswer = shuffled.findIndex((s) => s.idx === q.answer);
    return {
      ...q,
      shuffledOptions: newOptions,
      shuffledAnswer: newAnswer,
    };
  });
}
