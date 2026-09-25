"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard, Notice } from "@/components/auth-card";
import { Field, inputClass } from "@/components/form-bits";
import { ApiError } from "@/lib/api";
import { acceptInvite, PASSWORD_RULE, passwordProblem } from "@/lib/portal";

/**
 * Where a colleague's invitation lands.
 *
 * They are not asked for their email or their company: both are inside the signed invitation, and
 * asking would invite a typo that puts them in the wrong organisation — or let them choose one.
 * Opening the link proves they hold the address, so the account is confirmed without a second
 * email.
 */
function Join() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(token ? null : "This invitation link is incomplete.");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const weak = passwordProblem(password);
    if (weak) return setError(weak);
    setBusy(true);
    setError(null);
    try {
      await acceptInvite({ token, name, job_title: jobTitle || undefined, password });
      router.replace("/portal/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the server. Try again in a moment.");
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Join your colleagues"
      intro="You have been invited to an organisation on GRC Department. Choose how you sign in and you are in."
    >
      {error && <Notice tone="error">{error}</Notice>}
      <form onSubmit={submit} className="mt-5 space-y-4">
        <Field label="Your name" htmlFor="jn-name">
          <input id="jn-name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Job title (optional)" htmlFor="jn-title">
          <input id="jn-title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Password" htmlFor="jn-password" hint={PASSWORD_RULE}>
          <input
            id="jn-password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </Field>
        <button
          type="submit"
          disabled={busy || !token}
          className="focus-ring w-full rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {busy ? "Joining…" : "Join"}
        </button>
      </form>
      <p className="mt-6 border-t border-line pt-4 text-sm text-ink-5">
        Already have an account?{" "}
        <Link href="/portal" className="focus-ring rounded font-semibold text-accent hover:text-accent-dark">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={null}>
      <Join />
    </Suspense>
  );
}
