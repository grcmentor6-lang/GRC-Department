"use client";

import { useState } from "react";
import Link from "next/link";
import { DEPT_API_URL } from "@/lib/api";
import { ChoiceCards, Field, inputClass, selectClass } from "@/components/form-bits";

/**
 * Sign-up, in two steps, ending in the client's own Slack.
 *
 * This is the only part of GRC Department a client reaches in a browser. Everything afterwards
 * — onboarding, the GRC map, the proposal, the weekly plan, incidents — happens inside their
 * own Slack or Teams, so the one job here is to hand over cleanly and get out of the way.
 *
 * Two steps rather than one because step two is not a form: it is a plain statement of what is
 * about to be created inside their workspace, shown *before* they approve it. An install that
 * creates three channels a client did not expect is the kind of surprise an IT lead remembers.
 */

const COUNTRIES = [
  "United Kingdom",
  "India",
  "United States",
  "Singapore",
  "United Arab Emirates",
];

const BANDS = ["1-50", "51-200", "201-1000", "1001-5000", "5000+"];
const PLATFORMS = ["Slack", "Microsoft Teams"];

const OTHER_COUNTRY = "My country isn’t listed";

type Created = { id: string; status: string; install_url: string | null };

const CHANNELS = [
  ["#grc", "Your weekly plan, actions, evidence and the Friday digest. Everyone who works with us."],
  ["#grc-leadership", "Your GRC map, board packs, maturity and risk reviews. Your sponsor and executives."],
  ["#grc-incidents", "Incident clocks only, so a deadline is never buried under everything else."],
];

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [orgName, setOrgName] = useState("");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [band, setBand] = useState(BANDS[1]);
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [partnerCode, setPartnerCode] = useState("");
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Created | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`${DEPT_API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        // The backend wakes from sleep on a free plan, which can take most of a minute.
        signal: AbortSignal.timeout(60_000),
        body: JSON.stringify({
          email: email.trim(),
          full_name: fullName.trim(),
          job_title: jobTitle.trim(),
          org_name: orgName.trim(),
          country,
          employees_band: band,
          platform: platform === "Slack" ? "slack" : "teams",
          partner_code: partnerCode.trim() || null,
          terms_agreed: terms,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          typeof body?.detail === "string" ? body.detail : "We could not record that. Please try again.",
        );
      }
      setCreated((await res.json()) as Created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (created?.status === "waitlist") {
    return (
      <Panel title="You’re on the list.">
        <p>
          We’re not live in {country} yet. GRC Department is people in your own country working
          your own hours, so starting somewhere we cannot staff properly would be a promise
          broken on day one.
        </p>
        <p>
          We’ll write to {email} the moment that changes — you don’t need to do anything else.
        </p>
      </Panel>
    );
  }

  if (created?.status === "teams_not_ready") {
    return (
      <Panel title="Teams is not open yet.">
        <p>
          Your details are saved. The Microsoft Teams version is built but not yet released, and
          we’ll write to {email} as soon as it is.
        </p>
        <p>
          If you’d rather not wait, Slack is available today — come back and choose it, and
          you’ll be running within the hour.
        </p>
      </Panel>
    );
  }

  if (created?.install_url) {
    // Empty during the server render; the button is only ever pressed in a browser.
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    return (
      <Panel title="One step left: add it to your Slack.">
        <p>
          Approving this creates three private channels in your workspace. Nothing else is
          added, and nobody outside the people you invite can see them.
        </p>
        <ul className="mt-6 space-y-4">
          {CHANNELS.map(([name, what]) => (
            <li key={name} className="border-l-2 border-accent/40 pl-4">
              <p className="font-mono text-sm font-semibold text-ink">{name}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-4">{what}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-ink-4">
          Not a Slack admin? Install anyway — Slack sends your administrator a request to
          approve, and we’ll pick it up from there.
        </p>
        {/* Where to come back to. The backend checks it against its own allowlist and then
            carries it inside the signed OAuth state, so this is a convenience rather than
            something to trust — but it is what lets staging and production share one backend
            without a variable deciding which site is real. */}
        <a
          href={`${DEPT_API_URL}${created.install_url}&return_to=${encodeURIComponent(origin)}`}
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-base font-semibold text-white transition hover:opacity-90"
        >
          Add to Slack
        </a>
        <p className="mt-4 text-xs text-ink-4">
          You’ll come straight back here afterwards, and your welcome message will be waiting in
          Slack.
        </p>
      </Panel>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-2xl">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Work email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@company.com"
            autoComplete="email"
          />
        </Field>
        <Field label="Full name">
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            autoComplete="name"
          />
        </Field>
        <Field label="Job title">
          <input
            required
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className={inputClass}
            placeholder="Head of IT"
            autoComplete="organization-title"
          />
        </Field>
        <Field label="Organisation">
          <input
            required
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className={inputClass}
            autoComplete="organization"
          />
        </Field>
        <Field
          label="Country"
          hint="Where your organisation is based. Your team works your hours, so this decides who you get."
        >
          <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectClass}>
            {COUNTRIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
            <option>{OTHER_COUNTRY}</option>
          </select>
        </Field>
        <Field label="Employees">
          <select value={band} onChange={(e) => setBand(e.target.value)} className={selectClass}>
            {BANDS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-6">
        <Field label="Where your team works">
          <ChoiceCards options={PLATFORMS} value={platform} onChange={setPlatform} name="platform" />
        </Field>
      </div>

      <div className="mt-6 max-w-sm">
        <Field label="Partner code" hint="Optional. If a partner sent you here, it will be filled in already.">
          <input
            value={partnerCode}
            onChange={(e) => setPartnerCode(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <label className="mt-8 flex items-start gap-3 text-sm leading-relaxed text-ink-4">
        <input
          type="checkbox"
          required
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-accent"
        />
        <span>
          I agree to the <Link href="/terms" className="text-accent underline">terms of use</Link> and
          the <Link href="/privacy" className="text-accent underline">privacy notice</Link>.
        </span>
      </label>

      {error && (
        <p role="alert" className="mt-6 rounded-lg border border-line-strong bg-sunken px-4 py-3 text-sm text-ink-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-8 inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-base font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {busy ? "One moment…" : "Continue"}
      </button>
      <p className="mt-3 text-xs text-ink-4">
        Nothing is installed yet. The next screen shows exactly what we create in your workspace.
      </p>
    </form>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-2xl rounded-xl border border-line bg-white p-8">
      <h2 className="text-xl font-semibold tracking-[-0.01em] text-ink">{title}</h2>
      <div className="mt-4 space-y-4 leading-relaxed text-ink-4">{children}</div>
    </div>
  );
}
