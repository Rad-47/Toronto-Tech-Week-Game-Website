"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { PageShell } from "@/components/Shell";
import { FadeUp } from "@/components/SplitText";
import { CategoryIcon } from "@/components/SportIcons";
import { getLeaderboard } from "@/lib/store";
import { getCategories } from "@/lib/questions";
import type { CategoryId, LeaderboardEntry } from "@/lib/types";

type Filter = "all" | CategoryId;

export default function LeaderboardPage() {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [hydrated, setHydrated] = useState(false);
  const categories = getCategories();

  useEffect(() => {
    setBoard(getLeaderboard());
    setHydrated(true);
  }, []);

  const filtered = useMemo(() => {
    const sorted = [...board].sort(
      (a, b) => b.score - a.score || a.durationMs - b.durationMs
    );
    return filter === "all" ? sorted : sorted.filter((e) => e.category === filter);
  }, [board, filter]);

  return (
    <PageShell>
      <FadeUp delay={0.05} className="pt-6">
        <div className="flex items-baseline justify-between">
          <div className="eyebrow eyebrow-accent">Live · Tonight</div>
          <div className="eyebrow">
            <span className="digit text-[var(--foreground)] mr-1">
              {String(board.length).padStart(2, "0")}
            </span>
            Plays
          </div>
        </div>
        <h1 className="display text-[56px] sm:text-[88px] leading-[0.88] mt-4">
          Leader
          <br />
          board.
        </h1>
      </FadeUp>

      <FadeUp delay={0.15} className="mt-10 -mx-1 px-1 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max pb-1">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </FilterChip>
          {categories.map((c) => (
            <FilterChip
              key={c.id}
              active={filter === c.id}
              onClick={() => setFilter(c.id)}
            >
              <CategoryIcon id={c.id} size={13} className="mr-1.5" />
              {c.name}
            </FilterChip>
          ))}
        </div>
      </FadeUp>

      {hydrated && filtered.length === 0 && (
        <FadeUp delay={0.25} className="mt-16 text-center">
          <div className="display text-[88px] leading-none text-[var(--muted-2)]">
            00
          </div>
          <div className="mt-4 text-[14px] font-medium">No plays yet.</div>
          <div className="text-[12px] text-[var(--muted)] mt-1">
            Put your name on the board first.
          </div>
          <Link
            href="/signup"
            prefetch
            className="btn-primary h-12 px-6 rounded-full text-sm inline-flex items-center justify-center mt-6"
          >
            Start challenge
          </Link>
        </FadeUp>
      )}

      {filtered.length > 0 && (
        <motion.div
          className="mt-8 divide-y divide-[var(--border)] border-y border-[var(--border)]"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.04, delayChildren: 0.3 } },
          }}
        >
          {filtered.slice(0, 50).map((e, i) => {
            const rank = i + 1;
            const isTop = rank <= 3;
            return (
              <motion.div
                key={e.id}
                variants={{
                  hidden: { opacity: 0, x: -12 },
                  show: { opacity: 1, x: 0, transition: { duration: 0.4 } },
                }}
                className="grid grid-cols-[40px_1fr_auto_90px] sm:grid-cols-[56px_1fr_140px_90px] items-center gap-3 py-4 px-1 hover:bg-white/[0.02] transition-colors"
              >
                <span
                  className={`digit text-base sm:text-lg font-medium ${
                    isTop ? "text-[var(--primary)]" : "text-[var(--muted-2)]"
                  }`}
                >
                  {String(rank).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="font-semibold truncate text-[15px]">
                    {e.name}
                  </div>
                  <div className="eyebrow mt-1">{e.badge}</div>
                </div>
                <div className="row-cat hidden sm:flex items-center gap-2 text-[12px] text-[var(--muted)]">
                  <CategoryIcon id={e.category} size={14} />
                  <span className="truncate">{e.categoryName}</span>
                </div>
                <div className="digit text-right text-xl sm:text-2xl font-medium text-[var(--primary)]">
                  {e.score}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <FadeUp delay={0.6} className="mt-10 flex items-center justify-center">
        <Link
          href="/category"
          prefetch
          className="btn-primary h-12 px-6 rounded-full text-sm flex items-center justify-center gap-2"
        >
          Play another round
        </Link>
      </FadeUp>
    </PageShell>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 px-4 rounded-full text-[11px] font-medium whitespace-nowrap border transition-all uppercase tracking-[0.15em] flex items-center cursor-pointer ${
        active
          ? "bg-[var(--primary)] text-black border-[var(--primary)]"
          : "border-[var(--border-strong)] text-white/70 hover:text-white hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}
