"use client";

import Link from "next/link";
import { useState } from "react";
import { apiPost, ApiError } from "@/lib/api";
import { getToken } from "@/lib/portal";
import { useClientSession } from "@/components/use-client-session";
import type { Catalogue } from "@/lib/catalogue";
import { ChoiceCards, Field, Submitted, inputClass, selectClass } from "@/components/form-bits";

const FRAMEWORKS = [
  "Not framework-specific",
  "SOC 2",
  "ISO 27001 / 27701",
  "GDPR / DPDPA / CCPA",
  "PCI DSS 4.0",
  "HIPAA / HITRUST",
  "ISO 42001 / EU AI Act",
  "NIST CSF / CIS Controls",
  "Customer or contractual requirement",
];

const TIMING = [
  "Urgent — within two weeks",
  "Within the month",
  "Within the quarter",
  "No fixed date",
];

const REGIONS = ["Americas", "EMEA", "APAC"];

export function ScopingForm({ catalogue, codes }: { catalogue: Catalogue; codes: string[] }) {
  const selected = codes
    .map((code) => {
      for (const c of catalogue.categories) {
        const svc = c.services.find((s) => s.code === code);
        if (svc) return { ...svc, category: c };
      }
      return null;
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  // The boundary question is per category, and a bundle can span several. The first selected
  // service's category owns it — asking the question once per category would turn a six-question
  // form into fourteen, and the lead re-scopes a mixed bundle in the proposal anyway.
  const primary = selected[0]?.category ?? null;

  const [scope, setScope] = useState("");
  const [framework, setFramework] = useState(FRAMEWORKS[0]);
  const [timing, setTiming] = useState(TIMING[2]);
  const [region, setRegion] = useState(REGIONS[0]);
  const [existing, setExisting] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const client = useClientSession();

  if (selected.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface p-8">
        <h2 className="text-lg font-bold text-ink">No services selected</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-4">
          Pick one or more services from the catalogue and we will scope them as one engagement.
        </p>
        <Link
          href="/services"
          className="focus-ring mt-5 inline-block rounded-lg bg-accent px-4 py-2.5 font-semibold text-white hover:bg-accent-dark"
        >
          Browse the catalogue
        </Link>
      </div>
    );
  }

  if (sent) {
    return (
      <Submitted
        title={`Scoping request received — ${sent}`}
        summary={`${selected.length} service${selected.length === 1 ? "" : "s"} for ${region} business hours. We have emailed a confirmation to ${
          client?.email ?? email
        }. A GRC lead will return a written proposal — deliverable, duration, price and acceptance criteria — within one business day.`}
      >
        <Link
          href="/services"
          className="focus-ring rounded-lg bg-accent px-4 py-2.5 font-semibold text-white hover:bg-accent-dark"
        >
          Scope more services
        </Link>
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
        kind: "scoping",
        contact_email: client?.email ?? email,
        contact_name: client?.name ?? name,
        service_codes: codes,
        answers: {
          boundary_question: primary?.scope_question ?? null,
          boundary: scope,
          framework,
          timing,
          business_hours: region,
          existing_material: existing,
        },
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
        {primary && (
          <Field label={primary.scope_question} hint={`Priced per ${primary.unit}.`}>
            <ChoiceCards
              name="boundary"
              options={primary.scope_options}
              value={scope}
              onChange={setScope}
            />
          </Field>
        )}

        <Field label="Framework or obligation driving this" htmlFor="framework">
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

        <Field label="When is it needed" htmlFor="timing">
          <select
            id="timing"
            value={timing}
            onChange={(e) => setTiming(e.target.value)}
            className={selectClass}
          >
            {TIMING.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>

        <Field
          label="Your business hours"
          hint="Every engagement is staffed to give you at least four hours of overlap with these hours."
        >
          <ChoiceCards name="region" options={REGIONS} value={region} onChange={setRegion} />
        </Field>

        <Field
          label="Existing material we should build on"
          htmlFor="existing"
          hint="Optional. A prior gap assessment, a draft policy set, an auditor's findings list."
        >
          <textarea
            id="existing"
            rows={3}
            value={existing}
            onChange={(e) => setExisting(e.target.value)}
            className={inputClass}
            placeholder="Anything already in place that we should start from."
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

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={busy}
            className="focus-ring rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
          >
            {busy ? "Sending…" : "Request proposal"}
          </button>
          <Link href="/services" className="focus-ring rounded text-sm text-ink-5 hover:text-ink">
            ← Back to catalogue
          </Link>
        </div>
      </div>

      <aside className="order-1 lg:order-2 lg:sticky lg:top-40 lg:self-start">
        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="font-bold text-ink">Services being scoped</h2>
          <ul className="mt-4 space-y-3">
            {selected.map((s) => (
              <li key={s.code} className="border-l-2 border-accent pl-3">
                <p className="text-sm font-medium leading-snug text-ink">{s.name}</p>
                <p className="mt-0.5 text-xs text-ink-5">{s.category.name}</p>
              </li>
            ))}
          </ul>
          {selected.length > 1 && (
            <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-5">
              Bundled services are scoped as a single engagement under one statement of work.
            </p>
          )}
        </div>
      </aside>
    </form>
  );
}
