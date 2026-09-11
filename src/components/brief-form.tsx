"use client";

import Link from "next/link";
import { useState } from "react";
import { apiPost, ApiError } from "@/lib/api";
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <Submitted
        title="Brief received"
        summary={`${framework}, ${region} business hours, around ${hours} hours a week. A GRC lead will respond within one business day with a shortlist. In the meantime you can review matching consultants in the directory.`}
      >
        <Link
          href="/talent"
          className="focus-ring rounded-lg bg-accent px-4 py-2.5 font-semibold text-white hover:bg-accent-dark"
        >
          View matching consultants
        </Link>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="focus-ring rounded-lg border border-line-strong bg-surface px-4 py-2.5 font-semibold text-ink hover:bg-sunken"
        >
          Submit another brief
        </button>
      </Submitted>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiPost("/gd/requests", {
        kind: "brief",
        contact_email: email,
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
      });
      setSent(true);
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
          hint="Shortlists exclude consultants who cannot hold four hours of overlap with this."
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

        <Field label="Where should the shortlist go" htmlFor="email">
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@company.com"
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
            <li>Interviews are scheduled directly with the consultant.</li>
            <li>A two-week trial period applies once work commences.</li>
          </ul>
          <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-5">
            Know the work already? The{" "}
            <Link href="/services" className="focus-ring rounded text-accent hover:text-accent-dark">
              service catalogue
            </Link>{" "}
            gets you a priced proposal instead of a shortlist.
          </p>
        </div>
      </aside>
    </form>
  );
}
