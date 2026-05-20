"use client";

import type { LeaderboardEntry, Signup, Question, CategoryId } from "./types";

const KEYS = {
  signups: "fanlinc.signups.v1",
  leaderboard: "fanlinc.leaderboard.v1",
  questionsOverride: "fanlinc.questions.override.v1",
  currentSignup: "fanlinc.currentSignup.v1",
  category: "fanlinc.currentCategory.v1",
  lastResult: "fanlinc.lastResult.v1",
  adminAuth: "fanlinc.adminAuth.v1",
} as const;

const isBrowser = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or private mode */
  }
}

function remove(key: string): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(key);
}

/* Signups */
export function getSignups(): Signup[] {
  return read<Signup[]>(KEYS.signups, []);
}
export function saveSignup(s: Signup): void {
  const all = getSignups();
  all.push(s);
  write(KEYS.signups, all);
}
export function setCurrentSignup(s: Signup | null) {
  if (s) write(KEYS.currentSignup, s);
  else remove(KEYS.currentSignup);
}
export function getCurrentSignup(): Signup | null {
  return read<Signup | null>(KEYS.currentSignup, null);
}

/* Category */
export function setCurrentCategory(c: CategoryId | null) {
  if (c) write(KEYS.category, c);
  else remove(KEYS.category);
}
export function getCurrentCategory(): CategoryId | null {
  return read<CategoryId | null>(KEYS.category, null);
}

/* Leaderboard */
export function getLeaderboard(): LeaderboardEntry[] {
  return read<LeaderboardEntry[]>(KEYS.leaderboard, []);
}
export function addLeaderboardEntry(entry: LeaderboardEntry): void {
  const all = getLeaderboard();
  all.push(entry);
  write(KEYS.leaderboard, all);
}
export function resetLeaderboard(): void {
  write(KEYS.leaderboard, []);
}

/* Last result */
export function setLastResult(e: LeaderboardEntry | null) {
  if (e) write(KEYS.lastResult, e);
  else remove(KEYS.lastResult);
}
export function getLastResult(): LeaderboardEntry | null {
  return read<LeaderboardEntry | null>(KEYS.lastResult, null);
}

/* Questions override (admin edits stored here) */
export type QuestionOverride = Partial<Record<CategoryId, Question[]>>;
export function getQuestionsOverride(): QuestionOverride {
  return read<QuestionOverride>(KEYS.questionsOverride, {});
}
export function setQuestionsOverride(o: QuestionOverride): void {
  write(KEYS.questionsOverride, o);
}

/* Admin auth (very simple demo) */
const ADMIN_CODE = "fanlinc2026";
export function checkAdminCode(input: string): boolean {
  return input.trim().toLowerCase() === ADMIN_CODE;
}
export function setAdminAuth(v: boolean): void {
  if (v) write(KEYS.adminAuth, true);
  else remove(KEYS.adminAuth);
}
export function getAdminAuth(): boolean {
  return read<boolean>(KEYS.adminAuth, false);
}

/* Clear all */
export function clearAll(): void {
  Object.values(KEYS).forEach(remove);
}
