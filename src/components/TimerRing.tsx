"use client";

export function TimerRing({
  pct,
  seconds,
  size = 96,
}: {
  pct: number;
  seconds: number;
  size?: number;
}) {
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  const color =
    pct > 0.5 ? "#00ff95" : pct > 0.25 ? "#ffcc33" : "#ff4d6d";
  const glow =
    pct > 0.5 ? "rgba(0,255,149,0.45)" : pct > 0.25 ? "rgba(255,204,51,0.5)" : "rgba(255,77,109,0.55)";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="timer-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={pct > 0.5 ? "#6b8cff" : color} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#timer-grad)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: "stroke-dashoffset 100ms linear",
            filter: `drop-shadow(0 0 8px ${glow})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center leading-none">
          <div className="digit text-2xl font-bold">{seconds.toFixed(1)}</div>
          <div className="text-[9px] uppercase tracking-[0.2em] text-[var(--muted)] font-semibold mt-0.5">
            sec
          </div>
        </div>
      </div>
    </div>
  );
}
