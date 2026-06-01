"use client";

import { getSupabase, isSupabaseEnabled } from "./supabase";
import type {
  AppSettings,
  LeaderboardEntry,
  Signup,
  Question,
  CategoryId,
} from "./types";
import { DEFAULT_APP_SETTINGS } from "./types";

/* ============================================================
 * Persistence layer
 *
 *   SHARED state (signups, leaderboard, question overrides) flows
 *   through Supabase so every device sees the same data.
 *
 *   PER-DEVICE UI state (currentSignup, currentCategory, lastResult,
 *   adminAuth) stays in localStorage — those are session-scoped to
 *   the device that's playing.
 *
 *   If Supabase env vars aren't set the whole layer falls back to
 *   localStorage so the demo still works.
 * ============================================================ */

const KEYS = {
  signups: "fanlinc.signups.v1",
  leaderboard: "fanlinc.leaderboard.v1",
  questionsOverride: "fanlinc.questions.override.v1",
  currentSignup: "fanlinc.currentSignup.v1",
  category: "fanlinc.currentCategory.v1",
  lastResult: "fanlinc.lastResult.v1",
  adminAuth: "fanlinc.adminAuth.v1",
  appSettings: "fanlinc.appSettings.v1",
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

/* ============ SHARED — SIGNUPS ============ */

interface SignupRow {
  id: string;
  name: string;
  email: string;
  fanlinc_id?: string | null;
  favorite: string | null;
  role: string;
  consent: boolean;
  created_at: string;
}

function rowToSignup(r: SignupRow): Signup {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    fanlincId: r.fanlinc_id ?? undefined,
    favorite: r.favorite ?? "",
    role: r.role as Signup["role"],
    consent: r.consent,
    createdAt: new Date(r.created_at).getTime(),
  };
}

export async function getSignups(): Promise<Signup[]> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from("signups")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) return (data as SignupRow[]).map(rowToSignup);
    if (error) console.warn("[signups] fetch failed, falling back", error);
  }
  return read<Signup[]>(KEYS.signups, []);
}

export async function saveSignup(s: Signup): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    // Try with fanlinc_id first; if the column doesn't exist yet on the
    // remote DB, retry without it so older schemas keep working.
    const payload = {
      id: s.id,
      name: s.name,
      email: s.email,
      fanlinc_id: s.fanlincId ?? null,
      favorite: s.favorite || null,
      role: s.role,
      consent: s.consent,
    };
    let { error } = await sb.from("signups").insert(payload);
    if (error && /fanlinc_id/i.test(error.message)) {
      const { fanlinc_id, ...legacy } = payload;
      void fanlinc_id;
      ({ error } = await sb.from("signups").insert(legacy));
    }
    if (error) {
      console.warn("[signups] insert failed, falling back", error);
    } else {
      return;
    }
  }
  const all = read<Signup[]>(KEYS.signups, []);
  all.push(s);
  write(KEYS.signups, all);
}

/* ============ SHARED — LEADERBOARD ============ */

interface LeaderboardRow {
  id: string;
  name: string;
  category: string;
  category_name: string;
  score: number;
  correct: number;
  total: number;
  badge: string;
  duration_ms: number;
  created_at: string;
}

function rowToEntry(r: LeaderboardRow): LeaderboardEntry {
  return {
    id: r.id,
    name: r.name,
    category: r.category as CategoryId,
    categoryName: r.category_name,
    score: r.score,
    correct: r.correct,
    total: r.total,
    badge: r.badge as LeaderboardEntry["badge"],
    durationMs: r.duration_ms,
    createdAt: new Date(r.created_at).getTime(),
  };
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from("leaderboard")
      .select("*")
      .order("score", { ascending: false });
    if (!error && data) return (data as LeaderboardRow[]).map(rowToEntry);
    if (error) console.warn("[leaderboard] fetch failed, falling back", error);
  }
  return read<LeaderboardEntry[]>(KEYS.leaderboard, []);
}

export async function addLeaderboardEntry(entry: LeaderboardEntry): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from("leaderboard").insert({
      id: entry.id,
      name: entry.name,
      category: entry.category,
      category_name: entry.categoryName,
      score: entry.score,
      correct: entry.correct,
      total: entry.total,
      badge: entry.badge,
      duration_ms: entry.durationMs,
    });
    if (error) {
      console.warn("[leaderboard] insert failed, falling back", error);
    } else {
      return;
    }
  }
  const all = read<LeaderboardEntry[]>(KEYS.leaderboard, []);
  all.push(entry);
  write(KEYS.leaderboard, all);
}

export async function resetLeaderboard(): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb
      .from("leaderboard")
      .delete()
      .gte("created_at", "1970-01-01");
    if (error) console.warn("[leaderboard] reset failed, falling back", error);
  }
  write(KEYS.leaderboard, []);
}

