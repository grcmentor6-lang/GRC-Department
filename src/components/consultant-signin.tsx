"use client";

import Link from "next/link";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { login } from "@/lib/consultant-portal";
import { Field, inputClass } from "@/components/form-bits";

export function ConsultantSignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      onSignedIn();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        // Their grcmentor credentials are right; they simply have not been listed yet.
        setError(err.message);
      } else if (err instanceof ApiError && err.status === 401) {
        setError("That email and password did not match a grcmentor account.");
      } else if (err instanceof ApiError && err.status === 429) {
        setError("Too many attempts. Wait a minute and try again.");
      } else {
        setError("Could not reach the server. Please try again in a moment.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Consultant portal
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-[-0.02em] text-ink sm:text-4xl">
          Your engagements, tasks, tracked time and payouts.
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-4">
          Run your delivery work from one place. Track time against the activity you are
          performing, submit the week for client approval, and see exactly what has been approved,
          what is awaiting approval, and what is due to be paid.
        </p>
        <ul className="mt-6 max-w-2xl space-y-3 text-sm leading-relaxed text-ink-3">
          <li className="flex gap-2">
            <span aria-hidden className="text-accent">—</span>
            Time is logged per task, so every hour is attributable on the client&apos;s statement of work.
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-accent">—</span>
            Each week goes to the client contact for approval; a week nobody reviews within five
            business days is approved automatically.
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-accent">—</span>
            Only approved hours are payable. Payouts cover everything approved in the previous month.
          </li>
        </ul>
      </div>

      <div className="rounded-xl border border-line bg-surface p-7">
        <h2 className="text-lg font-bold text-ink">Consultant sign in</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-4">
          Use your <span className="font-semibold text-ink">grcmentor.ai account</span> — the same
          email and password you use as a mentee. Your assessment record and verified competencies
          carry across.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-5">
          <Field label="grcmentor.ai email" htmlFor="c-email">
            <input
              id="c-email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Password" htmlFor="c-password">
            <input
              id="c-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </Field>

          {error && (
            <p role="alert" className="rounded-lg border border-line-strong bg-sunken px-4 py-3 text-sm text-ink-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="focus-ring w-full rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Continue with grcmentor.ai"}
          </button>
        </form>

        <p className="mt-6 border-t border-line pt-5 text-sm leading-relaxed text-ink-5">
          Slack sign-in is not built yet. Not listed?{" "}
          <Link href="/consultants" className="focus-ring rounded font-medium text-accent hover:text-accent-dark">
            See how listing works
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
