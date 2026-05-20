import Image from "next/image";
import Link from "next/link";

export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/brand/fanlinc-logo.png"
      alt="FanLinc"
      width={size}
      height={size}
      priority
      className="object-contain"
    />
  );
}

export function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <BrandMark size={28} />
      <span className="flex items-baseline gap-1.5">
        <span className="text-[15px] font-bold tracking-tight">FanLinc</span>
        <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] font-medium">
          GameDay
        </span>
      </span>
    </Link>
  );
}
