"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { login, type Contact } from "@/lib/portal";
import { Field, inputClass } from "@/components/form-bits";

/**
 * The mockup offers Slack and Teams sign-in. Neither is built — channel provisioning is the
 * last phase — and a button that looks like it works but does not is worse than one that is
 * honest about it, so they are shown as what they are: not yet available.
 */
export function PortalSignIn({ onSignedIn }: { onSignedIn: (c: Contact) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      onSignedIn(await login(email, password));
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "Those credentials were not recognised."
          : "Could not reach the server. Please try again in a moment.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-line bg-surface p-7">
        <h1 className="text-xl font-bold text-ink">Client portal</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-4">
          Your engagements, deliverables and consultants in one place.
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
          <Field label="Password" htmlFor="password">
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </Field>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-line-strong bg-sunken px-4 py-3 text-sm text-ink-2"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="focus-ring w-full rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 border-t border-line pt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-5">
            Workspace sign-in
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-5">
            Slack and Microsoft Teams sign-in, and the per-engagement channels that come with it,
            are not built yet. When they are, connecting a workspace will create your account and
            provision the channels in one step.
          </p>
        </div>
      </div>
    </div>
  );
}