/* ============ SHARED — QUESTION OVERRIDES ============ */

export type QuestionOverride = Partial<Record<CategoryId, Question[]>>;

interface OverrideRow {
  category: string;
  payload: Question[];
}

export async function getQuestionsOverride(): Promise<QuestionOverride> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from("questions_overrides")
      .select("category, payload");
    if (!error && data) {
      const out: QuestionOverride = {};
      for (const row of data as OverrideRow[]) {
        out[row.category as CategoryId] = row.payload;
      }
      return out;
    }
    if (error) console.warn("[overrides] fetch failed, falling back", error);
  }
  return read<QuestionOverride>(KEYS.questionsOverride, {});
}

export async function setQuestionsOverride(o: QuestionOverride): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    const rows = (Object.entries(o) as [CategoryId, Question[]][])
      .filter(([, payload]) => payload && payload.length > 0)
      .map(([category, payload]) => ({ category, payload }));
    if (rows.length > 0) {
      const { error } = await sb
        .from("questions_overrides")
        .upsert(rows, { onConflict: "category" });
      if (error) console.warn("[overrides] upsert failed, falling back", error);
    }
    const cleared = (Object.keys(o) as CategoryId[]).filter(
      (k) => !o[k] || o[k]!.length === 0
    );
    if (cleared.length > 0) {
      await sb.from("questions_overrides").delete().in("category", cleared);
    }
  }
  write(KEYS.questionsOverride, o);
}

/* ============ SHARED — APP SETTINGS ============ */

/**
 * Cross-device admin flags. Persisted in a tiny key/value table
 * (`app_settings(key text primary key, value jsonb)`) when Supabase
 * is configured, with a localStorage fallback so the demo still works
 * (and so the admin's last-known choice still applies on this device
 * if the network call hiccups).
 */
export async function getAppSettings(): Promise<AppSettings> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from("app_settings")
      .select("key, value");
    if (!error && data) {
      const out: AppSettings = { ...DEFAULT_APP_SETTINGS };
      for (const row of data as { key: string; value: unknown }[]) {
        if (row.key === "requireFanlincId") {
          out.requireFanlincId = Boolean(row.value);
        }
      }
      // Mirror to local so a quick second read can short-circuit.
      write(KEYS.appSettings, out);
      return out;
    }
    if (error) console.warn("[settings] fetch failed, falling back", error);
  }
  return read<AppSettings>(KEYS.appSettings, DEFAULT_APP_SETTINGS);
}

export async function setAppSettings(patch: Partial<AppSettings>): Promise<void> {
  const current = await getAppSettings();
  const next: AppSettings = { ...current, ...patch };
  write(KEYS.appSettings, next);
  const sb = getSupabase();
  if (!sb) return;
  const rows = (Object.entries(patch) as [keyof AppSettings, unknown][]).map(
    ([key, value]) => ({ key: String(key), value })
  );
  if (rows.length === 0) return;
  const { error } = await sb
    .from("app_settings")
    .upsert(rows, { onConflict: "key" });
  if (error) console.warn("[settings] upsert failed, kept locally", error);
}

/* ============ PER-DEVICE — UI STATE (always local) ============ */

export function setCurrentSignup(s: Signup | null) {
  if (s) write(KEYS.currentSignup, s);
  else remove(KEYS.currentSignup);
}
export function getCurrentSignup(): Signup | null {
  return read<Signup | null>(KEYS.currentSignup, null);
}

export function setCurrentCategory(c: CategoryId | null) {
  if (c) write(KEYS.category, c);
  else remove(KEYS.category);
}
export function getCurrentCategory(): CategoryId | null {
  return read<CategoryId | null>(KEYS.category, null);
}

export function setLastResult(e: LeaderboardEntry | null) {
  if (e) write(KEYS.lastResult, e);
  else remove(KEYS.lastResult);
}
export function getLastResult(): LeaderboardEntry | null {
  return read<LeaderboardEntry | null>(KEYS.lastResult, null);
}

/* ============ ADMIN ============ */

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

/* ============ Realtime helper ============ */

/**
 * Subscribe to live leaderboard inserts. Returns an unsubscribe fn.
 * No-op when Supabase isn't configured.
 */
export function subscribeLeaderboard(
  onInsert: (entry: LeaderboardEntry) => void
): () => void {
  const sb = getSupabase();
  if (!sb) return () => {};
  const ch = sb
    .channel("leaderboard-feed")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "leaderboard" },
      (payload) => {
        const row = payload.new as LeaderboardRow;
        onInsert(rowToEntry(row));
      }
    )
    .subscribe();
  return () => {
    sb.removeChannel(ch);
  };
}

/* ============ Dev helper ============ */

export function clearAll(): void {
  Object.values(KEYS).forEach(remove);
}

export { isSupabaseEnabled };
