"use client";

import Link from "next/link";
import { SignUpWith } from "./signup-with";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { login, resendVerification, type Contact } from "@/lib/portal";
import { Field, inputClass } from "@/components/form-bits";

/**
 * Client sign-in. Three outcomes beyond success, each with its own way forward: wrong credentials,
 * an account whose email is not confirmed yet (offer to resend the link — the server only says
 * this after the password checks out, so it reveals nothing to a stranger), and rate limiting.
 */
export function PortalSignIn({ onSignedIn }: { onSignedIn: (c: Contact) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [resent, setResent] = useState(false);
  const [remember, setRemember] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setUnconfirmed(false);
    setResent(false);
    try {
      onSignedIn(await login(email, password, remember));
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setUnconfirmed(true);
        setError(err.message);
      } else if (err instanceof ApiError && err.status === 401) {
        setError(
          "That email and password do not match a client account. If you opened your account with " +
            "Slack, use the Slack button below — accounts made that way have no password until you set one.",
        );
      } else if (err instanceof ApiError && err.status === 429) {
        setError("Too many attempts. Wait a minute and try again.");
      } else {
        setError("Could not reach the server. Please try again in a moment.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    await resendVerification(email).catch(() => undefined);
    setResent(true);
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-line bg-surface p-7">
        <h1 className="text-xl font-semibold tracking-[-0.02em] text-ink">Client portal</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-4">
          Your requests, engagements and deliverables in one place.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-5">
          <Field label="Email" htmlFor="email">
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@company.com"
            />
          </Field>
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="password" className="block text-sm font-semibold text-ink">
                Password
              </label>
              <Link href="/portal/forgot" className="focus-ring rounded text-sm font-medium text-accent hover:text-accent-dark">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-2 ${inputClass}`}
            />
          </div>

          {error && (
            <div role="alert" className="rounded-lg border border-line-strong bg-sunken px-4 py-3 text-sm text-ink-2">
              {error}
              {unconfirmed &&
                (resent ? (
                  <p className="mt-2 font-medium text-positive">A new confirmation link is on its way.</p>
                ) : (
                  <button type="button" onClick={resend} className="focus-ring mt-2 block rounded font-semibold text-accent hover:text-accent-dark">
                    Send the confirmation link again
                  </button>
                ))}
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-ink-4">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Keep me signed in on this device
          </label>

          <button
            type="submit"
            disabled={busy}
            className="focus-ring w-full rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <SignUpWith verb="Sign in" />

        <p className="mt-6 border-t border-line pt-5 text-sm text-ink-5">
          New to GRC Department?{" "}
          <Link href="/portal/signup" className="focus-ring rounded font-semibold text-accent hover:text-accent-dark">
            Create a client account
          </Link>
        </p>
      </div>
    </div>
  );
}
