"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { PageShell } from "@/components/Shell";
import { StepBar } from "@/components/StepBar";
import {
  addLeaderboardEntry,
  getCurrentCategory,
  getCurrentSignup,
  setLastResult,
} from "@/lib/store";
import { getCategoryName, pickRound, RoundQuestion } from "@/lib/questions";
import { QUESTION_SECONDS, assignBadge, scoreAnswer } from "@/lib/scoring";
import type { LeaderboardEntry } from "@/lib/types";

type AnswerState = "idle" | "answered";

export default function PlayPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [questions, setQuestions] = useState<RoundQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [state, setState] = useState<AnswerState>("idle");
  const [lastDelta, setLastDelta] = useState<{
    total: number;
    speed: number;
    streak: number;
    correct: boolean;
  } | null>(null);
  const [floater, setFloater] = useState<string | null>(null);
  const roundStartRef = useRef<number>(Date.now());
  const advanceRef = useRef<number | null>(null);

  const total = questions.length;
  const q = questions[idx];

  useEffect(() => {
    const signup = getCurrentSignup();
    const cat = getCurrentCategory();
    if (!signup) {
      router.replace("/signup");
      return;
    }
    if (!cat) {
      router.replace("/category");
      return;
    }
    let cancelled = false;
    (async () => {
      const round = await pickRound(cat, 5);
      if (cancelled) return;
      if (round.length === 0) {
        router.replace("/category");
        return;
      }
      setQuestions(round);
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (!q) return;
    setChosen(null);
    setState("idle");
    setLastDelta(null);
    setFloater(null);

    return () => {
      if (advanceRef.current) window.clearTimeout(advanceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, hydrated]);

  function handleChoose(i: number) {
    if (state !== "idle" || !q) return;
    const isCorrect = i === q.shuffledAnswer;
    const result = scoreAnswer(isCorrect, QUESTION_SECONDS * 1000, streak);
    setChosen(i);
    setState("answered");
    setScore((s) => s + result.total);
    setStreak(result.newStreak);
    if (isCorrect) {
      setCorrect((c) => c + 1);
      setFloater(`+${result.total}`);
    }
    setLastDelta({
      total: result.total,
      speed: result.speedBonus,
      streak: result.streakBonus,
      correct: isCorrect,
    });
    advanceRef.current = window.setTimeout(next, 1700);
  }

  function next() {
    if (idx + 1 >= total) {
      finish();
      return;
    }
    setIdx((i) => i + 1);
  }

  async function finish() {
    const signup = getCurrentSignup();
    const cat = getCurrentCategory();
    if (!signup || !cat) {
      router.replace("/");
      return;
    }
    const badge = assignBadge(correct, total, score);
    const durationMs = Date.now() - roundStartRef.current;
    const entry: LeaderboardEntry = {
      id: crypto.randomUUID(),
      name: signup.name,
      category: cat,
      categoryName: getCategoryName(cat),
      score,
      correct,
      total,
      badge: badge.badge,
      durationMs,
      createdAt: Date.now(),
    };
    setLastResult(entry);
    // Fire-and-forget the Supabase write — UX shouldn't wait on network
    addLeaderboardEntry(entry).catch((err) =>
      console.warn("[play] couldn't persist score, kept locally", err)
    );
    router.replace("/results");
  }

  if (!hydrated || !q) {
    return (
      <PageShell hideNav>
        <div className="pt-10 text-center text-[var(--muted)]">Loading round…</div>
      </PageShell>
    );
  }

  return (
    <PageShell hideNav>
      <div className="pt-4">
        <StepBar step={3} />
      </div>

      {/* Top meta bar */}
      <div className="mt-8 grid grid-cols-3 border-y border-[var(--border)]">
        <Meta label="Question" value={`${String(idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`} />
        <Meta
          label="Score"
          value={score.toString().padStart(3, "0")}
          divider
          accent
        />
        <Meta
          label="Streak"
          value={`× ${streak}`}
          flame={streak >= 2}
          divider
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: [0.2, 0.7, 0.3, 1] }}
          className="mt-10"
        >
          <div className="eyebrow">
            <span className="digit text-[var(--primary)] mr-2">
              {String(idx + 1).padStart(2, "0")}
            </span>
            {q.type}
          </div>
          {q.image && (
            <div className="relative w-full aspect-[4/5] sm:aspect-[4/3] mt-4 overflow-hidden border border-[var(--border)] rounded-lg">
              <Image
                src={q.image}
                alt="Identify the player"
                fill
                priority
                sizes="(max-width: 640px) 100vw, 480px"
                className="object-cover"
              />
            </div>
          )}
          <h2 className="display-tight text-[24px] sm:text-[32px] leading-[1.1] mt-4 max-w-[22ch]">
            {q.prompt}
          </h2>

          <motion.div
            className="mt-8 space-y-2.5"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
            }}
          >
            {q.shuffledOptions.map((opt, i) => {
              const isChosen = chosen === i;
              const isCorrect = state !== "idle" && i === q.shuffledAnswer;
              const isWrongChoice = state === "answered" && isChosen && !isCorrect;
              const dataState =
                state === "idle"
                  ? undefined
                  : isCorrect
                  ? "correct"
                  : isWrongChoice
                  ? "wrong"
                  : undefined;
              const letter = ["A", "B", "C", "D"][i] ?? "?";
              return (
                <motion.button
                  key={i}
                  variants={{
                    hidden: { opacity: 0, x: -12 },
                    show: { opacity: 1, x: 0, transition: { duration: 0.35 } },
                  }}
                  type="button"
                  onClick={() => handleChoose(i)}
                  disabled={state !== "idle"}
                  className="answer"
                  data-state={dataState}
                  whileTap={state === "idle" ? { scale: 0.98 } : undefined}
                >
                  <span className="badge">{letter}</span>
                  <span className="flex-1">{opt}</span>
                  {dataState === "correct" && (
                    <CheckIcon className="text-[var(--primary)]" />
                  )}
                  {dataState === "wrong" && <XIcon className="text-[var(--danger)]" />}
                </motion.button>
              );
            })}
          </motion.div>

          <AnimatePresence>
            {lastDelta && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-6 flex items-center justify-between"
              >
                <div className="text-[14px] font-semibold">
                  {lastDelta.correct ? (
                    <span className="text-[var(--primary)]">
                      Correct · +{lastDelta.total}
                    </span>
                  ) : (
                    <span className="text-[var(--danger)]">Incorrect</span>
                  )}
                </div>
                <div className="text-[11px] text-[var(--muted)] flex gap-4 font-mono uppercase tracking-wider">
                  {lastDelta.correct && (
                    <>
                      <span>+{lastDelta.speed} speed</span>
                      {lastDelta.streak > 0 && <span>+{lastDelta.streak} streak</span>}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {state !== "idle" && q.explain && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-[13px] text-[var(--muted)] leading-relaxed border-l-2 border-[var(--primary)] pl-4 py-1"
            >
              {q.explain}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {floater && (
          <motion.div
            key="floater"
            initial={{ opacity: 0, y: 0, scale: 0.85 }}
            animate={{ opacity: 1, y: -60, scale: 1 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.9, ease: [0.2, 0.7, 0.3, 1] }}
            onAnimationComplete={() => setFloater(null)}
            className="pointer-events-none fixed inset-x-0 top-32 text-center display text-5xl text-[var(--primary)] z-50"
            style={{ textShadow: "0 0 30px var(--primary-glow)" }}
          >
            {floater}
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}

function Meta({
  label,
  value,
  divider,
  accent,
  flame,
}: {
  label: string;
  value: string;
  divider?: boolean;
  accent?: boolean;
  flame?: boolean;
}) {
  return (
    <div
      className={`px-3 py-4 ${
        divider ? "border-l border-[var(--border)]" : ""
      }`}
    >
      <div className="eyebrow">{label}</div>
      <div
        className={`digit mt-2 text-2xl font-medium tracking-tight flex items-center gap-1.5 ${
          accent ? "text-[var(--primary)]" : "text-[var(--foreground)]"
        }`}
      >
        {flame && <span className="text-base">⚡</span>}
        {value}
      </div>
    </div>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M5 12l4 4 10-10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
