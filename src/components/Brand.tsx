import Link from "next/link";

export function BrandMark({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="30" height="30" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 8h12M10 8v16M10 16h8"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <span className="text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
        <BrandMark />
      </span>
      <span className="flex items-baseline gap-1.5">
        <span className="text-[15px] font-bold tracking-tight">FanLinc</span>
        <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] font-medium">
          GameDay
        </span>
      </span>
    </Link>
  );
}
