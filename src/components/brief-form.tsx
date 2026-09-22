"use client";

import Link from "next/link";
import { useState } from "react";
import { apiPost, ApiError } from "@/lib/api";
import { getToken } from "@/lib/portal";
import { useClientSession } from "@/components/use-client-session";
import { ChoiceCards, Field, Submitted, inputClass, selectClass } from "@/components/form-bits";

const FRAMEWORKS = [
  "SOC 2 Type I / II",
  "ISO 27001 / 27701",
  "Privacy — GDPR, DPDPA, CCPA",
  "Third-party risk",
  "PCI DSS",
  "HIPAA / HITRUST",
  "AI governance — ISO 42001, NIST AI RMF",
  "Other / multiple",
];

const STAGES = [
  "Not started — no programme in place",
  "Gap assessment complete",
  "Mid-remediation",
  "Audit scheduled",
  "Maintaining an existing certification",
];

const SHAPES = ["Defined deliverable", "Ongoing support", "Advisory as needed", "Advise me"];
const REGIONS = ["Americas", "EMEA", "APAC"];

export function BriefForm() {
  const [framework, setFramework] = useState(FRAMEWORKS[0]);
  const [stage, setStage] = useState(STAGES[0]);
  const [shape, setShape] = useState(SHAPES[0]);
  const [region, setRegion] = useState(REGIONS[0]);
  const [hours, setHours] = useState(20);
  const [notes, setNotes] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const client = useClientSession();

  if (sent) {
    return (
      <Submitted
        title={`Brief received — ${sent}`}
        summary={`We have emailed a confirmation to ${client?.email ?? email}. A GRC lead will reply within one business day with a scoped proposal, or with the questions that decide it. Quote ${sent} if you write to us.`}
      >
        <Link
          href="/services"
          className="focus-ring rounded-lg bg-accent px-4 py-2.5 font-semibold text-white hover:bg-accent-dark"
        >
          Browse the catalogue
        </Link>
        <button
          type="button"
          onClick={() => setSent(null)}
          className="focus-ring rounded-lg border border-line-strong bg-surface px-4 py-2.5 font-semibold text-ink hover:bg-sunken"
        >
          Submit another brief
        </button>
        {client && (
          <Link
            href="/portal/dashboard?view=requests"
            className="focus-ring rounded-lg border border-line-strong bg-surface px-4 py-2.5 font-semibold text-ink hover:bg-sunken"
          >
            View in your portal
          </Link>
        )}
      </Submitted>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await apiPost<{ reference: string }>(
        "/gd/requests",
        {
        kind: "brief",
        contact_email: client?.email ?? email,
        contact_name: client?.name ?? name,
        // An open brief names no catalogue services by definition — that is the lead's job.
        service_codes: [],
        answers: {
          framework,
          current_position: stage,
          engagement_shape: shape,
          business_hours: region,
          hours_per_week: hours,
        },
        notes,
        },
        { token: client ? getToken() : null },
      );
      setSent(res.reference);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not reach the server. Please try again in a moment.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div className="order-2 space-y-7 lg:order-1">
        <Field label="Framework or obligation" htmlFor="framework">
          <select
            id="framework"
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            className={selectClass}
          >
            {FRAMEWORKS.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </Field>

        <Field label="Current position" htmlFor="stage">
          <select
            id="stage"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className={selectClass}
          >
            {STAGES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>

        <Field label="Engagement shape">
          <ChoiceCards name="shape" options={SHAPES} value={shape} onChange={setShape} />
        </Field>

        <Field
          label="Business hours"
          hint="Every engagement is staffed to give you at least four hours of overlap with these hours."
        >
          <ChoiceCards name="region" options={REGIONS} value={region} onChange={setRegion} />
        </Field>

        <Field label="Hours required per week" htmlFor="hours">
          <div className="flex items-center gap-4">
            <input
              id="hours"
              type="range"
              min={5}
              max={40}
              step={5}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="focus-ring h-2 flex-1 accent-[var(--gd-accent)]"
            />
            <span className="w-28 text-sm font-semibold text-ink">
              {hours === 40 ? "40 hrs — full time" : `${hours} hrs / week`}
            </span>
          </div>
        </Field>

        <Field label="Anything else the lead should know" htmlFor="notes">
          <textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputClass}
            placeholder="The obligation, the deadline, what has already been tried."
          />
        </Field>

        {client ? (
          <p className="rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink-3">
            Signed in as <span className="font-semibold text-ink">{client.name}</span> — the proposal goes to{" "}
            <span className="font-semibold text-ink">{client.email}</span> and this request will appear in your portal.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Your name" htmlFor="name">
              <input
                id="name"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Where should the proposal go" htmlFor="email">
              <input
                id="email"
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
        )}

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
          className="focus-ring rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {busy ? "Sending…" : "Submit brief"}
        </button>
      </div>

      <aside className="order-1 lg:order-2 lg:sticky lg:top-40 lg:self-start">
        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="font-bold text-ink">What happens next</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-4">
            <li>No obligation to engage — briefs are free to submit and confidential.</li>
            <li>Scope, duration and price are agreed in writing before anything starts.</li>
            <li>A two-week trial period applies once work commences.</li>
          </ul>
          <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-5">
            Know the work already? The{" "}
            <Link href="/services" className="focus-ring rounded text-accent hover:text-accent-dark">
              service catalogue
            </Link>{" "}
            lets you pick the exact services instead.
          </p>
        </div>
      </aside>
    </form>
  );
}
