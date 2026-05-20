"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { pickGallery, pickLeadGallery, SIDE_GALLERY } from "@/lib/images";

const RATIOS = ["aspect-[3/4]", "aspect-[4/5]", "aspect-square", "aspect-[3/4]"];

function seedFromPath(path: string): number {
  let h = 0;
  for (let i = 0; i < path.length; i++) {
    h = (h * 31 + path.charCodeAt(i)) >>> 0;
  }
  return h || 1;
}

function MarqueeColumn({
  images,
  direction,
  durationSeconds,
  side,
}: {
  images: string[];
  direction: "up" | "down";
  durationSeconds: number;
  side: "left" | "right";
}) {
  // The animation moves the track 50% of its own height in the chosen
  // direction. Render the images TWICE so the loop is seamless.
  const looped = [...images, ...images];

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Top + bottom fade so images dissolve into the canvas */}
      <div
        className="absolute inset-x-0 top-0 h-24 z-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, var(--background) 0%, rgba(7,7,8,0) 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-24 z-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(0deg, var(--background) 0%, rgba(7,7,8,0) 100%)",
        }}
      />

      <div
        data-flow={direction}
        className="flex flex-col gap-6 px-6"
        style={{ ["--flow-duration" as string]: `${durationSeconds}s` }}
      >
        {looped.map((src, i) => {
          // Use i % images.length so paired duplicates keep the same ratio,
          // making the seam invisible.
          const idx = i % images.length;
          const ratio = RATIOS[idx % RATIOS.length];
          const nudge =
            side === "left"
              ? idx % 2 === 0
                ? "ml-0"
                : "ml-4"
              : idx % 2 === 0
              ? "mr-0"
              : "mr-4";
          return (
            <div
              key={`${i}-${idx}`}
              className={`relative overflow-hidden border border-[var(--border)] ${ratio} ${nudge}`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(min-width: 1536px) 320px, 280px"
                className="object-cover"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(7,7,8,0.25), rgba(7,7,8,0.45))",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MarginalArt() {
  const pathname = usePathname() ?? "/";
  const seed = useMemo(() => seedFromPath(pathname), [pathname]);

  // Each side has its own deck — lead with basketball / baseball / hockey,
  // then mix the rest. Enough images that the track is much taller than
  // the viewport, so the loop reads as continuous flow.
  const leftDeck = useMemo(() => {
    const lead = pickLeadGallery(seed, 7);
    const extra = pickGallery(seed * 7 + 3, 5);
    return [...lead, ...extra];
  }, [seed]);

  const rightDeck = useMemo(() => {
    const lead = pickLeadGallery(seed * 3 + 7, 7);
    const extra = pickGallery(seed * 11 + 13, 5);
    return [...lead, ...extra];
  }, [seed]);

  // Slightly different durations so the two sides don't feel synchronised.
  const LEFT_SECONDS = 90;
  const RIGHT_SECONDS = 110;

  // Backwards-compat reference so the import isn't dropped by the linter
  void SIDE_GALLERY;

  return (
    <div className="hidden xl:block pointer-events-none select-none">
      {/* LEFT — bottom → top */}
      <div className="fixed top-0 left-0 h-screen z-0 w-[18rem] 2xl:w-[22rem]">
        <MarqueeColumn
          images={leftDeck}
          direction="up"
          durationSeconds={LEFT_SECONDS}
          side="left"
        />
      </div>

      {/* RIGHT — top → bottom */}
      <div className="fixed top-0 right-0 h-screen z-0 w-[18rem] 2xl:w-[22rem]">
        <MarqueeColumn
          images={rightDeck}
          direction="down"
          durationSeconds={RIGHT_SECONDS}
          side="right"
        />
      </div>
    </div>
  );
}
