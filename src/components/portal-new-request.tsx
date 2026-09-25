"use client";

import { useEffect, useMemo, useState } from "react";
import { BriefForm } from "./brief-form";
import { ScopingForm } from "./scoping-form";
import { getCatalogue, type Catalogue } from "@/lib/catalogue";

/**
 * Raising a request without leaving the portal.
 *
 * Both ways in were on the public site, so a signed-in client had to walk out of their own portal
 * — losing the shell, and landing on pages selling them something they had already bought into —
 * to ask for the next piece of work. The forms themselves are the same components the public
 * pages use; only where they are mounted has changed.
 */

type Mode = "brief" | "services";

export function PortalNewRequest() {
  const [mode, setMode] = useState<Mode>("brief");
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [scoping, setScoping] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setCatalogue(await getCatalogue());
      } catch {
        setCatalogue(null);
      }
    })();
  }, []);

  const services = useMemo(() => {
    if (!catalogue) return [];
    return catalogue.categories.flatMap((c) => c.services.map((s) => ({ ...s, category: c.name })));
  }, [catalogue]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return services
      .filter((s) => s.name.toLowerCase().includes(q) || (s.blurb ?? "").toLowerCase().includes(q))
      .slice(0, 12);
  }, [query, services]);

  const toggle = (code: string) =>
    setPicked((p) => (p.includes(code) ? p.filter((c) => c !== code) : [...p, code]));

  if (scoping && catalogue) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setScoping(false)}
          className="focus-ring mb-4 rounded text-sm text-ink-5 hover:text-ink"
        >
          ← Change the services
        </button>
        <ScopingForm catalogue={catalogue} codes={picked} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-lg border border-line bg-surface p-1" role="group" aria-label="Kind of request">
        {(
          [
            ["brief", "Describe what you need"],
            ["services", "Pick services"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            aria-pressed={mode === key}
            className={`focus-ring rounded-md px-4 py-1.5 text-sm font-semibold ${
              mode === key ? "bg-accent text-white" : "text-ink-4 hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "brief" ? (
        <BriefForm />
      ) : (
        <div className="rounded-xl border border-line bg-surface p-6">
          <h2 className="font-semibold text-ink">Which services do you want scoped?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-4">
            Search the catalogue and pick as many as you need. Several are scoped together as one
            engagement under a single statement of work.
          </p>

          <label htmlFor="nr-search" className="sr-only">
            Search services
          </label>
          <input
            id="nr-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={catalogue ? `Search ${catalogue.service_count} services — “retention”, “supplier”…` : "Loading the catalogue…"}
            disabled={!catalogue}
            className="focus-ring mt-4 w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-faint"
          />

          {results.length > 0 && (
            <ul className="mt-4 divide-y divide-line overflow-hidden rounded-lg border border-line">
              {results.map((s) => (
                <li key={s.code} className="flex flex-wrap items-start gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{s.name}</p>
                    {s.blurb && <p className="mt-0.5 text-sm text-ink-4">{s.blurb}</p>}
                    <p className="mt-0.5 text-xs text-ink-5">{s.category}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggle(s.code)}
                    className={`focus-ring rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                      picked.includes(s.code)
                        ? "border-positive-line bg-positive-tint text-positive"
                        : "border-line-strong bg-surface text-ink hover:bg-sunken"
                    }`}
                  >
                    {picked.includes(s.code) ? "✓ Added" : "Add"}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {picked.length > 0 && (
            <div className="mt-5 rounded-lg border border-line bg-paper p-4">
              <p className="text-sm font-medium text-ink">
                {picked.length} service{picked.length === 1 ? "" : "s"} selected
              </p>
              <ul className="mt-2 space-y-1">
                {picked.map((code) => {
                  const s = services.find((x) => x.code === code);
                  return (
                    <li key={code} className="flex items-center justify-between gap-3 text-sm text-ink-3">
                      <span className="min-w-0">{s?.name ?? code}</span>
                      <button
                        type="button"
                        onClick={() => toggle(code)}
                        aria-label={`Remove ${s?.name ?? code}`}
                        className="focus-ring rounded px-1 text-ink-5 hover:text-ink"
                      >
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                onClick={() => setScoping(true)}
                className="focus-ring mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
              >
                Continue to scoping
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
