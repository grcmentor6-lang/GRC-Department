"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthCard, Notice } from "@/components/auth-card";
import { Field, inputClass } from "@/components/form-bits";
import { ApiError } from "@/lib/api";
import { forgotPassword } from "@/lib/portal";

/** Ask for a reset link. The answer is the same whether or not the address has an account. */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 429
          ? "Too many attempts. Wait a minute and try again."
          : "Could not reach the server. Please try again in a moment.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard title="Reset your password" intro="Enter the email address on your client account and we will send you a link to choose a new password.">
      {sent ? (
        <Notice>
          If <span className="font-semibold text-ink">{email}</span> has a client account, a reset link is on its way. It
          expires in 1 hour and works once.
        </Notice>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <Field label="Email" htmlFor="f-email">
            <input
              id="f-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@company.com"
            />
          </Field>
          {error && <Notice tone="error">{error}</Notice>}
          <button
            type="submit"
            disabled={busy}
            className="focus-ring w-full rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
      <p className="mt-6 border-t border-line pt-4 text-sm text-ink-5">
        Remembered it?{" "}
        <Link href="/portal" className="focus-ring rounded font-semibold text-accent hover:text-accent-dark">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
