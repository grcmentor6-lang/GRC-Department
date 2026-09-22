"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard, Notice } from "@/components/auth-card";
import { Field, inputClass } from "@/components/form-bits";
import { ApiError } from "@/lib/api";
import { PASSWORD_RULE, passwordProblem, resetPassword } from "@/lib/portal";

/** Where the reset email's link lands: choose a new password, then straight into the dashboard. */
function Reset() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(token ? null : "This reset link is incomplete.");
  const [dead, setDead] = useState(!token);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    const weak = passwordProblem(password);
    if (weak) return setError(weak);
    if (password !== confirm) return setError("The two passwords do not match.");
    setBusy(true);
    try {
      await resetPassword(token, password);
      router.replace("/portal/dashboard");
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) setDead(true);
      setError(err instanceof ApiError ? err.message : "Could not reach the server. Please try again in a moment.");
      setBusy(false);
    }
  }

  if (dead) {
    return (
      <AuthCard title="This link did not work">
        <Notice tone="error">{error}</Notice>
        <Link
          href="/portal/forgot"
          className="focus-ring mt-5 block rounded-lg bg-accent px-5 py-3 text-center font-semibold text-white hover:bg-accent-dark"
        >
          Request a new reset link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password">
      <form onSubmit={submit} className="space-y-5">
        <Field label="New password" htmlFor="r-password" hint={PASSWORD_RULE}>
          <input
            id="r-password"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Confirm new password" htmlFor="r-confirm">
          <input
            id="r-confirm"
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
          />
        </Field>
        {error && <Notice tone="error">{error}</Notice>}
        <button
          type="submit"
          disabled={busy}
          className="focus-ring w-full rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save new password"}
        </button>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <Reset />
    </Suspense>
  );
}
