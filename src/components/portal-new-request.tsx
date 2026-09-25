"use client";

import { useEffect, useMemo, useState } from "react";
import { BriefForm } from "./brief-form";
import { ScopingForm } from "./scoping-form";
import { getCatalogue, type Catalogue, type Category } from "@/lib/catalogue";

/**
 * Raising a request without leaving the portal.
 *
 * Both ways in used to live on the public site, so a signed-in client had to walk out of their own
 * portal — losing the shell, and landing on pages selling them something they had already bought
 * into — to ask for the next piece of work. The forms are the same components those pages use.
 *
 * The catalogue is browsable here, not only searchable: 320 services nobody has memorised are
 * useless behind a search box, which is why the public page leads with the sixteen categories.
 */

type Mode = "brief" | "services";

export function PortalNewRequest({ onSubmitted }: { onSubmitted: (reference: string) => void }) {
  const [mode, setMode] = useState<Mode>("brief");
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [openCategory, setOpenCategory] = useState<Category | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [scoping, setScoping] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setCatalogue(await getCatalogue());
      } catch {
        setFailed(true);
      }
    })();
  }, []);

  const services = useMemo(
    () => (catalogue?.categories ?? []).flatMap((c) => c.services.map((s) => ({ ...s, category: c.name }))),
    [catalogue],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return null;
    return services.filter((s) => s.name.toLowerCase().includes(q) || (s.blurb ?? "").toLowerCase().includes(q));
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
        <ScopingForm catalogue={catalogue} codes={picked} onSubmitted={onSubmitted} />
      </div>
    );
  }

  const row = (s: { code: string; name: string; blurb?: string; category?: string }) => (
    <li key={s.code} className="flex flex-wrap items-start gap-3 p-4">
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-snug text-ink">{s.name}</p>
        {s.blurb && <p className="mt-1 text-sm leading-relaxed text-ink-4">{s.blurb}</p>}
        {s.category && <p className="mt-1 text-xs text-ink-5">{s.category}</p>}
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
  );

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
        <BriefForm onSubmitted={onSubmitted} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_300px] *:min-w-0">
          <div className="rounded-xl border border-line bg-surface p-6">
            <h2 className="font-semibold text-ink">Which services do you want scoped?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-4">
              Browse a category or search. Pick as many as you need — several are scoped together as one
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
              placeholder={
                catalogue ? `Search all ${catalogue.service_count} services — “retention”, “supplier”…` : "Loading…"
              }
              disabled={!catalogue}
              className="focus-ring mt-4 w-full rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-faint"
            />

            {failed && (
              <p className="mt-4 text-sm text-ink-3">
                The catalogue could not be loaded. Describe what you need instead and we will scope it.
              </p>
            )}

            {results ? (
              <div className="mt-5">
                <p className="text-sm font-semibold text-ink">
                  {results.length} service{results.length === 1 ? "" : "s"} matching “{query.trim()}”
                </p>
                {results.length === 0 ? (
                  <p className="mt-3 text-sm text-ink-5">Try a broader term, or browse the categories.</p>
                ) : (
                  <ul className="mt-3 divide-y divide-line overflow-hidden rounded-lg border border-line">
                    {results.slice(0, 40).map(row)}
                  </ul>
                )}
              </div>
            ) : openCategory ? (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setOpenCategory(null)}
                  className="focus-ring rounded text-sm text-ink-5 hover:text-ink"
                >
                  ← All categories
                </button>
                <h3 className="mt-3 text-lg font-semibold text-ink">{openCategory.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-4">{openCategory.blurb}</p>
                <ul className="mt-4 divide-y divide-line overflow-hidden rounded-lg border border-line">
                  {openCategory.services.map(row)}
                </ul>
              </div>
            ) : (
              <ul className="mt-5 grid gap-3 sm:grid-cols-2 *:min-w-0">
                {(catalogue?.categories ?? []).map((c) => (
                  <li key={c.code}>
                    <button
                      type="button"
                      onClick={() => setOpenCategory(c)}
                      className="focus-ring h-full w-full rounded-xl border border-line bg-paper p-4 text-left transition-colors hover:border-accent hover:bg-accent-tint"
                    >
                      <span className="text-xs text-ink-5">{c.services.length} services</span>
                      <span className="mt-1 block font-semibold leading-snug text-ink">{c.name}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-ink-5">{c.blurb}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-xl border border-line bg-surface p-5">
              <h2 className="font-semibold text-ink">Your selection</h2>
              {picked.length === 0 ? (
                <p className="mt-3 text-sm leading-relaxed text-ink-5">
                  Nothing picked yet. Add services from any category and we will scope them together.
                </p>
              ) : (
                <>
                  <p className="mt-1 text-xs text-ink-5">
                    {picked.length} service{picked.length === 1 ? "" : "s"} selected
                  </p>
                  <ul className="mt-3 space-y-2">
                    {picked.map((code) => {
                      const s = services.find((x) => x.code === code);
                      return (
                        <li key={code} className="flex items-start gap-2 rounded-lg border border-line bg-paper p-2.5">
                          <span className="min-w-0 flex-1 text-sm leading-snug text-ink">{s?.name ?? code}</span>
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
                    className="focus-ring mt-4 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
                  >
                    Continue to scoping
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
