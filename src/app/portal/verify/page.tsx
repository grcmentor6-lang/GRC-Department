"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard, Notice } from "@/components/auth-card";
import { Field, inputClass } from "@/components/form-bits";
import { ApiError } from "@/lib/api";
import { resendVerification, verifyEmail } from "@/lib/portal";

/**
 * Where the confirmation email's link lands. Confirming signs the contact in and moves them to the
 * dashboard; a dead link offers to send a new one.
 */
function Verify() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [failed, setFailed] = useState<string | null>(token ? null : "This confirmation link is incomplete.");
  const [email, setEmail] = useState("");
  const [resent, setResent] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    // Once only: StrictMode runs effects twice in development, and the second call would race the first.
    if (!token || started.current) return;
    started.current = true;
    (async () => {
      try {
        await verifyEmail(token);
        router.replace("/portal/dashboard");
      } catch (err) {
        setFailed(err instanceof ApiError ? err.message : "Could not reach the server. Please try again in a moment.");
      }
    })();
  }, [token, router]);

  async function resend(e: React.FormEvent) {
    e.preventDefault();
    await resendVerification(email).catch(() => undefined);
    setResent(true);
  }

  if (!failed) {
    return (
      <AuthCard title="Confirming your email…">
        <p className="text-sm text-ink-4">One moment — signing you in.</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="This link did not work">
      <Notice tone="error">{failed}</Notice>
      {resent ? (
        <Notice>If that address has an account waiting for confirmation, a new link is on its way.</Notice>
      ) : (
        <form onSubmit={resend} className="mt-5 space-y-4">
          <Field label="Send a new link to" htmlFor="v-email">
            <input
              id="v-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@company.com"
            />
          </Field>
          <button type="submit" className="focus-ring w-full rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-dark">
            Send a new confirmation link
          </button>
        </form>
      )}
      <p className="mt-6 border-t border-line pt-4 text-sm text-ink-5">
        Already confirmed?{" "}
        <Link href="/portal" className="focus-ring rounded font-semibold text-accent hover:text-accent-dark">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <Verify />
    </Suspense>
  );
}
