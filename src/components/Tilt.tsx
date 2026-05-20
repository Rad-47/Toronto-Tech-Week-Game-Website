"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";

export function Tilt({
  children,
  max = 10,
  className = "",
  style,
}: {
  children: ReactNode;
  max?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${-py * max}deg) rotateY(${px * max}deg)`;
  }
  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`tilt ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
