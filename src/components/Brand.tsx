import Image from "next/image";
import Link from "next/link";

export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/brand/fanlinc-logo.png"
      alt="FanLinc"
      width={size}
      height={size}
      priority
      className="object-contain"
      style={{ width: size, height: "auto" }}
    />
  );
}

export function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <BrandMark size={34} />
      <span className="flex items-baseline gap-2">
        <span className="text-[16px] font-bold tracking-tight">FanLinc</span>
        <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] font-medium">
          GameDay
        </span>
      </span>
    </Link>
  );
}
