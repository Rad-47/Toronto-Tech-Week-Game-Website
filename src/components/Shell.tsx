import Link from "next/link";
import { BrandMark, Wordmark } from "./Brand";
import { MarginalArt } from "./MarginalArt";

export function PageShell({
  children,
  hideNav = false,
}: {
  children: React.ReactNode;
  hideNav?: boolean;
}) {
  return (
    <div className="relative min-h-screen flex flex-col w-full">
      <div className="grain" aria-hidden />
      <MarginalArt />
      {!hideNav && (
        <header className="relative z-20 flex items-center justify-between px-5 pt-5 pb-3 sm:px-10">
          <Wordmark />
          <nav className="flex items-center gap-1 text-xs">
            <Link
              href="/leaderboard"
              prefetch
              className="h-9 px-3.5 inline-flex items-center rounded-full text-[var(--foreground)] hover:bg-white/5 transition-colors font-medium"
            >
              Leaderboard
            </Link>
            <Link
              href="/admin"
              className="h-9 px-3.5 inline-flex items-center rounded-full text-[var(--muted)] hover:text-white transition-colors font-medium"
            >
              Admin
            </Link>
          </nav>
        </header>
      )}
      <main className="relative z-10 flex-1 flex flex-col w-full max-w-md sm:max-w-2xl mx-auto px-5 sm:px-6 pb-12">
        {children}
      </main>
      <footer className="relative z-20 px-5 sm:px-10 pt-6 pb-5 border-t border-[var(--border)] bg-[var(--background)]">
        <div className="max-w-md sm:max-w-2xl mx-auto flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] font-medium">
          <span className="flex items-center gap-2">
            <BrandMark size={20} />
            <span>FanLinc · GameDay IQ</span>
          </span>
          <span className="hidden sm:block">Toronto Tech Week · May 2026</span>
          <span className="digit">© 26</span>
        </div>
      </footer>
    </div>
  );
}
