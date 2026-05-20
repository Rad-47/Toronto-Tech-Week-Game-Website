"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { PageShell } from "@/components/Shell";
import { StepBar } from "@/components/StepBar";
import { ConfettiOnMount } from "@/components/Confetti";
import { Magnetic } from "@/components/Magnetic";
import { FadeUp } from "@/components/SplitText";
import { getLastResult, getLeaderboard, setCurrentCategory } from "@/lib/store";
import { assignBadge } from "@/lib/scoring";
import { IMAGES } from "@/lib/images";
import type { LeaderboardEntry } from "@/lib/types";

export default function ResultsPage() {
  const router = useRouter();
  const [entry, setEntry] = useState<LeaderboardEntry | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    const e = getLastResult();
    if (!e) {
      router.replace("/");
      return;
    }
    setEntry(e);
    const board = [...getLeaderboard()].sort((a, b) => b.score - a.score);
    const r = board.findIndex((x) => x.id === e.id) + 1;
    setRank(r > 0 ? r : board.length + 1);
    const controls = animate(count, e.score, {
      duration: 1.2,
      ease: [0.2, 0.7, 0.3, 1],
    });
    return () => controls.stop();
  }, [router, count]);

  if (!entry) {
    return (
      <PageShell>
        <div className="pt-10 text-center text-[var(--muted)]">Loading…</div>
      </PageShell>
    );
  }

  const badge = assignBadge(entry.correct, entry.total, entry.score);
  const pct = Math.round((entry.correct / entry.total) * 100);

  return (
    <PageShell>
      <ConfettiOnMount trigger={true} />

      <div className="pt-4">
        <StepBar step={4} />
      </div>

      {/* === Score hero === */}
      <FadeUp delay={0.1} className="mt-12">
        <div className="eyebrow eyebrow-accent">Result</div>
        <div className="flex items-baseline justify-between gap-4 mt-4 border-b border-[var(--border-strong)] pb-2">
          <motion.div className="display text-[120px] sm:text-[180px] leading-[0.85] text-[var(--primary)]">
            <motion.span>{rounded}</motion.span>
          </motion.div>
          <div className="text-right">
            <div className="eyebrow">Accuracy</div>
            <div className="digit text-3xl sm:text-4xl mt-1 font-medium tracking-tight">
              {pct}%
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-baseline justify-between text-[12px]">
          <span className="text-[var(--muted)]">
            <span className="text-white font-semibold">{entry.correct}</span> of{" "}
            {entry.total} correct
          </span>
          <span className="eyebrow">{entry.categoryName}</span>
        </div>
      </FadeUp>

      {/* === Badge === */}
      <FadeUp delay={0.3} className="mt-12">
        <div className="grid grid-cols-[auto_1fr] gap-5 items-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.4,
              type: "spring",
              stiffness: 180,
              damping: 14,
            }}
            className="w-20 h-20 rounded-full border border-[var(--primary)] grid place-items-center relative"
            style={{
              background: "radial-gradient(circle at 30% 20%, rgba(184,255,94,0.18), transparent 70%)",
              boxShadow: "0 0 60px -10px var(--primary-glow)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 2l3 6 6 1-4.5 4.5L18 20l-6-3-6 3 1.5-6.5L3 9l6-1z"
                stroke="var(--primary)"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
          <div>
            <div className="eyebrow eyebrow-accent">Badge unlocked</div>
            <div className="display-tight text-[28px] sm:text-[32px] mt-1">
              {entry.badge}
            </div>
            <p className="text-[13px] text-[var(--muted)] mt-2 leading-relaxed max-w-xs">
              {badge.blurb}
            </p>
          </div>
        </div>
      </FadeUp>

      {/* === Stats === */}
      <FadeUp delay={0.45} className="mt-12">
        <div className="grid grid-cols-2 divide-x divide-[var(--border)] border-y border-[var(--border)]">
          <Stat label="Event rank" value={`# ${rank ?? "—"}`} />
          <Stat
            label="Round time"
            value={`${(entry.durationMs / 1000).toFixed(1)}s`}
          />
        </div>
      </FadeUp>

      {/* === Prize === */}
      <FadeUp delay={0.6} className="mt-12">
        <div className="relative aspect-[16/9] sm:aspect-[16/8] overflow-hidden border border-[var(--border)]">
          <Image
            src={IMAGES.trophy}
            alt="Tonight's prize"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(7,7,8,0.2), rgba(7,7,8,0.55) 60%, rgba(7,7,8,0.96) 100%)",
            }}
          />
          <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-end">
            <div className="eyebrow eyebrow-accent">Prize draw</div>
            <div className="display text-[32px] sm:text-[48px] mt-3 leading-[0.92]">
              You&apos;re in.
            </div>
            <div className="mt-3 text-[13px] text-white/70 max-w-md">
              Entry locked. Winners drawn live tonight from the leaderboard, then
              announced via email.
            </div>
          </div>
        </div>
      </FadeUp>

      {/* === Actions === */}
      <FadeUp delay={0.75} className="mt-10 space-y-3">
        <Magnetic strength={0.16}>
          <a
            href="https://fanlinc.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary h-14 px-6 rounded-full text-[15px] flex items-center justify-center gap-2.5 w-full"
          >
            Join FanLinc
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M7 17L17 7M17 7H8M17 7v9"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </Magnetic>
        <button
          type="button"
          onClick={() => {
            setCurrentCategory(null);
            router.push("/category");
          }}
          className="btn-ghost h-12 w-full rounded-full text-[14px]"
        >
          Play another category
        </button>
        <Link
          href="/leaderboard"
          prefetch
          className="block text-center text-[11px] text-[var(--muted)] hover:text-white transition-colors py-3 uppercase tracking-[0.22em] font-mono font-medium"
        >
          See full leaderboard ↗
        </Link>
      </FadeUp>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-5">
      <div className="eyebrow">{label}</div>
      <div className="digit text-2xl sm:text-3xl mt-2 font-medium tracking-tight">
        {value}
      </div>
    </div>
  );
}
