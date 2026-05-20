export function StepBar({ step }: { step: 1 | 2 | 3 | 4 }) {
  const labels = ["Signup", "Sport", "Play", "Result"];
  return (
    <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] font-mono font-medium">
      {labels.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} className="flex items-center gap-3 flex-1 last:flex-[0_0_auto]">
            <div className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  active
                    ? "bg-[var(--primary)]"
                    : done
                    ? "bg-[var(--primary)] opacity-50"
                    : "bg-white/20"
                }`}
              />
              <span
                className={`hidden sm:inline ${
                  active
                    ? "text-[var(--foreground)]"
                    : done
                    ? "text-[var(--muted)]"
                    : "text-[var(--muted-2)]"
                }`}
              >
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div
                className={`flex-1 h-px ${
                  done ? "bg-[var(--primary)] opacity-50" : "bg-white/8"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
