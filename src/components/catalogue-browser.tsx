"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Catalogue, Category } from "@/lib/catalogue";

/**
 * Browse 320 services, bundle any of them, hand the selection to scoping.
 *
 * The bundle lives in component state and is handed over as `?codes=` on the link to /scoping,
 * rather than in a store or localStorage. It survives the one navigation that matters, the URL
 * is shareable, and /scoping can server-render from it. ponytail: if a half-built bundle needs
 * to survive a reload or a return visit, localStorage is the next step — not a store.
 */
export function CatalogueBrowser({ catalogue }: { catalogue: Catalogue }) {
  const { categories, service_count } = catalogue;
  const router = useRouter();
  const params = useSearchParams();

  const activeCode = params.get("cat");
  const active = categories.find((c) => c.code === activeCode) ?? null;

  const [query, setQuery] = useState("");
  const [bundle, setBundle] = useState<string[]>([]);

  const byCode = useMemo(
    () =>
      new Map(
        categories.flatMap((c) => c.services.map((s) => [s.code, { ...s, category: c }] as const)),
      ),
    [categories],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return null;
    return [...byCode.values()].filter(
      (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q),
    );
  }, [query, byCode]);

  const toggle = (code: string) =>
    setBundle((b) => (b.includes(code) ? b.filter((c) => c !== code) : [...b, code]));

  const scopingHref = (codes: string[]) => `/scoping?codes=${codes.join(",")}`;

  const setCategory = (code: string | null) =>
    router.push(code ? `/services?cat=${code}` : "/services", { scroll: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        Service catalogue
      </p>
      <h1 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-[-0.02em] text-ink sm:text-4xl">
        Engage one service, or bundle several into a single statement of work.
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-ink-4">
        Every item below is a discrete, scoped unit of GRC work delivered remotely by a vetted
        consultant. Request a proposal for a single service, or combine services across
        categories and we will scope the bundle as one engagement.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-5">
        <span className="font-semibold text-ink">{service_count} services</span>
        <span aria-hidden>·</span>
        <span>{categories.length} categories</span>
      </div>

      <div className="mt-6">
        <label htmlFor="svc-search" className="sr-only">
          Search the catalogue
        </label>
        <input
          id="svc-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search all 320 services — “retention”, “supplier”, “continuity”…"
          className="focus-ring w-full rounded-lg border border-line-strong bg-surface px-4 py-3 text-sm text-ink placeholder:text-faint"
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          {results ? (
            <ResultList
              heading={`${results.length} service${results.length === 1 ? "" : "s"} matching “${query.trim()}”`}
              onClear={() => setQuery("")}
              rows={results.map((s) => ({
                code: s.code,
                name: s.name,
                meta: s.category.name,
              }))}
              bundle={bundle}
              onToggle={toggle}
              scopingHref={scopingHref}
            />
          ) : active ? (
            <CategoryPanel
              category={active}
              bundle={bundle}
              onToggle={toggle}
              onBack={() => setCategory(null)}
              scopingHref={scopingHref}
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {categories.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => setCategory(c.code)}
                    className="focus-ring h-full w-full rounded-xl border border-line bg-surface p-5 text-left transition-colors hover:border-accent hover:bg-accent-tint"
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-ink px-1.5 py-0.5 font-mono text-[11px] font-semibold text-white">
                        {c.code}
                      </span>
                      <span className="text-xs text-ink-5">{c.services.length} services</span>
                    </div>
                    <h2 className="mt-3 font-bold leading-snug text-ink">{c.name}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink-5">{c.blurb}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="lg:sticky lg:top-40 lg:self-start">
          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="font-bold text-ink">Your bundle</h2>
            {bundle.length === 0 ? (
              <p className="mt-3 text-sm leading-relaxed text-ink-5">
                No services selected yet. Add services from any category to scope them as one
                engagement, or request a proposal on a single service directly.
              </p>
            ) : (
              <>
                <p className="mt-1 text-xs text-ink-5">
                  {bundle.length} service{bundle.length === 1 ? "" : "s"} selected
                </p>
                <ul className="mt-4 space-y-2">
                  {bundle.map((code) => {
                    const s = byCode.get(code);
                    if (!s) return null;
                    return (
                      <li
                        key={code}
                        className="flex items-start gap-2 rounded-lg border border-line bg-paper p-2.5"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-snug text-ink">{s.name}</p>
                          <p className="mt-0.5 text-xs text-ink-5">{s.category.name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggle(code)}
                          aria-label={`Remove ${s.name} from bundle`}
                          className="focus-ring rounded px-1 text-ink-5 hover:text-ink"
                        >
                          ×
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <Link
                  href={scopingHref(bundle)}
                  className="focus-ring mt-5 block rounded-lg bg-accent px-4 py-2.5 text-center font-semibold text-white hover:bg-accent-dark"
                >
                  Request proposal
                </Link>
                <button
                  type="button"
                  onClick={() => setBundle([])}
                  className="focus-ring mt-2 w-full rounded-lg px-4 py-2 text-sm text-ink-5 hover:text-ink"
                >
                  Clear bundle
                </button>
              </>
            )}
            <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-5">
              Bundled services are delivered by one consultant where competencies allow, or a
              matched pair under a single point of contact.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CategoryPanel({
  category,
  bundle,
  onToggle,
  onBack,
  scopingHref,
}: {
  category: Category;
  bundle: string[];
  onToggle: (code: string) => void;
  onBack: () => void;
  scopingHref: (codes: string[]) => string;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="focus-ring rounded text-sm text-ink-5 hover:text-ink"
      >
        ← All categories
      </button>

      <div className="mt-4 flex items-center gap-2">
        <span className="rounded bg-ink px-1.5 py-0.5 font-mono text-[11px] font-semibold text-white">
          {category.code}
        </span>
        <span className="text-xs text-ink-5">{category.services.length} services</span>
      </div>
      <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.02em] text-ink">{category.name}</h2>
      <p className="mt-2 max-w-2xl leading-relaxed text-ink-4">{category.blurb}</p>

      <ResultList
        className="mt-6"
        rows={category.services.map((s) => ({ code: s.code, name: s.name }))}
        bundle={bundle}
        onToggle={onToggle}
        scopingHref={scopingHref}
      />
    </div>
  );
}

function ResultList({
  heading,
  onClear,
  rows,
  bundle,
  onToggle,
  scopingHref,
  className = "",
}: {
  heading?: string;
  onClear?: () => void;
  rows: { code: string; name: string; meta?: string }[];
  bundle: string[];
  onToggle: (code: string) => void;
  scopingHref: (codes: string[]) => string;
  className?: string;
}) {
  return (
    <div className={className}>
      {heading && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold text-ink">{heading}</p>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="focus-ring rounded text-sm text-accent hover:text-accent-dark"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {rows.length === 0 ? (
        <p className="rounded-lg border border-line bg-surface p-6 text-sm text-ink-5">
          No services match that search. Try a broader term, or browse by category.
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {rows.map((r) => {
            const inBundle = bundle.includes(r.code);
            return (
              <li key={r.code} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug text-ink">{r.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-ink-5">
                    {r.code}
                    {r.meta && <span className="font-sans"> · {r.meta}</span>}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggle(r.code)}
                  className={`focus-ring rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                    inBundle
                      ? "border-positive-line bg-positive-tint text-positive"
                      : "border-line-strong bg-surface text-ink hover:bg-sunken"
                  }`}
                >
                  {inBundle ? "✓ In bundle" : "Add to bundle"}
                </button>
                <Link
                  href={scopingHref([r.code])}
                  className="focus-ring rounded-lg px-3 py-1.5 text-sm font-semibold text-accent hover:text-accent-dark"
                >
                  Request proposal
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
