"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/Shell";
import {
  checkAdminCode,
  getAdminAuth,
  getAppSettings,
  getLeaderboard,
  getQuestionsOverride,
  getSignups,
  resetLeaderboard,
  setAdminAuth,
  setAppSettings,
  setQuestionsOverride,
} from "@/lib/store";
import { fireConfetti } from "@/components/Confetti";
import { getAllQuestions, getDefaultQuestions, getCategories } from "@/lib/questions";
import type {
  AppSettings,
  CategoryId,
  LeaderboardEntry,
  Question,
  Signup,
} from "@/lib/types";
import { DEFAULT_APP_SETTINGS } from "@/lib/types";

type Tab = "signups" | "questions" | "leaderboard" | "winner" | "settings";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [code, setCode] = useState("");
  const [tab, setTab] = useState<Tab>("signups");

  useEffect(() => {
    setAuthed(getAdminAuth());
  }, []);

  if (authed === null) {
    return (
      <PageShell>
        <div className="pt-10 text-center text-[var(--muted)]">Loading…</div>
      </PageShell>
    );
  }

  if (!authed) {
    return (
      <PageShell>
        <div className="pt-2 max-w-md">
          <h1 className="text-2xl font-black tracking-tight">Admin access</h1>
          <p className="text-sm text-[var(--muted)] mt-1.5">
            Enter the event code to manage signups, questions, and the leaderboard.
          </p>
          <form
            className="mt-5 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (checkAdminCode(code)) {
                setAdminAuth(true);
                setAuthed(true);
              } else {
                alert("Invalid code");
              }
            }}
          >
            <input
              type="password"
              className="input"
              placeholder="Event code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn-primary w-full h-12 rounded-2xl">
              Enter
            </button>
          </form>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="pt-2 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-black tracking-tight">Admin</h1>
        <button
          type="button"
          onClick={() => {
            setAdminAuth(false);
            setAuthed(false);
          }}
          className="h-9 px-3 text-xs text-[var(--muted)] hover:text-white cursor-pointer"
        >
          Sign out
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {(["signups", "questions", "leaderboard", "winner", "settings"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`h-10 px-4 rounded-full border font-medium capitalize text-xs cursor-pointer ${
              tab === t
                ? "bg-[var(--primary)] text-black border-[var(--primary)]"
                : "border-[var(--border-strong)] text-white hover:bg-white/5"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "signups" && <SignupsTab />}
        {tab === "questions" && <QuestionsTab />}
        {tab === "leaderboard" && <LeaderboardTab />}
        {tab === "winner" && <WinnerTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </PageShell>
  );
}

/* ============ Signups Tab ============ */
function SignupsTab() {
  const [list, setList] = useState<Signup[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getSignups();
      if (!cancelled) setList(data);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function exportCsv() {
    const rows = [
      ["name", "email", "fanlincId", "favorite", "role", "consent", "createdAt"],
      ...list.map((s) => [
        s.name,
        s.email,
        s.fanlincId ?? "",
        s.favorite,
        s.role,
        String(s.consent),
        new Date(s.createdAt).toISOString(),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fanlinc-signups-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm">
          <span className="font-bold">{list.length}</span>{" "}
          <span className="text-[var(--muted)]">signups</span>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={list.length === 0}
          className="btn-ghost h-10 px-4 rounded-full text-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Export CSV
        </button>
      </div>
      <div className="card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] border-b border-[var(--border)]">
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">FanLinc ID</th>
                <th className="text-left px-3 py-2">Email</th>
                <th className="text-left px-3 py-2">Favourite</th>
                <th className="text-left px-3 py-2">Role</th>
                <th className="text-left px-3 py-2">Consent</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-3 py-2 font-semibold">{s.name}</td>
                  <td className="px-3 py-2 text-[var(--primary)] font-mono text-xs">
                    {s.fanlincId || "—"}
                  </td>
                  <td className="px-3 py-2 text-[var(--muted)]">{s.email}</td>
                  <td className="px-3 py-2 text-[var(--muted)]">{s.favorite || "—"}</td>
                  <td className="px-3 py-2">
                    <span className="text-[10px] uppercase tracking-[0.15em] bg-white/5 border border-[var(--border-strong)] rounded-full px-2 py-0.5">
                      {s.role}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-[var(--muted)]">{s.consent ? "Yes" : "No"}</td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-[var(--muted)]">
                    No signups yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============ Questions Tab ============ */
function QuestionsTab() {
  const categories = getCategories();
  const [active, setActive] = useState<CategoryId>(categories[0].id);
  const [list, setList] = useState<Question[]>([]);
  const [editing, setEditing] = useState<Question | null>(null);
  // Counts per category for the tab pills (overrides + defaults)
  const [counts, setCounts] = useState<Record<string, number>>({});

  async function refresh() {
    const next = await getAllQuestions(active);
    setList(next);
    // Refresh tab counts too
    const c: Record<string, number> = {};
    for (const cat of categories) {
      c[cat.id] = (await getAllQuestions(cat.id)).length;
    }
    setCounts(c);
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  async function saveList(next: Question[]) {
    const overrides = await getQuestionsOverride();
    overrides[active] = next;
    await setQuestionsOverride(overrides);
    setList(next);
    setCounts((prev) => ({ ...prev, [active]: next.length }));
  }

  function startAdd() {
    setEditing({
      id: `q-${Date.now()}`,
      type: "trivia",
      prompt: "",
      options: ["", "", "", ""],
      answer: 0,
      explain: "",
    });
  }

  async function commit(q: Question) {
    const exists = list.some((x) => x.id === q.id);
    const next = exists ? list.map((x) => (x.id === q.id ? q : x)) : [...list, q];
    await saveList(next);
    setEditing(null);
  }

  async function remove(id: string) {
    if (!confirm("Delete this question?")) return;
    await saveList(list.filter((x) => x.id !== id));
  }

  async function resetCategory() {
    if (!confirm("Reset this category's questions to the JSON defaults?")) return;
    const overrides = await getQuestionsOverride();
    delete overrides[active];
    await setQuestionsOverride(overrides);
    refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`h-10 px-4 rounded-full border text-xs font-medium cursor-pointer flex items-center gap-2 ${
              active === c.id
                ? "bg-[var(--primary)] text-black border-[var(--primary)]"
                : "border-[var(--border-strong)] hover:bg-white/5"
            }`}
          >
            <span className="mr-1">{c.emoji}</span>
            {c.name}
            <span className="ml-1 text-[10px] opacity-70">
              {counts[c.id] ?? getDefaultQuestions(c.id).length}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <button
          onClick={startAdd}
          className="btn-primary h-10 px-4 rounded-full text-xs"
        >
          + Add question
        </button>
        <button
          onClick={resetCategory}
          className="text-[11px] text-[var(--muted)] hover:text-[var(--danger)] h-10 px-2 cursor-pointer"
        >
          Reset category to defaults
        </button>
      </div>

      <div className="space-y-2">
        {list.map((q, i) => (
          <div key={q.id} className="card rounded-2xl p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">
                  Q{i + 1} · {q.type}
                </div>
                <div className="font-semibold mt-0.5">{q.prompt}</div>
                <ul className="mt-2 text-xs space-y-1">
                  {q.options.map((o, idx) => (
                    <li
                      key={idx}
                      className={`flex items-center gap-2 ${
                        idx === q.answer ? "text-[var(--primary)]" : "text-[var(--muted)]"
                      }`}
                    >
                      <span className="font-mono">
                        {["A", "B", "C", "D"][idx] ?? idx}
                      </span>
                      <span>{o}</span>
                      {idx === q.answer && <span>· correct</span>}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => setEditing(q)}
                  className="text-xs font-medium h-9 px-3.5 rounded-lg border border-[var(--border-strong)] hover:bg-white/5 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(q.id)}
                  className="text-xs font-medium h-9 px-3.5 rounded-lg border border-[rgba(255,85,119,0.4)] text-[var(--danger)] hover:bg-[rgba(255,85,119,0.08)] cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="text-center card rounded-2xl p-8 text-[var(--muted)]">
            No questions in this category. Add one to get started.
          </div>
        )}
      </div>

      {editing && (
        <QuestionEditor
          q={editing}
          onCancel={() => setEditing(null)}
          onSave={commit}
        />
      )}
    </div>
  );
}

function QuestionEditor({
  q,
  onSave,
  onCancel,
}: {
  q: Question;
  onSave: (q: Question) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Question>({
    ...q,
    options: q.options.length < 4 ? [...q.options, ...Array(4 - q.options.length).fill("")] : q.options,
  });

  function update<K extends keyof Question>(k: K, v: Question[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
  }
  function updateOption(i: number, v: string) {
    setDraft((d) => {
      const next = [...d.options];
      next[i] = v;
      return { ...d, options: next };
    });
  }

  function submit() {
    if (!draft.prompt.trim()) return alert("Question prompt is required.");
    if (draft.options.some((o) => !o.trim()))
      return alert("All 4 options are required.");
    onSave(draft);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-6">
      <div className="card rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 scale-in">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Edit question</h3>
          <button onClick={onCancel} className="text-[var(--muted)] hover:text-white">
            ✕
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <label className="block">
            <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] mb-1">
              Type
            </div>
            <input
              className="input"
              value={draft.type}
              onChange={(e) => update("type", e.target.value)}
              placeholder="trivia / player / team / rules / term / fan"
            />
          </label>
          <label className="block">
            <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] mb-1">
              Prompt
            </div>
            <textarea
              className="input min-h-[80px]"
              value={draft.prompt}
              onChange={(e) => update("prompt", e.target.value)}
            />
          </label>
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] mb-1">
              Options (mark the correct one)
            </div>
            <div className="space-y-2">
              {draft.options.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => update("answer", i)}
                    className={`w-8 h-8 rounded-lg grid place-items-center font-mono text-xs font-bold flex-shrink-0 ${
                      draft.answer === i
                        ? "bg-[var(--primary)] text-black"
                        : "bg-white/5 border border-[var(--border-strong)]"
                    }`}
                  >
                    {["A", "B", "C", "D"][i]}
                  </button>
                  <input
                    className="input"
                    value={o}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Option ${["A", "B", "C", "D"][i]}`}
                  />
                </div>
              ))}
            </div>
          </div>
          <label className="block">
            <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] mb-1">
              Explanation (optional)
            </div>
            <textarea
              className="input min-h-[60px]"
              value={draft.explain ?? ""}
              onChange={(e) => update("explain", e.target.value)}
            />
          </label>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onCancel} className="btn-ghost h-11 flex-1 rounded-xl">
            Cancel
          </button>
          <button onClick={submit} className="btn-primary h-11 flex-1 rounded-xl">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ Leaderboard Tab ============ */
