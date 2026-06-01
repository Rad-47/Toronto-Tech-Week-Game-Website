"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { PageShell } from "@/components/Shell";
import { Magnetic } from "@/components/Magnetic";
import { FadeUp } from "@/components/SplitText";
import { CategoryIcon } from "@/components/SportIcons";
import { IMAGES, CATEGORY_IMAGES, ROSTER } from "@/lib/images";
import { getCategories } from "@/lib/questions";

export default function Home() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"],
  });
  // Scroll-driven hero reveal:
  //   Image 1 (arena + GAME DAY) slides UP and out of view over the
  //   first 60% of the scroll range. Image 2 (action shot) sits
  //   beneath at z-0 and stays put — revealed as image 1 leaves.
  const layer1Y = useTransform(scrollYProgress, [0, 0.6], ["0%", "-100%"]);
  const layer1Opacity = useTransform(scrollYProgress, [0.45, 0.6], [1, 0]);
  const layer2Scale = useTransform(scrollYProgress, [0, 1], [1.08, 1.02]);
  const layer2Y = useTransform(scrollYProgress, [0, 1], ["8%", "0%"]);
  const layer2HeadlineOpacity = useTransform(
    scrollYProgress,
    [0.55, 0.75],
    [0, 1]
  );
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const categories = getCategories();

  return (
    <PageShell>
      {/* ============== HERO — scroll-driven reveal ============== */}
      <section
        ref={heroRef}
        className="relative -mx-5 sm:-mx-6 mt-2 h-[180vh] border-y border-[var(--border)]"
      >
        {/* Sticky pinned viewport — stays full-bleed while user scrolls
            through the 180vh section. The slide-up reveal happens here. */}
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* LAYER 2 — sits beneath, revealed when layer 1 slides off.
              Subtle parallax of its own so it doesn't feel static. */}
          <motion.div
            style={{ y: layer2Y, scale: layer2Scale }}
            className="absolute inset-0 z-0"
          >
            <Image
              src={IMAGES.basketballAction}
              alt="Tonight's game action"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1024px"
              className="object-cover"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(7,7,8,0.35) 0%, rgba(7,7,8,0.1) 30%, rgba(7,7,8,0.5) 75%, rgba(7,7,8,0.95) 100%)",
              }}
            />
            {/* Secondary headline that lives on layer 2 — only legible
                once layer 1 has cleared, fades in as scroll progresses. */}
            <motion.div
              style={{ opacity: layer2HeadlineOpacity }}
              className="absolute inset-0 p-5 sm:p-10 flex flex-col justify-end"
            >
              <div className="eyebrow eyebrow-accent">On the floor tonight</div>
              <div className="display text-[56px] sm:text-[112px] leading-[0.9] mt-3 max-w-[14ch] text-white">
                Play.
                <br />
                Win.
              </div>
            </motion.div>
          </motion.div>

          {/* LAYER 1 — arena image with the GAME DAY headline.
              Slides up and fades out as user scrolls. */}
          <motion.div
            style={{ y: layer1Y, opacity: layer1Opacity }}
            className="absolute inset-0 z-10"
          >
            <Image
              src={IMAGES.heroArena}
              alt="Game night arena"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1024px"
              className="object-cover"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(7,7,8,0.25) 0%, rgba(7,7,8,0.05) 30%, rgba(7,7,8,0.6) 75%, rgba(7,7,8,1) 100%)",
              }}
              aria-hidden
            />

            {/* Editorial overlay — slides up with layer 1 */}
            <div className="absolute inset-0 p-5 sm:p-10 flex flex-col">
              {/* Top stamp */}
              <div className="flex items-start justify-between">
                <div className="inline-flex items-center gap-2 eyebrow">
                  <span className="relative inline-block w-1.5 h-1.5 rounded-full bg-[var(--primary)] pulse-ring" />
                  Live tonight
                </div>
                <div className="eyebrow text-right">
                  <div>Brampton</div>
                  <div className="digit text-[var(--foreground)] text-xs font-medium tracking-tight mt-0.5">
                    25 / 05 / 26
                  </div>
                </div>
              </div>

              <div className="flex-1" />

              <FadeUp delay={0.2}>
                <div className="flex items-center gap-2.5">
                  <Image
                    src="/brand/fanlinc-logo.png"
                    alt="FanLinc"
                    width={28}
                    height={28}
                    priority
                    className="object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
                  />
                  <span className="eyebrow eyebrow-accent">FanLinc presents</span>
                </div>
                <h1 className="display text-[88px] sm:text-[160px] leading-[0.84] mt-3 sm:mt-4 text-[var(--foreground)]">
                  Game
                  <br />
                  Day.
                </h1>
              </FadeUp>
            </div>
          </motion.div>

          {/* Scroll-hint chevron — fades out as scroll begins */}
          <motion.div
            style={{ opacity: scrollHintOpacity }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 eyebrow text-white/70 flex flex-col items-center gap-1.5"
          >
            <span>Scroll</span>
            <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
              <path
                d="M7 2v14M2 11l5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="square"
              />
            </svg>
          </motion.div>
        </div>

        {/* Stat row — anchored at the very bottom of the 180vh section,
            so the user lands on it after the reveal completes. */}
        <div className="absolute bottom-0 inset-x-0 border-t border-[var(--border)] grid grid-cols-3 text-center bg-[var(--background)]">
          <div className="px-3 py-4 border-r border-[var(--border)]">
            <div className="display-tight text-2xl">10</div>
            <div className="eyebrow mt-1">Questions</div>
          </div>
          <div className="px-3 py-4 border-r border-[var(--border)]">
            <div className="display-tight text-2xl">4</div>
            <div className="eyebrow mt-1">Sports</div>
          </div>
          <div className="px-3 py-4">
            <div className="display-tight text-2xl text-[var(--primary)]">∞</div>
            <div className="eyebrow mt-1">Glory</div>
          </div>
        </div>
      </section>

      {/* ============== INTRO / CTA ============== */}
      <section className="mt-12 sm:mt-20">
        <FadeUp>
          <p className="text-[20px] sm:text-[26px] leading-[1.25] font-light max-w-md text-balance">
            Ten questions. One sport. A chance at signed merch — drawn live
            tonight from the top of the leaderboard.
          </p>
        </FadeUp>
        <FadeUp delay={0.1} className="mt-8 flex flex-col sm:flex-row gap-3">
          <Magnetic strength={0.16}>
            <Link
              href="/signup"
              prefetch
              className="btn-primary h-14 px-7 rounded-full text-[15px] flex items-center justify-center gap-2.5"
            >
              Start challenge
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </Magnetic>
          <Link
            href="/leaderboard"
            prefetch
            className="btn-ghost h-14 px-6 rounded-full text-[14px] flex items-center justify-center gap-2"
          >
            View leaderboard
          </Link>
        </FadeUp>
      </section>

      {/* ============== INDEX 01 — SPORTS ============== */}
      <section className="mt-20 sm:mt-32">
        <FadeUp>
          <div className="flex items-baseline justify-between">
            <div className="eyebrow eyebrow-accent">Index 01</div>
            <div className="eyebrow">Pick one</div>
          </div>
          <div className="divider mt-3" />
          <h2 className="display text-[44px] sm:text-[80px] leading-[0.9] mt-6">
            The
            <br />
            sports.
          </h2>
        </FadeUp>

        <motion.div
          className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {categories.map((c, i) => (
            <motion.div
              key={c.id}
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
              }}
            >
              <Link
                href="/signup"
                prefetch
                className="group relative block aspect-[4/5] overflow-hidden border border-[var(--border)] cursor-pointer"
              >
                <Image
                  src={CATEGORY_IMAGES[c.id]}
                  alt={c.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 320px"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                {/* Single tasteful overlay, no color cast */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(7,7,8,0.2) 0%, rgba(7,7,8,0.05) 40%, rgba(7,7,8,0.85) 85%, rgba(7,7,8,1) 100%)",
                  }}
                />
                <div className="absolute inset-0 p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="eyebrow text-white/80">
                      <span className="digit text-[var(--primary)] mr-2">
                        0{i + 1}
                      </span>
                      <span>{c.name.split(" ")[0]}</span>
                    </div>
                    <span className="text-white/60 group-hover:text-[var(--primary)] transition-colors">
                      <CategoryIcon id={c.id} size={20} />
                    </span>
                  </div>
                  <div>
                    <div className="display text-[28px] sm:text-[36px] text-white">
                      {c.name}
                    </div>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-white/75 font-medium">
                      Play
                      <svg
                        width="14"
                        height="10"
                        viewBox="0 0 14 10"
                        fill="none"
                        className="transition-transform group-hover:translate-x-1"
                      >
                        <path
                          d="M0 5h12M8 1l4 4-4 4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="square"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ============== INDEX 02 — HOW IT WORKS ============== */}
      <section className="mt-20 sm:mt-32">
        <FadeUp>
          <div className="flex items-baseline justify-between">
            <div className="eyebrow eyebrow-accent">Index 02</div>
            <div className="eyebrow">90 seconds</div>
          </div>
          <div className="divider mt-3" />
          <h2 className="display text-[44px] sm:text-[80px] leading-[0.9] mt-6">
            The
            <br />
            rundown.
          </h2>
        </FadeUp>

        <motion.div
          className="mt-10 divide-y divide-[var(--border)] border-y border-[var(--border)]"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {[
            { n: "01", t: "Sign in", c: "Name, email, role. Ten seconds." },
            { n: "02", t: "Pick a sport", c: "Basketball, OHL, baseball, mix." },
            { n: "03", t: "Race the clock", c: "Ten questions. Speed + streak bonuses." },
            { n: "04", t: "Win signed merch", c: "Only top scorers enter tonight's draw." },
          ].map((s) => (
            <motion.div
              key={s.n}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              className="grid grid-cols-[60px_1fr_auto] sm:grid-cols-[80px_1fr_auto] items-center gap-4 py-5"
            >
              <div className="digit text-[var(--muted)] text-sm font-medium">
                {s.n}
              </div>
              <div>
                <div className="text-[17px] font-semibold tracking-tight">
                  {s.t}
                </div>
                <div className="text-[13px] text-[var(--muted)] mt-1">
                  {s.c}
                </div>
              </div>
              <div className="w-6 h-px bg-[var(--border-strong)]" />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ============== INDEX 03 — ROSTER ============== */}
      <section className="mt-20 sm:mt-32">
        <FadeUp>
          <div className="flex items-baseline justify-between">
            <div className="eyebrow eyebrow-accent">Index 03</div>
            <div className="eyebrow">On the floor</div>
          </div>
          <div className="divider mt-3" />
          <h2 className="display text-[44px] sm:text-[80px] leading-[0.9] mt-6">
            The
            <br />
            roster.
          </h2>
          <p className="mt-5 text-[14px] sm:text-[15px] text-[var(--muted)] max-w-md leading-relaxed">
            Real athletes working with FanLinc on tonight&apos;s event.
            Hockey, baseball — all on the floor.
          </p>
        </FadeUp>

        <motion.div
          className="mt-10 grid grid-cols-2 gap-3 sm:gap-4"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {ROSTER.map((p) => (
            <motion.div
              key={p.index}
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
              }}
              className="group relative aspect-[3/4] overflow-hidden border border-[var(--border)]"
            >
              <Image
                src={p.photo}
                alt={`${p.sport} player — ${p.team}`}
                fill
                sizes="(max-width: 640px) 50vw, 320px"
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(7,7,8,0.15) 0%, rgba(7,7,8,0.05) 40%, rgba(7,7,8,0.85) 88%, rgba(7,7,8,0.98) 100%)",
                }}
              />
              <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="eyebrow text-white/80">
                    <span className="digit text-[var(--primary)] mr-2">
                      {p.index}
                    </span>
                    {p.sport}
                  </div>
                </div>
                <div>
                  <div className="display text-[20px] sm:text-[28px] leading-[1.0] text-white">
                    {p.name}
                  </div>
                  <div className="text-[11px] sm:text-[12px] text-white/65 mt-1.5 leading-snug">
                    {p.team}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ============== INDEX 04 — PRIZE ============== */}
      <section className="mt-20 sm:mt-32">
        <FadeUp>
          <div className="flex items-baseline justify-between">
            <div className="eyebrow eyebrow-accent">Index 04</div>
            <div className="eyebrow">Tonight only</div>
          </div>
          <div className="divider mt-3" />
        </FadeUp>

        <FadeUp delay={0.1} className="mt-6">
          <div className="relative aspect-[4/5] sm:aspect-[16/9] overflow-hidden border border-[var(--border)]">
            <Image
              src={IMAGES.trophy}
              alt="Tonight's prize"
              fill
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
            <div className="absolute inset-0 p-5 sm:p-10 flex flex-col justify-end">
              <div className="eyebrow eyebrow-accent">Prize</div>
              <h3 className="display text-[44px] sm:text-[88px] leading-[0.9] mt-3 max-w-[16ch]">
                Signed
                <br />
                merch.
              </h3>
              <p className="mt-4 text-[14px] sm:text-[15px] text-white/70 max-w-md leading-relaxed">
                Every play earns one entry. Winners drawn live from tonight's
                leaderboard at the Honey Badgers night.
              </p>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ============== CLOSER ============== */}
      <section className="mt-20 sm:mt-32 mb-6 text-center">
        <FadeUp>
          <div className="eyebrow eyebrow-accent mb-6">Your turn</div>
          <h3 className="display text-[56px] sm:text-[96px] leading-[0.88]">
            Step on
            <br />
            the court.
          </h3>
          <p className="mt-5 text-[14px] text-[var(--muted)] max-w-xs mx-auto">
            Takes 90 seconds. Free. One entry per round.
          </p>
          <div className="mt-8 flex justify-center">
            <Magnetic strength={0.2}>
              <Link
                href="/signup"
                prefetch
                className="btn-primary h-14 px-10 rounded-full text-[15px] flex items-center justify-center gap-2.5"
              >
                Start challenge
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </Magnetic>
          </div>
        </FadeUp>
      </section>
    </PageShell>
  );
}
