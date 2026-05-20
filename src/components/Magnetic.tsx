"use client";

import { useRef, type ReactNode } from "react";

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

export function Magnetic({ children, strength = 0.25, className = "" }: MagneticProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
  }
  function onLeave() {
    if (ref.current) ref.current.style.transform = "translate3d(0,0,0)";
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`magnet ${className}`}
    >
      {children}
    </div>
  );
}
