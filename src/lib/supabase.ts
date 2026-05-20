"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _client: SupabaseClient | null | undefined;

/**
 * Returns the shared Supabase client, or null if env vars are missing.
 * When null, callers should fall back to localStorage so the demo
 * keeps working without a backend configured.
 */
export function getSupabase(): SupabaseClient | null {
  if (_client !== undefined) return _client;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    if (typeof window !== "undefined") {
      // Only warn in browser, not during static build
      console.info(
        "[FanLinc] Supabase env vars not set — running in localStorage demo mode."
      );
    }
    _client = null;
    return _client;
  }
  _client = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });
  return _client;
}

export function isSupabaseEnabled(): boolean {
  return getSupabase() !== null;
}
