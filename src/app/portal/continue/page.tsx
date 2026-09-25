"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard, Notice } from "@/components/auth-card";
import { ApiError } from "@/lib/api";
import { sessionFromHandoff } from "@/lib/portal";

/**
 * Where Slack sends somebody back after they sign up with it.
 *
 * The account already exists by the time this page loads — it was made in the callback, from the
 * address Slack verified. All that is left is to trade the one-time token in the URL for a
 * session, which is the same shape as confirming an email, and for the same reason: a session
 * token in a redirect URL would live on in browser history.
 */
function Continue() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [failed, setFailed] = useState<string | null>(token ? null : "That sign-in link is incomplete.");
  const started = useRef(false);

  useEffect(() => {
    // Once only: StrictMode runs effects twice in development and the token is spent on first use.
    if (!token || started.current) return;
    started.current = true;
    (async () => {
      try {
        await sessionFromHandoff(token);
        router.replace("/portal/dashboard?view=connections&chat=slack&status=connected");
      } catch (err) {
        setFailed(err instanceof ApiError ? err.message : "Could not reach the server. Try again in a moment.");
      }
    })();
  }, [token, router]);

  if (!failed) {
    return (
      <AuthCard title="Setting up your account…">
        <p className="text-sm text-ink-4">One moment — we are opening your channel in Slack.</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="That did not work">
      <Notice tone="error">{failed}</Notice>
      <p className="mt-4 text-sm leading-relaxed text-ink-4">
        Your account may still have been created. Try signing in with Slack again, or use the email form.
      </p>
      <Link
        href="/portal"
        className="focus-ring mt-5 block rounded-lg bg-accent px-5 py-3 text-center font-semibold text-white hover:bg-accent-dark"
      >
        Back to sign in
      </Link>
    </AuthCard>
  );
}

export default function ContinuePage() {
  return (
    <Suspense fallback={null}>
      <Continue />
    </Suspense>
  );
}
