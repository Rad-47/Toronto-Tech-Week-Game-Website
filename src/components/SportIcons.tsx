import type { CategoryId } from "@/lib/types";

interface IconProps {
  size?: number;
  className?: string;
}

export function BasketballIcon({ size = 28, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3 16h26M16 3v26M6.5 6.5c2.5 2.5 4 5.8 4 9.5s-1.5 7-4 9.5M25.5 6.5c-2.5 2.5-4 5.8-4 9.5s1.5 7 4 9.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HockeyIcon({ size = 28, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6 4l14 14M20 18l4 6c0.6 0.9 1.9 1.1 2.7 0.3l1.5-1.5c0.8-0.8 0.7-2.1-0.3-2.7L22 20"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse
        cx="9"
        cy="25"
        rx="5"
        ry="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.18"
      />
    </svg>
  );
}

export function BaseballIcon({ size = 28, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2" />
      <path
        d="M6 8c1.5 1.5 2.5 3.5 2.5 6S7.5 18.5 6 20M26 8c-1.5 1.5-2.5 3.5-2.5 6s1 4.5 2.5 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="2 3"
      />
    </svg>
  );
}

export function MixIcon({ size = 28, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="16" r="3" fill="currentColor" />
      <path
        d="M16 1v4M16 27v4M1 16h4M27 16h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CategoryIcon({
  id,
  size,
  className,
}: {
  id: CategoryId;
  size?: number;
  className?: string;
}) {
  if (id === "basketball")
    return <BasketballIcon size={size} className={className} />;
  if (id === "ohl-hockey") return <HockeyIcon size={size} className={className} />;
  if (id === "baseball") return <BaseballIcon size={size} className={className} />;
  return <MixIcon size={size} className={className} />;
}
