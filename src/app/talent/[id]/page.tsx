import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DemoNotice } from "@/components/demo-notice";
import { ProfileMark } from "@/components/profile-mark";
import { getConsultant } from "@/lib/consultants";
import { getCatalogue } from "@/lib/catalogue";
import { ApiError } from "@/lib/api";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ region?: string }>;
}) {
  const { id } = await params;
  const { region } = await searchParams;

  let data;
  try {
    data = await getConsultant(id, region);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
  const c = data.consultant;
  const { practice_areas } = await getCatalogue();
  const areaName = new Map(practice_areas.map((a) => [a.code, a.name]));

  const backHref = region ? `/talent?region=${encodeURIComponent(region)}` : "/talent";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <Link href={backHref} className="focus-ring rounded text-sm text-ink-5 hover:text-ink">
          ← Back to directory
        </Link>

        {c.is_seed && (
          <div className="mt-6">
            <DemoNotice />
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex flex-wrap items-start gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-ink text-lg font-bold text-white">
                {c.initials}
              </span>
              <div className="min-w-0">
                <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-ink">{c.name}</h1>
                <p className="text-ink-4">{c.headline}</p>
                <p className="mt-1 text-sm text-ink-5">
                  {c.location} · {c.window} · {c.availability}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <ProfileMark isSeed={c.is_seed} />
                  {c.cohort && <span className="text-xs text-ink-5">{c.cohort}</span>}
                </div>
              </div>
            </div>

            {c.bio && <p className="mt-7 max-w-2xl leading-relaxed text-ink-3">{c.bio}</p>}

            {c.assessment && (
              <section className="mt-8 rounded-xl border border-line bg-surface p-5">
                <h2 className="text-sm font-bold text-ink">Assessed record · {c.assessment.programme}</h2>
                <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Verified activities", `${c.assessment.verified_activities} of ${c.assessment.total_activities}`],
                    ["Average mentor score", c.assessment.average_score != null ? `${c.assessment.average_score} / 5` : "—"],
                    ["Judgment calls defended", String(c.assessment.judgment_calls)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs text-ink-5">{k}</dt>
                      <dd className="text-lg font-extrabold tracking-[-0.02em] text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sunken">
                  <div
                    className="h-full rounded-full bg-positive"
                    style={{ width: `${Math.round((c.assessment.verified_activities / Math.max(1, c.assessment.total_activities)) * 100)}%` }}
                  />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-ink-5">
                  Every figure on this profile is computed from work graded on grcmentor.ai
                  {c.assessment.assessed_at ? `, as of ${new Date(c.assessment.assessed_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}` : ""}.
                  Nothing here was written by the consultant.
                </p>
              </section>
            )}

            {c.competencies.length > 0 && (
              <section className="mt-10">
                <h2 className="text-lg font-bold text-ink">Assessed competencies</h2>
                {!c.is_seed && (
                  <p className="mt-1 text-xs text-ink-5">
                    Rubric scores from graded activities, and judgment scores from the decisions they
                    defended.
                  </p>
                )}
                <ul className="mt-4 space-y-3">
                  {c.competencies.map((comp) => (
                    <li key={comp.name}>
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="text-sm font-medium text-ink">
                          {comp.name}
                          {comp.basis && (
                            <span className="ml-2 text-xs font-normal text-ink-5">
                              {comp.basis === "judgment" ? "judgment" : "rubric"}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-xs text-ink-5">
                          {comp.level} · {comp.pct}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sunken">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: comp.pct }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {c.assessment && c.assessment.programme_work.length > 0 && (
              <section className="mt-10">
                <h2 className="text-lg font-bold text-ink">Programme work</h2>
                {/* Simulated engagements are never presented as client history. */}
                <p className="mt-1 text-xs text-ink-5">
                  Simulated organisations from the grcmentor.ai programme — not client engagements.
                </p>
                <ul className="mt-4 space-y-3">
                  {c.assessment.programme_work.map((w) => (
                    <li key={w.org} className="flex flex-wrap items-baseline gap-x-3 border-l-2 border-line pl-4">
                      <span className="font-semibold text-ink">{w.org}</span>
                      <span className="text-xs text-ink-5">
                        {w.industry ? `${w.industry} · ` : ""}
                        {w.tasks} task{w.tasks === 1 ? "" : "s"} with verified work
                      </span>
                      <span className="rounded border border-line bg-paper px-1.5 py-0.5 text-[11px] text-ink-5">Simulated</span>
                    </li>
                  ))}
                </ul>
                {c.assessment.standards.length > 0 && (
                  <p className="mt-3 text-xs text-ink-5">Standards covered: {c.assessment.standards.join(" · ")}</p>
                )}
              </section>
            )}

            {c.history.length > 0 && (
              <section className="mt-10">
                <h2 className="text-lg font-bold text-ink">Engagement history</h2>
                <ul className="mt-4 space-y-5">
                  {c.history.map((h) => (
                    <li key={h.title} className="border-l-2 border-line pl-4">
                      <h3 className="font-semibold text-ink">{h.title}</h3>
                      <p className="text-xs text-ink-5">{h.meta}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-4">{h.detail}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                { title: "Certifications", items: c.certifications },
                { title: "Tooling", items: c.tools },
                { title: "Languages", items: c.languages },
              ].map((col) => (
                <div key={col.title}>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                    {col.title}
                  </h2>
                  <ul className="mt-2 space-y-1 text-sm text-ink-4">
                    {col.items.length ? (
                      col.items.map((i) => <li key={i}>{i}</li>)
                    ) : (
                      <li className="text-faint">Not stated</li>
                    )}
                  </ul>
                </div>
              ))}
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-40 lg:self-start">
            <div className="rounded-xl border border-line bg-surface p-5">
              <h2 className="font-bold text-ink">Engagement</h2>
              <p className="mt-1 text-sm text-ink-4">
                {c.availability} · {c.notice_days === 0 ? "immediate" : `${c.notice_days} days`}{" "}
                notice
              </p>
              {c.package_note && <p className="mt-2 text-xs text-ink-5">{c.package_note}</p>}

              <Link
                href="/brief"
                className="focus-ring mt-5 block rounded-lg bg-accent px-4 py-2.5 text-center font-semibold text-white hover:bg-accent-dark"
              >
                Request an introduction
              </Link>

              <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
                {[
                  [
                    "Overlap offered",
                    c.overlap_label
                      ? `${c.overlap_label} with ${region}`
                      : c.overlap_note ?? "State your business hours to see this",
                  ],
                  ["Working window", c.window],
                  ["Notice period", c.notice_days === 0 ? "Immediate" : `${c.notice_days} days`],
                  ["Response time", `Within ${c.response_hours} hours`],
                  ["Experience", c.experience_years ? `${c.experience_years} years` : "New to client work"],
                  ["Practice areas", c.practice_areas.map((a) => areaName.get(a) ?? a).join(", ")],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <dt className="shrink-0 text-ink-5">{label}</dt>
                    <dd className="text-right font-medium text-ink-2">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-xl border border-line bg-muted p-5">
              <h2 className="text-sm font-bold text-ink">Administered by GRC Department</h2>
              <p className="mt-2 text-xs leading-relaxed text-ink-4">
                Contracting, NDA execution, timesheet approval and invoicing are handled
                centrally. A two-week trial period applies to every engagement.
              </p>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