function LeaderboardTab() {
  const [list, setList] = useState<LeaderboardEntry[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getLeaderboard();
      if (!cancelled) setList(data);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function reset() {
    if (!confirm("Reset the entire leaderboard? This cannot be undone.")) return;
    await resetLeaderboard();
    setList([]);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm">
          <span className="font-bold">{list.length}</span>{" "}
          <span className="text-[var(--muted)]">plays on the board</span>
        </div>
        <button
          onClick={reset}
          disabled={list.length === 0}
          className="text-xs font-medium h-10 px-4 rounded-full border border-[rgba(255,85,119,0.4)] text-[var(--danger)] hover:bg-[rgba(255,85,119,0.08)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Reset leaderboard
        </button>
      </div>
      <div className="card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)] border-b border-[var(--border)]">
                <th className="text-left px-3 py-2">#</th>
                <th className="text-left px-3 py-2">Player</th>
                <th className="text-left px-3 py-2">Category</th>
                <th className="text-right px-3 py-2">Score</th>
                <th className="text-left px-3 py-2">Badge</th>
              </tr>
            </thead>
            <tbody>
              {[...list]
                .sort((a, b) => b.score - a.score)
                .map((e, i) => (
                  <tr key={e.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-3 py-2 digit text-[var(--muted)]">{i + 1}</td>
                    <td className="px-3 py-2 font-semibold">{e.name}</td>
                    <td className="px-3 py-2 text-[var(--muted)]">{e.categoryName}</td>
                    <td className="px-3 py-2 digit text-right text-[var(--primary)] font-bold">
                      {e.score}
                    </td>
                    <td className="px-3 py-2 text-[var(--muted)]">{e.badge}</td>
                  </tr>
                ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-[var(--muted)]">
                    No plays yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============ Winner Tab ============ */
/**
 * Spin-the-wheel rules:
 *  - Pool = every leaderboard entry whose score equals the top score.
 *    If 12 players are tied for first, all 12 are eligible.
 *  - Each entry is joined back to the signup roster so we can show the
 *    winner's FanLinc ID + email for prize hand-off.
 *  - Only signups with consent are eligible (matches the prior rule).
 */
interface WinnerCandidate {
  entryId: string;
  signupId?: string;
  name: string;
  email?: string;
  fanlincId?: string;
  categoryName: string;
  score: number;
  badge: string;
}

function WinnerTab() {
  const [pool, setPool] = useState<WinnerCandidate[]>([]);
  const [topScore, setTopScore] = useState<number | null>(null);
  const [totalPlays, setTotalPlays] = useState(0);
  const [winner, setWinner] = useState<WinnerCandidate | null>(null);
  const [rolling, setRolling] = useState(false);
  const [scrollName, setScrollName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const [board, signups] = await Promise.all([
      getLeaderboard(),
      getSignups(),
    ]);
    setTotalPlays(board.length);
    if (board.length === 0) {
      setPool([]);
      setTopScore(null);
      setLoading(false);
      return;
    }
    const sorted = [...board].sort((a, b) => b.score - a.score);
    const best = sorted[0].score;
    setTopScore(best);
    // Match leaderboard entry -> signup by name (case-insensitive). The
    // leaderboard schema only stores the display name, so this is the
    // best join we have without a FK.
    const byKey = new Map<string, Signup>();
    for (const s of signups) {
      byKey.set(s.name.trim().toLowerCase(), s);
    }
    const tied: WinnerCandidate[] = sorted
      .filter((e) => e.score === best)
      .map((e) => {
        const match = byKey.get(e.name.trim().toLowerCase());
        return {
          entryId: e.id,
          signupId: match?.id,
          name: e.name,
          email: match?.email,
          fanlincId: match?.fanlincId,
          categoryName: e.categoryName,
          score: e.score,
          badge: e.badge,
        };
      })
      // Honour the consent flag when we have a signup match. Entries
      // with no signup record stay in (couldn't have signed up without
      // consent in current flow anyway).
      .filter((c) => !c.signupId || byKey.get(c.name.trim().toLowerCase())?.consent !== false);
    setPool(tied);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await refresh();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function spin() {
    if (pool.length === 0) return;
    setRolling(true);
    setWinner(null);
    const start = Date.now();
    const duration = 1800;
    const tick = () => {
      const t = Date.now() - start;
      if (t >= duration) {
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        setWinner(chosen);
        setRolling(false);
        fireConfetti();
        return;
      }
      const next = pool[Math.floor(Math.random() * pool.length)];
      setScrollName(next.name);
      const delay = 40 + (t / duration) * 220;
      setTimeout(tick, delay);
    };
    tick();
  }

  return (
    <div>
      <p className="text-sm text-[var(--muted)]">
        The wheel only spins across the <span className="text-[var(--primary)] font-semibold">top scorers</span> on
        the leaderboard. If multiple players are tied at #1, every one of them is eligible.
      </p>

      <div className="mt-4 grid grid-cols-3 border-y border-[var(--border)] text-center">
        <Stat label="Total plays" value={String(totalPlays)} />
        <Stat
          label="Top score"
          value={topScore !== null ? String(topScore) : "—"}
          divider
          accent
        />
        <Stat
          label="Tied at top"
          value={String(pool.length)}
          divider
        />
      </div>

      {pool.length > 0 && (
        <div className="mt-4">
          <div className="eyebrow">Eligible entrants</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {pool.map((c) => (
              <span
                key={c.entryId}
                className="text-[11px] px-2.5 py-1 rounded-full border border-[var(--border-strong)] bg-white/[0.03]"
              >
                <span className="font-semibold">{c.name}</span>
                {c.fanlincId && (
                  <span className="text-[var(--primary)] font-mono ml-1.5">
                    {c.fanlincId}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="card rounded-3xl p-6 text-center mt-5">
        <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
          {loading
            ? "Loading leaderboard…"
            : pool.length === 0
            ? totalPlays === 0
              ? "Leaderboard is empty — nobody to draw from yet"
              : "No eligible top scorers"
            : `${pool.length} ${pool.length === 1 ? "player tied" : "players tied"} at the top`}
        </div>
        <div className="mt-3 min-h-[100px] flex items-center justify-center">
          {rolling ? (
            <div className="text-3xl font-black animate-pulse">{scrollName || "…"}</div>
          ) : winner ? (
            <div>
              <div className="text-4xl">🏆</div>
              <div className="text-3xl font-black text-gradient mt-1">{winner.name}</div>
              {winner.fanlincId && (
                <div className="text-sm font-mono text-[var(--primary)] mt-1">
                  {winner.fanlincId}
                </div>
              )}
              {winner.email && (
                <div className="text-xs text-[var(--muted)] mt-1">{winner.email}</div>
              )}
              <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] mt-2">
                {winner.categoryName} · {winner.score} pts · {winner.badge}
              </div>
            </div>
          ) : (
            <div className="text-[var(--muted)]">
              {pool.length === 0
                ? "No top scorers to draw from yet"
                : "Press Spin to draw a winner"}
            </div>
          )}
        </div>
        <div className="flex gap-2 justify-center mt-4">
          <button
            onClick={spin}
            disabled={rolling || pool.length === 0}
            className="btn-primary h-12 px-6 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {rolling ? "Spinning…" : winner ? "Pick another" : "Spin the wheel"}
          </button>
          <button
            onClick={refresh}
            disabled={rolling}
            className="btn-ghost h-12 px-5 rounded-2xl text-xs"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  divider,
  accent,
}: {
  label: string;
  value: string;
  divider?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={`px-3 py-3 ${
        divider ? "border-l border-[var(--border)]" : ""
      }`}
    >
      <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
        {label}
      </div>
      <div
        className={`digit mt-1.5 text-xl font-medium tracking-tight ${
          accent ? "text-[var(--primary)]" : "text-[var(--foreground)]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

/* ============ Settings Tab ============ */
function SettingsTab() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await getAppSettings();
      if (cancelled) return;
      setSettings(s);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleSetting(key: keyof AppSettings) {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    setSaving(true);
    try {
      await setAppSettings({ [key]: next[key] });
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) {
    return <div className="text-sm text-[var(--muted)]">Loading settings…</div>;
  }

  return (
    <div className="space-y-3">
      <SettingToggle
        title="Require FanLinc User ID"
        on={settings.requireFanlincId}
        saving={saving}
        onToggle={() => toggleSetting("requireFanlincId")}
      >
        When ON, players must enter a FanLinc handle (e.g.{" "}
        <span className="font-mono text-[var(--primary)]">@Rad7438</span>) to
        sign up. When OFF, the field is shown but optional.
      </SettingToggle>

      <SettingToggle
        title="Require email"
        on={settings.requireEmail}
        saving={saving}
        onToggle={() => toggleSetting("requireEmail")}
      >
        When ON, players must enter an email to join the game. When OFF, the
        email field is still shown but optional — useful if you only want a
        FanLinc handle.
      </SettingToggle>

      <div className="text-[11px] text-[var(--muted-2)] px-1 leading-relaxed">
        Changes apply on the next signup form load. Settings sync across
        devices via Supabase when configured; otherwise they&apos;re stored
        locally on this device.
      </div>
    </div>
  );
}

function SettingToggle({
  title,
  on,
  saving,
  onToggle,
  children,
}: {
  title: string;
  on: boolean;
  saving: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="card rounded-2xl p-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="text-[15px] font-semibold">{title}</div>
        <div className="text-[12px] text-[var(--muted)] mt-1 leading-relaxed max-w-md">
          {children}
        </div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        disabled={saving}
        aria-pressed={on}
        aria-label={title}
        className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors cursor-pointer ${
          on ? "bg-[var(--primary)]" : "bg-white/15"
        } disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-black transition-transform ${
            on ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
