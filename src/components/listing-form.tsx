"use client";

import Link from "next/link";
import { useState } from "react";
import { apiPost, ApiError } from "@/lib/api";
import { ChoiceCards, Field, Submitted, inputClass, selectClass } from "@/components/form-bits";

const REGIONS = ["Americas", "EMEA", "APAC"];
const AVAILABILITY = ["Full-time · 40 hrs/wk", "Part-time · 20 hrs/wk", "Project-based", "10 hrs/wk minimum"];

export function ListingForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState(REGIONS[2]);
  const [availability, setAvailability] = useState(AVAILABILITY[1]);
  const [workWindow, setWorkWindow] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <Submitted
        title="Interest registered"
        summary="A GRC lead will check your grcmentor.ai record and contact you when a review session is scheduled for your track. If you are already listed, you can sign in to the consultant portal now with your grcmentor account."
      >
        <Link
          href="/consultant-portal"
          className="focus-ring rounded-lg bg-accent px-4 py-2.5 font-semibold text-white hover:bg-accent-dark"
        >
          Consultant portal
        </Link>
      </Submitted>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiPost("/gd/requests", {
        kind: "listing",
        contact_email: email,
        contact_name: name,
        answers: { business_region: region, availability, working_window: workWindow },
        notes,
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the server. Please try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="l-name">
          <input id="l-name" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </Field>
        <Field label="grcmentor.ai account email" htmlFor="l-email" hint="The account your assessed work is recorded against.">
          <input
            id="l-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
          />
        </Field>
      </div>

      <Field label="Where you work from">
        <ChoiceCards name="l-region" options={REGIONS} value={region} onChange={setRegion} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Availability" htmlFor="l-avail">
          <select id="l-avail" value={availability} onChange={(e) => setAvailability(e.target.value)} className={selectClass}>
            {AVAILABILITY.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </Field>
        <Field label="Working window" htmlFor="l-window" hint="Your local hours, e.g. 10:00–19:00 IST.">
          <input id="l-window" value={workWindow} onChange={(e) => setWorkWindow(e.target.value)} className={inputClass} />
        </Field>
      </div>

      <Field label="Anything the lead should know" htmlFor="l-notes">
        <textarea id="l-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
      </Field>

      {error && (
        <p role="alert" className="rounded-lg border border-line-strong bg-sunken px-4 py-3 text-sm text-ink-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="focus-ring rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
      >
        {busy ? "Sending…" : "Submit application"}
      </button>
    </form>
  );
}
