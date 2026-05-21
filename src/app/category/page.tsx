"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { PageShell } from "@/components/Shell";
import { StepBar } from "@/components/StepBar";
import { FadeUp } from "@/components/SplitText";
import { CategoryIcon } from "@/components/SportIcons";
import { Magnetic } from "@/components/Magnetic";
import { CATEGORY_IMAGES } from "@/lib/images";
import { getCategories } from "@/lib/questions";
import { getCurrentSignup, setCurrentCategory } from "@/lib/store";
import type { CategoryId } from "@/lib/types";

export default function CategoryPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [name, setName] = useState<string>("");
  const [selected, setSelected] = useState<CategoryId | null>(null);
  const categories = getCategories();

  useEffect(() => {
    const s = getCurrentSignup();
    if (!s) {
      router.replace("/signup");
      return;
    }
    setName(s.name.split(" ")[0] || s.name);
    setHydrated(true);
  }, [router]);

  function start() {
    if (!selected) return;
    setCurrentCategory(selected);
    router.push("/play");
  }

  if (!hydrated)
    return (
      <PageShell>
        <div className="pt-10 text-center text-[var(--muted)]">Loading…</div>
      </PageShell>
    );

  return (
    <PageShell>
      <div className="pt-4">
        <StepBar step={2} />

        <FadeUp delay={0.1} className="mt-10">
          <div className="eyebrow eyebrow-accent">Step 02</div>
          <h1 className="display text-[44px] sm:text-[64px] leading-[0.92] mt-3">
            Pick your
            <br />
            lane, <span className="text-[var(--primary)]">{name}</span>.
          </h1>
          <p className="text-[var(--muted)] mt-4 text-[14px] max-w-sm">
            Five random questions per round. Speed and streaks earn bonus points.
          </p>
        </FadeUp>

        <motion.div
          className="mt-10 space-y-3"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.25 } },
          }}
        >
          {categories.map((c, i) => {
            const isSel = selected === c.id;
            return (
              <motion.button
                key={c.id}
                type="button"
                onClick={() => setSelected(c.id)}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.55 } },
                }}
                className="relative w-full text-left overflow-hidden border transition-all cursor-pointer aspect-[16/9] sm:aspect-[16/7]"
                style={{
                  borderColor: isSel ? "var(--primary)" : "var(--border)",
                }}
              >
                <Image
                  src={CATEGORY_IMAGES[c.id]}
                  alt={c.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 640px"
                  className="object-cover transition-transform duration-700 ease-out"
                  style={{
                    transform: isSel ? "scale(1.04)" : "scale(1.0)",
                  }}
                />
                {/* Natural colour — only a left-to-right scrim for the
                    text legibility, no green cast. */}
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-500"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(7,7,8,0.85) 0%, rgba(7,7,8,0.45) 55%, rgba(7,7,8,0.15) 100%)",
                  }}
                />
                {/* Lime ring when selected — no image tint */}
                {isSel && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      boxShadow: "inset 0 0 0 2px var(--primary)",
                    }}
                  />
                )}
                <div className="absolute inset-0 p-5 sm:p-7 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2.5">
                      <span className="digit text-[var(--primary)] text-[11px] font-medium tracking-wider">
                        0{i + 1}
                      </span>
                      <span className="eyebrow text-white/60">
                        {c.tagline.split(",")[0]}
                      </span>
                    </div>
                    <div className="display text-[32px] sm:text-[48px] mt-3 text-white">
                      {c.name}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span
                      className={`transition-colors ${
                        isSel ? "text-[var(--primary)]" : "text-white/40"
                      }`}
                    >
                      <CategoryIcon id={c.id} size={28} />
                    </span>
                    {isSel && (
                      <motion.span
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-[10px] uppercase tracking-[0.22em] font-mono font-medium text-[var(--primary)]"
                      >
                        Selected
                      </motion.span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        <FadeUp delay={0.6} className="mt-8">
          <Magnetic strength={selected ? 0.15 : 0}>
            <button
              type="button"
              onClick={start}
              disabled={!selected}
              className="btn-primary group relative w-full h-14 rounded-full text-[15px] tracking-tight flex items-center justify-between pl-7 pr-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:saturate-0"
            >
              <span className="flex-1 text-left font-semibold">
                {selected ? "Start the round" : "Pick a category"}
              </span>
              <span
                className={`flex items-center justify-center w-10 h-10 rounded-full bg-black/90 text-[var(--primary)] transition-transform duration-300 ${
                  selected ? "group-hover:translate-x-1" : ""
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </Magnetic>
        </FadeUp>
      </div>
    </PageShell>
  );
}
