import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DemoNotice } from "@/components/demo-notice";
import { ProfileMark } from "@/components/profile-mark";
import { TalentFilters } from "@/components/talent-filters";
import { getDirectory, type ConsultantCard } from "@/lib/consultants";

export const metadata: Metadata = {
  title: "Browse GRC consultants — GRC Department",
  description:
    "Filter vetted remote GRC consultants by practice area, availability, experience and working overlap.",
};

type SP = Record<string, string | string[] | undefined>;

const asArray = (v: string | string[] | undefined): string[] =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

export default async function TalentPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const region = typeof sp.region === "string" ? sp.region : undefined;

  let directory;
  try {
    directory = await getDirectory({
      practiceArea: asArray(sp.practice_area),
      availability: typeof sp.availability === "string" ? sp.availability : undefined,
      minExperience: Number(sp.min_experience ?? 0) || undefined,
      region,
      q: typeof sp.q === "string" ? sp.q : undefined,
    });
  } catch {
    // Backend unreachable (cold start, outage). A page that says so beats the host's error screen.
    return <Unavailable />;
  }

  const areaName = new Map(directory.practice_areas.map((a) => [a.code, a.name]));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Talent directory
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
          Browse GRC consultants.
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-4">
          Filter by practice area, working window, availability and experience. Every listed
          consultant has completed programme assessment.
        </p>

        {/* Only when invented profiles are actually on screen; each is also marked on its card. */}
        {directory.consultants.some((c) => c.is_seed) && (
          <div className="mt-8">
            <DemoNotice />
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
          <Suspense fallback={<div className="text-sm text-ink-5">Loading filters…</div>}>
            <TalentFilters
              practiceAreas={directory.practice_areas}
              regions={directory.regions}
              resultCount={directory.consultants.length}
            />
          </Suspense>

          <div>
            {directory.consultants.length === 0 ? (
              <EmptyState region={region} />
            ) : (
              <ul className="space-y-4">
                {directory.consultants.map((c) => (
                  <li key={c.id}>
                    <ConsultantRow card={c} areaName={areaName} region={region} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Unavailable() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="max-w-xl rounded-xl border border-line bg-surface p-8">
          <h1 className="text-xl font-semibold text-ink">The directory is temporarily unavailable</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-4">
            We could not reach the consultant directory just now. It usually comes back within a
            minute — try again shortly, or submit a brief and a GRC lead will reply with a shortlist.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/talent"
              className="focus-ring rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-ink hover:bg-sunken"
            >
              Try again
            </Link>
            <Link
              href="/brief"
              className="focus-ring rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
            >
              Submit a brief
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function EmptyState({ region }: { region?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-8">
      <h2 className="font-bold text-ink">No consultants match these filters</h2>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-4">
        {region
          ? `Nobody currently listed can hold four hours of daily overlap with ${region} business hours alongside your other filters. Lowering the experience threshold or removing a practice area is usually what opens it up.`
          : "Lower the experience threshold or remove a practice area."}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/talent"
          className="focus-ring rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-ink hover:bg-sunken"
        >
          Reset filters
        </Link>
        <Link
          href="/brief"
          className="focus-ring rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          Submit a brief instead
        </Link>
      </div>
    </div>
  );
}

function ConsultantRow({
  card,
  areaName,
  region,
}: {
  card: ConsultantCard;
  areaName: Map<string, string>;
  region?: string;
}) {
  const href = region ? `/talent/${card.id}?region=${encodeURIComponent(region)}` : `/talent/${card.id}`;
  return (
    <div className="rounded-xl border border-line bg-surface p-5 transition-colors hover:border-line-strong">
      <div className="flex flex-wrap items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
          {card.initials}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-bold leading-snug text-ink">{card.name}</h2>
            <ProfileMark isSeed={card.is_seed} />
          </div>
          <p className="text-sm text-ink-4">{card.headline}</p>
          <p className="mt-1 text-xs text-ink-5">
            {card.location} · {card.window}
          </p>

          {card.summary && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-4">{card.summary}</p>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {card.practice_areas.map((code) => (
              <span
                key={code}
                className="rounded-full border border-line bg-paper px-2 py-0.5 text-xs text-ink-4"
              >
                {areaName.get(code) ?? code}
              </span>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-5">
            <span>{card.experience_years ? `${card.experience_years} years` : "New to client work"}</span>
            <span aria-hidden>·</span>
            <span>{card.availability}</span>
            {card.overlap_label && (
              <>
                <span aria-hidden>·</span>
                {/* Green means settled. An overlap figure is a computed guarantee, so it earns it. */}
                <span className="rounded bg-positive-tint px-1.5 py-0.5 font-medium text-positive">
                  {card.overlap_label} overlap
                </span>
              </>
            )}
            {card.cohort && (
              <>
                <span aria-hidden>·</span>
                <span>{card.cohort}</span>
              </>
            )}
          </div>
        </div>

        <Link
          href={href}
          className="focus-ring shrink-0 rounded-lg border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink hover:bg-sunken"
        >
          View profile
        </Link>
      </div>
    </div>
  );
}
