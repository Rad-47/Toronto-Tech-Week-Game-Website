"use client";

import { motion } from "motion/react";
import { type ReactNode } from "react";

export function SplitText({
  text,
  className = "",
  delay = 0,
  stagger = 0.04,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const chars = Array.from(text);
  return (
    <span className="inline-block" aria-label={text}>
      {chars.map((c, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          initial={{ opacity: 0, y: "0.6em", filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            delay: delay + i * stagger,
            duration: 0.6,
            ease: [0.2, 0.7, 0.3, 1],
          }}
          className={`inline-block ${className}`}
          style={{ whiteSpace: c === " " ? "pre" : "normal" }}
        >
          {c}
        </motion.span>
      ))}
    </span>
  );
}

export function SplitWords({
  text,
  className = "",
  delay = 0,
  stagger = 0.08,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const words = text.split(" ");
  return (
    <span aria-label={text}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            delay: delay + i * stagger,
            duration: 0.7,
            ease: [0.2, 0.7, 0.3, 1],
          }}
          className={`inline-block mr-[0.25em] ${className}`}
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
}

export function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.55, ease: [0.2, 0.7, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
