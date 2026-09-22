import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getCatalogue } from "@/lib/catalogue";
import { getDirectoryPreview, type ConsultantCard } from "@/lib/consultants";
import { CONSULTANTS_ENABLED } from "@/lib/flags";

const FRAMEWORKS = [
  "SOC 2",
  "ISO 27001",
  "ISO 27701",
  "ISO 42001",
  "GDPR",
  "DPDPA",
  "PCI DSS 4.0",
  "HIPAA",
  "HITRUST",
  "NIST CSF",
  "NIST AI RMF",
  "EU AI Act",
];

const STEPS = [
  {
    n: "01",
    title: "Choose from the catalogue",
    body: "Browse 16 delivery categories or search the full catalogue. Select a single service, or add several to a bundle — across categories if the work spans them.",
  },
  {
    n: "02",
    title: "Complete a short scoping form",
    body: "Six questions covering boundary, driving framework, timing, your business hours and any existing material. Questions adapt to the category of service selected.",
  },
  {
    n: "03",
    title: "Receive a written proposal",
    body: "A GRC lead confirms the deliverable, duration, price and acceptance criteria, and who will deliver the work — within one business day.",
  },
  {
    n: "04",
    title: "Delivery under a single agreement",
    body: "Contracting, confidentiality terms and administration run through GRC Department. Bundled services are delivered under one statement of work and one point of contact.",
  },
];

const MODELS = [
  {
    title: "Single service",
    body: "One catalogue item with a defined output — a business impact analysis, a retention schedule, a supplier tiering model. The narrowest way to start.",
    points: ["One scoped deliverable", "Defined acceptance criteria", "Suited to a specific gap"],
    featured: false,
  },
  {
    title: "Bundled programme",
    body: "Several services combined into one engagement — commonly a readiness sequence: assessment, then design, then implementation and testing.",
    points: ["One statement of work", "One point of contact", "Sequenced delivery plan"],
    featured: true,
  },
  {
    title: "Continuing support",
    body: "Recurring catalogue services delivered on a cadence — monitoring cycles, review cycles, questionnaire response and register maintenance.",
    points: ["Agreed recurring cadence", "Consistent consultant", "Reviewed each quarter"],
    featured: false,
  },
];

const VETTING = [
  { stage: "Stage 01", title: "Programme completion", body: "Framework modules and graded control-mapping exercises on grcmentor.ai." },
  { stage: "Stage 02", title: "Simulated audit", body: "An end-to-end readiness exercise producing a policy set, risk register and evidence index." },
  { stage: "Stage 03", title: "Practitioner review", body: "A working session with an experienced assessor, scored against the competencies shown on the profile." },
  { stage: "Stage 04", title: "Engagement record", body: "Client feedback after each engagement remains attached to the profile and informs future matching." },
];

const FAQ = [
  ...(CONSULTANTS_ENABLED
    ? [
        {
          q: "Are consultants employees of GRC Department?",
          a: "No. Consultants are independent practitioners engaged through GRC Department, which administers the contract, confidentiality terms and payment.",
        },
      ]
    : []),
  {
    q: "How do you work across time zones?",
    a: "Tell us your business hours when you scope the work. Every engagement is staffed to give you at least four hours of working overlap with them each day.",
  },
  {
    q: "Can you sign our audit opinion?",
    a: "No. We prepare organisations for assessment and support the audit; the opinion remains the responsibility of your licensed audit firm.",
  },
  {
    q: "What does it cost?",
    a: "Each catalogue service is priced in the written proposal you receive after scoping, before any work starts. Briefs and scoping requests are free and carry no obligation.",
  },
  ...(CONSULTANTS_ENABLED
    ? [
        {
          q: "How does this relate to grcmentor.ai?",
          a: "grcmentor.ai trains and assesses practitioners. GRC Department is where those practitioners are engaged by clients. Listing requires programme completion.",
        },
      ]
    : []),
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{children}</p>;
}

