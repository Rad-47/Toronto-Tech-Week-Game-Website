"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { PageShell } from "@/components/Shell";
import { StepBar } from "@/components/StepBar";
import { FadeUp } from "@/components/SplitText";
import {
  getAppSettings,
  saveSignup,
  setCurrentSignup,
} from "@/lib/store";
import type { Role, Signup } from "@/lib/types";

const ROLES: Role[] = ["Fan", "Investor", "Founder", "Athlete", "Sponsor", "Team Rep"];

/** Trim whitespace; accept whatever the user typed. */
function normalizeFanlincId(raw: string): string {
  return raw.trim();
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [fanlincId, setFanlincId] = useState("");
  const [favorite, setFavorite] = useState("");
  const [role, setRole] = useState<Role>("Fan");
  const [consent, setConsent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [requireFanlincId, setRequireFanlincId] = useState<boolean>(true);
  const [requireEmail, setRequireEmail] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const settings = await getAppSettings();
      if (cancelled) return;
      setRequireFanlincId(settings.requireFanlincId);
      setRequireEmail(settings.requireEmail);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Please enter your name.");
    const trimmedEmail = email.trim();
    if (requireEmail && !trimmedEmail)
      return setError("Please enter your email.");
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail))
      return setError("Please enter a valid email.");
    const normalizedId = normalizeFanlincId(fanlincId);
    if (requireFanlincId && !normalizedId) {
      return setError("Please enter your FanLinc User ID.");
    }
    const signup: Signup = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      fanlincId: normalizedId || undefined,
      favorite: favorite.trim(),
      role,
      consent,
      createdAt: Date.now(),
    };
    setSubmitting(true);
    try {
      await saveSignup(signup);
      setCurrentSignup(signup);
      router.push("/category");
    } catch (err) {
      console.error(err);
      setError("Couldn't save your signup. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <PageShell>
      <div className="pt-4">
        <StepBar step={1} />

        <FadeUp delay={0.1} className="mt-10">
          <div className="eyebrow eyebrow-accent">Step 01</div>
          <h1 className="display text-[44px] sm:text-[64px] leading-[0.92] mt-3">
            Who&apos;s
            <br />
            playing?
          </h1>
          <p className="text-[var(--muted)] mt-4 text-[14px] max-w-sm">
            Quick roster check before the round. Ten seconds, max.
          </p>
        </FadeUp>

        <motion.form
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } },
          }}
          onSubmit={onSubmit}
          className="mt-10 space-y-5"
        >
          <FieldAnim>
            <Field index="01" label="Full name" htmlFor="name">
              <input
                id="name"
                className="input"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </Field>
          </FieldAnim>

          <FieldAnim>
            <Field
              index="02"
              label={requireEmail ? "Email" : "Email (optional)"}
              htmlFor="email"
            >
              <input
                id="email"
                type="email"
                inputMode="email"
                className="input"
                placeholder="you@team.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required={requireEmail}
              />
            </Field>
          </FieldAnim>

          <FieldAnim>
            <Field
              index="03"
              label={
                requireFanlincId
                  ? "FanLinc User ID"
                  : "FanLinc User ID (optional)"
              }
              htmlFor="fanlincId"
              hint="Find it in your FanLinc profile."
            >
              <input
                id="fanlincId"
                className="input"
                placeholder="@yourname"
                value={fanlincId}
                onChange={(e) => setFanlincId(e.target.value)}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                required={requireFanlincId}
              />
            </Field>
          </FieldAnim>

          <FieldAnim>
            <Field index="04" label="Favourite team or player" htmlFor="fave">
              <input
                id="fave"
                className="input"
                placeholder="e.g. Toronto Raptors"
                value={favorite}
                onChange={(e) => setFavorite(e.target.value)}
              />
            </Field>
          </FieldAnim>

          <FieldAnim>
            <Field index="05" label="Your role at the event">
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className="chip text-[13px]"
                    data-selected={role === r}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </Field>
          </FieldAnim>

          <FieldAnim>
            <label className="flex items-start gap-3 py-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[var(--primary)] flex-shrink-0"
              />
              <span className="text-[13px] text-[var(--muted)] leading-relaxed">
                I agree to receive FanLinc updates and winner announcements. I can
                unsubscribe any time.
              </span>
            </label>
          </FieldAnim>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[var(--danger)] text-sm border border-[rgba(255,85,119,0.3)] rounded-xl px-3 py-2 bg-[rgba(255,85,119,0.06)]"
            >
              {error}
            </motion.div>
          )}

          <FieldAnim>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full h-14 rounded-full text-[15px] flex items-center justify-center gap-2.5 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving…" : "Pick my sport"}
              {!submitting && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </FieldAnim>
        </motion.form>
      </div>
    </PageShell>
  );
}

function FieldAnim({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
      }}
    >
      {children}
    </motion.div>
  );
}

function Field({
  index,
  label,
  htmlFor,
  hint,
  children,
}: {
  index: string;
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="flex items-baseline gap-2.5 mb-2.5"
      >
        <span className="digit text-[10px] text-[var(--primary)] font-medium tracking-wider">
          {index}
        </span>
        <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] font-medium">
          {label}
        </span>
      </label>
      {children}
      {hint && (
        <div className="mt-1.5 text-[11px] text-[var(--muted-2)] leading-snug">
          {hint}
        </div>
      )}
    </div>
  );
}
