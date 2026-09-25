"use client";

import Link from "next/link";
import { useState } from "react";
import { SignUpWith } from "@/components/signup-with";
import { AuthCard, Notice } from "@/components/auth-card";
import { ChoiceCards, Field, inputClass } from "@/components/form-bits";
import { ApiError } from "@/lib/api";
import { PASSWORD_RULE, passwordProblem, resendVerification, signup } from "@/lib/portal";

const REGIONS = ["Americas", "EMEA", "APAC"] as const;

/**
 * Client sign-up. Creates an organisation and its first contact; the account cannot sign in until
 * the email address is confirmed from the link we send. The server answers identically whether or
 * not the address already has an account, so this page always ends on "check your inbox".
 */
export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("APAC");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const weak = passwordProblem(password);
    if (weak) return setError(weak);
    if (password !== confirm) return setError("The two passwords do not match.");
    setBusy(true);
    try {
      const res = await signup({
        name,
        email,
        password,
        company,
        job_title: jobTitle || undefined,
        business_region: region,
      });
      setSentTo(res.email);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 429
          ? "Too many attempts. Wait a minute and try again."
          : err instanceof ApiError
            ? err.message
            : "Could not reach the server. Please try again in a moment.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (!sentTo) return;
    try {
      await resendVerification(sentTo);
      setResent(true);
    } catch {
      setError("Could not resend just now. Please try again in a minute.");
    }
  }

  if (sentTo) {
    return (
      <AuthCard title="Check your inbox">
        <Notice>
          We have sent a confirmation link to <span className="font-semibold text-ink">{sentTo}</span>. Open it to
          confirm your email address and sign in. The link expires in 48 hours.
        </Notice>
        <p className="mt-4 text-sm leading-relaxed text-ink-4">
          Nothing arrived? Check your spam folder, or{" "}
          <button type="button" onClick={resend} className="focus-ring rounded font-semibold text-accent hover:text-accent-dark">
            send the link again
          </button>
          .
        </p>
        {resent && <p className="mt-2 text-sm text-positive">Sent again.</p>}
        {error && <p role="alert" className="mt-2 text-sm text-ink-2">{error}</p>}
        <p className="mt-6 border-t border-line pt-4 text-sm text-ink-5">
          Wrong address?{" "}
          <button
            type="button"
            onClick={() => {
              setSentTo(null);
              setResent(false);
            }}
            className="focus-ring rounded font-semibold text-accent hover:text-accent-dark"
          >
            Start again
          </button>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      wide
      title="Create a client account"
      intro="Track your requests and engagements, accept deliverables and approve timesheets in one place. Free, and no obligation to engage."
    >
      <form onSubmit={submit} className="space-y-5" noValidate={false}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" htmlFor="su-name">
            <input id="su-name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Work email" htmlFor="su-email">
            <input
              id="su-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@company.com"
            />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Company" htmlFor="su-company">
            <input
              id="su-company"
              required
              autoComplete="organization"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Job title (optional)" htmlFor="su-title">
            <input
              id="su-title"
              autoComplete="organization-title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Your business hours" hint="We staff every engagement to give you at least four hours of overlap with these.">
          <ChoiceCards name="su-region" options={[...REGIONS]} value={region} onChange={(v) => setRegion(v as (typeof REGIONS)[number])} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Password" htmlFor="su-password" hint={PASSWORD_RULE}>
            <input
              id="su-password"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Confirm password" htmlFor="su-confirm">
            <input
              id="su-confirm"
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        {error && <Notice tone="error">{error}</Notice>}

        <button
          type="submit"
          disabled={busy}
          className="focus-ring w-full rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {busy ? "Creating your account…" : "Create account"}
        </button>
      </form>

      <SignUpWith />

      <p className="mt-6 border-t border-line pt-4 text-sm text-ink-5">
        Already have an account?{" "}
        <Link href="/portal" className="focus-ring rounded font-semibold text-accent hover:text-accent-dark">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