export default async function HomePage() {
  const [{ categories, service_count, practice_areas }, directory] = await Promise.all([
    getCatalogue(),
    // The landing page must render even if the directory call fails — it is a strip, not the page.
    // With the consultant side off there is nothing to fetch (and the endpoint is closed).
    CONSULTANTS_ENABLED ? getDirectoryPreview().catch(() => null) : Promise.resolve(null),
  ]);
  const consultants: ConsultantCard[] = directory?.consultants ?? [];
  const shortlist = consultants.slice(0, 3);
  // Live counts of listed consultants per practice area — derived, never the mockup's invented figures.
  const areaCount = new Map(
    practice_areas.map((a) => [a.code, consultants.filter((c) => c.practice_areas.includes(a.code)).length]),
  );

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="border-b border-line bg-surface">
          {/* *:min-w-0 — a grid item defaults to min-width:auto, so the truncated service names in the
              right-hand card would otherwise hold the column at full text width and push a phone
              screen sideways. */}
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 *:min-w-0 lg:grid-cols-[1.35fr_1fr] lg:items-center">
            <div>
              <Eyebrow>{CONSULTANTS_ENABLED ? "grcmentor.ai talent network" : "Remote GRC delivery"}</Eyebrow>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-[-0.035em] text-ink sm:text-5xl">
                Governance, risk and compliance specialists in your time zone — wherever you operate.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-4">
                {CONSULTANTS_ENABLED
                  ? "GRC Department places vetted remote practitioners with organisations that need audit-ready programmes. Every consultant has completed the grcmentor.ai curriculum and a technical review before being listed for engagement."
                  : "GRC Department delivers audit-ready governance, risk and compliance work as discrete, scoped services — engaged singly or bundled, priced before work starts, and delivered remotely within your working hours."}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/brief" className="focus-ring rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-dark">
                  Submit an engagement brief
                </Link>
                <Link
                  href={CONSULTANTS_ENABLED ? "/talent" : "/services"}
                  className="focus-ring rounded-lg border border-line-strong bg-surface px-5 py-3 font-semibold text-ink hover:bg-sunken"
                >
                  {CONSULTANTS_ENABLED ? "Browse consultants" : "Browse the catalogue"}
                </Link>
              </div>
              <ul className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-5">
                <li>Four-hour working overlap guaranteed</li>
                <li aria-hidden>·</li>
                <li>Single services or bundled programmes</li>
              </ul>
            </div>

            {shortlist.length > 0 && (
              <div className="rounded-xl border border-line bg-paper p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-5">Listed consultants</p>
                  <span className="text-xs text-ink-5">{shortlist.length} shown</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {shortlist.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/talent/${m.id}`}
                        className="focus-ring flex items-center gap-3 rounded-lg border border-line bg-surface p-3 hover:border-line-strong"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                          {m.initials}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-ink">{m.name}</span>
                          <span className="block truncate text-xs text-ink-5">
                            {m.headline} · {m.timezone}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between text-xs text-ink-5">
                  <span>Shortlists are reviewed by a GRC lead</span>
                  <Link href="/talent" className="focus-ring rounded font-semibold text-accent hover:text-accent-dark">
                    View all →
                  </Link>
                </div>
              </div>
            )}

            {!CONSULTANTS_ENABLED && (
              <div className="rounded-xl border border-line bg-paper p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-5">Start with one service</p>
                  <span className="text-xs text-ink-5">{service_count} in the catalogue</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {categories.slice(0, 4).map((c) => (
                    <li key={c.code}>
                      <Link
                        href={`/services?cat=${c.code}`}
                        className="focus-ring flex items-center gap-3 rounded-lg border border-line bg-surface p-3 hover:border-line-strong"
                      >
                        <span className="rounded bg-ink px-1.5 py-0.5 font-mono text-[11px] font-semibold text-white">{c.code}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-ink">{c.services[0]?.name}</span>
                          <span className="block truncate text-xs text-ink-5">{c.name}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between text-xs text-ink-5">
                  <span>Priced in a written proposal</span>
                  <Link href="/services" className="focus-ring rounded font-semibold text-accent hover:text-accent-dark">
                    All services →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Two doors */}
        <section className="mx-auto grid max-w-6xl gap-5 px-4 py-16 md:grid-cols-2">
          {(CONSULTANTS_ENABLED
            ? [
                {
                  eyebrow: "For organisations",
                  title: "Staff a compliance programme without a headcount request.",
                  body: "Select the services you need from the catalogue and a vetted consultant delivers them. Contracting, confidentiality agreements and administration are handled centrally.",
                  cta: { href: "/brief", label: "Submit a brief" },
                },
                {
                  eyebrow: "For consultants",
                  title: "Complete the programme, then practise on international engagements.",
                  body: "grcmentor.ai graduates apply for listing, set their own availability and working window, and are introduced to clients whose control environment matches their assessed competencies.",
                  cta: { href: "/consultants", label: "Apply for listing" },
                },
              ]
            : [
                {
                  eyebrow: "Know what you need",
                  title: "Pick the exact services from the catalogue.",
                  body: "Select one service or bundle several, answer six scoping questions, and receive a written proposal with scope, duration and price within one business day.",
                  cta: { href: "/services", label: "Browse the catalogue" },
                },
                {
                  eyebrow: "Not sure where to start",
                  title: "Describe the obligation and we will scope it.",
                  body: "Tell us the framework, where you are today and the deadline. A GRC lead turns it into a scoped proposal — or comes back with the questions that decide it.",
                  cta: { href: "/brief", label: "Submit a brief" },
                },
              ]
          ).map((card) => (
            <div key={card.eyebrow} className="rounded-xl border border-line bg-surface p-7 transition-colors hover:border-line-strong">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-5">{card.eyebrow}</p>
              <h2 className="mt-3 text-xl font-bold leading-snug tracking-[-0.01em] text-ink">{card.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-4">{card.body}</p>
              <Link href={card.cta.href} className="focus-ring mt-5 inline-block rounded font-semibold text-accent hover:text-accent-dark">
                {card.cta.label} →
              </Link>
            </div>
          ))}
        </section>

        {/* Frameworks covered */}
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-5">Frameworks covered</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {FRAMEWORKS.map((f) => (
              <li key={f} className="rounded-full border border-line bg-surface px-3 py-1 text-sm text-ink-3">
                {f}
              </li>
            ))}
          </ul>
        </section>

        {/* Service catalogue */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <Eyebrow>Service catalogue</Eyebrow>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.02em] text-ink">
              {service_count} services across {categories.length} categories, engaged singly or bundled.
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-ink-4">
              Rather than scoping an open-ended consulting engagement, select the discrete units of work
              you need — a business impact analysis, a supplier tiering model, a retention schedule — and
              receive a scoped proposal against each.
            </p>
            <ul className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((c) => (
                <li key={c.code}>
                  <Link
                    href={`/services?cat=${c.code}`}
                    className="focus-ring flex h-full items-start gap-3 rounded-lg border border-line bg-paper p-3.5 hover:border-accent hover:bg-accent-tint"
                  >
                    <span className="rounded bg-ink px-1.5 py-0.5 font-mono text-[11px] font-semibold text-white">{c.code}</span>
                    <span className="text-sm font-medium leading-snug text-ink-2">{c.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/services" className="focus-ring mt-8 inline-block rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-dark">
              Browse the catalogue
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.02em] text-ink">
            Select the work. Scope it. We deliver it.
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink-4">
            You do not have to define a consulting engagement from a blank page. The catalogue breaks
            GRC delivery into discrete services, each one a scoped unit of work with a named output.
          </p>
          <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="border-t-2 border-ink pt-4">
                <span className="font-mono text-sm font-bold text-accent">{s.n}</span>
                <h3 className="mt-2 font-bold leading-snug text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-5">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Practice areas — the talent directory's vocabulary, so only with the consultant side on */}
        {CONSULTANTS_ENABLED && (
        <section id="practice-areas" className="scroll-mt-28 border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Eyebrow>Practice areas</Eyebrow>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-ink">
                  Engage against the control, not the job title.
                </h2>
              </div>
              <Link href="/talent" className="focus-ring rounded font-semibold text-accent hover:text-accent-dark">
                All practice areas →
              </Link>
            </div>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {practice_areas.map((a) => {
                const n = areaCount.get(a.code) ?? 0;
                return (
                  <li key={a.code}>
                    <Link
                      href={`/talent?practice_area=${a.code}`}
                      className="focus-ring block h-full rounded-xl border border-line bg-paper p-5 hover:border-accent hover:bg-accent-tint"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-ink px-1.5 py-0.5 font-mono text-[11px] font-semibold text-white">
                          {a.code.replace("PA-", "")}
                        </span>
                        <span className="text-xs text-ink-5">
                          {n} listed
                        </span>
                      </div>
                      <h3 className="mt-3 font-bold text-ink">{a.name}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-5">{a.desc}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        )}

        {/* Available for engagement */}
        {consultants.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Eyebrow>Available for engagement</Eyebrow>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-ink">
                  Consultants accepting work this quarter.
                </h2>
              </div>
              <Link href="/talent" className="focus-ring rounded font-semibold text-accent hover:text-accent-dark">
                Browse all →
              </Link>
            </div>
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {consultants.slice(0, 3).map((p) => (
                <li key={p.id} className="flex flex-col rounded-xl border border-line bg-surface p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
                      {p.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-ink">{p.name}</p>
                      <p className="text-sm text-ink-4">{p.headline}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.skills.slice(0, 3).map((s) => (
                      <span key={s} className="rounded-full border border-line bg-paper px-2 py-0.5 text-xs text-ink-4">
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-ink-5">
                    {p.window} · {p.availability}
                  </p>
                  <Link
                    href={`/talent/${p.id}`}
                    className="focus-ring mt-auto pt-4 text-sm font-semibold text-accent hover:text-accent-dark"
                  >
                    View profile →
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Engagement models */}
        <section id="engagement-models" className="scroll-mt-28 border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <Eyebrow>Engagement models</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-ink">
              Three ways to take services from the catalogue.
            </h2>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {MODELS.map((m) => (
                <div
                  key={m.title}
                  className={`relative rounded-xl border p-7 ${m.featured ? "border-accent bg-accent-tint" : "border-line bg-paper"}`}
                >
                  {m.featured && (
                    <span className="absolute -top-2.5 left-7 rounded bg-accent px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
                      Most engaged
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-ink">{m.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-4">{m.body}</p>
                  <ul className="mt-5 space-y-2 text-sm text-ink-3">
                    {m.points.map((pt) => (
                      <li key={pt} className="flex gap-2">
                        <span aria-hidden className="text-positive">
                          ✓
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-ink-5">
              Terms for each model are set out in the proposal returned after scoping. Every engagement
              begins with a two-week trial period.
            </p>
          </div>
        </section>

        {/* Client portal */}
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>Client portal</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-ink">
              Your engagements, deliverables and consultants in one place.
            </h2>
            <p className="mt-4 leading-relaxed text-ink-4">
              Track milestones, accept deliverables, approve your consultant&apos;s weekly timesheet, and
              see what your own teams owe the engagement — the evidence exports and ticket samples that
              stall an audit when they go missing.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/portal/signup" className="focus-ring rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-dark">
                Create a client account
              </Link>
              <Link
                href="/portal"
                className="focus-ring rounded-lg border border-line-strong bg-surface px-5 py-3 font-semibold text-ink hover:bg-sunken"
              >
                Sign in
              </Link>
            </div>
          </div>
          <ul className="space-y-3">
            {[
              ["Accept deliverables", "Acceptance closes the milestone it belongs to."],
              ["Approve timesheets", "Hours you approve become payable; a week you do not review within five business days is approved automatically."],
              ["See what you owe", "Every item your teams owe the consultant, with what is overdue."],
              ["Slack and Microsoft Teams", "Per-engagement channels are planned, not yet available."],
            ].map(([t, b]) => (
              <li key={t} className="rounded-xl border border-line bg-surface p-4">
                <p className="font-semibold text-ink">{t}</p>
                <p className="mt-1 text-sm text-ink-4">{b}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Vetting — the grcmentor.ai listing route, so only with the consultant side on */}
        {CONSULTANTS_ENABLED && (
        <section id="vetting" className="scroll-mt-28 border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <Eyebrow>Vetting</Eyebrow>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.02em] text-ink">
              Listing is earned through assessed work, not a self-reported résumé.
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-ink-4">
              Consultants progress through the grcmentor.ai programme and a listing review before
              appearing in client shortlists. Each stage produces artefacts a client can inspect.
            </p>
            <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {VETTING.map((v) => (
                <li key={v.stage} className="rounded-xl border border-line bg-paper p-5">
                  <span className="font-mono text-xs font-bold text-accent">{v.stage}</span>
                  <h3 className="mt-2 font-bold text-ink">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-5">{v.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        )}

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 py-16">
          <Eyebrow>Frequently asked</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-ink">Common questions.</h2>
          <dl className="mt-8 divide-y divide-line border-y border-line">
            {FAQ.map((f) => (
              <div key={f.q} className="py-5">
                <dt className="font-semibold text-ink">{f.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink-4">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
