"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export function fireConfetti() {
  const defaults = {
    spread: 70,
    ticks: 200,
    gravity: 0.9,
    decay: 0.93,
    startVelocity: 35,
    colors: ["#00ff95", "#6b8cff", "#ff5a1f", "#ffcc33", "#ffffff"],
    zIndex: 9999,
  };

  function shoot(opts: confetti.Options) {
    confetti({ ...defaults, ...opts });
  }

  shoot({ particleCount: 60, angle: 60, origin: { x: 0, y: 0.85 } });
  shoot({ particleCount: 60, angle: 120, origin: { x: 1, y: 0.85 } });
  shoot({ particleCount: 80, spread: 90, origin: { x: 0.5, y: 0.55 } });

  setTimeout(() => {
    shoot({ particleCount: 50, angle: 60, origin: { x: 0, y: 0.85 } });
    shoot({ particleCount: 50, angle: 120, origin: { x: 1, y: 0.85 } });
  }, 220);
}

export function ConfettiOnMount({ trigger }: { trigger: boolean }) {
  useEffect(() => {
    if (trigger) fireConfetti();
  }, [trigger]);
  return null;
}
