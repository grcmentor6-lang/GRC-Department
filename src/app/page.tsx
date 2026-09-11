import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getCatalogue } from "@/lib/catalogue";

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
    title: "Receive a proposal and a consultant",
    body: "A GRC lead confirms the deliverable, duration and acceptance criteria, and names the vetted consultant assigned — with the working overlap they will hold.",
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

const FAQ = [
  {
    q: "Are consultants employees of GRC Department?",
    a: "No. Consultants are independent practitioners engaged through GRC Department, which administers the contract, confidentiality terms and payment.",
  },
  {
    q: "How is time zone overlap guaranteed?",
    a: "Each profile declares a working window. Shortlists exclude consultants who cannot provide at least four hours of overlap with your stated business hours.",
  },
  {
    q: "Can a consultant sign our audit opinion?",
    a: "No. Consultants prepare organisations for assessment and support the audit; the opinion remains the responsibility of your licensed audit firm.",
  },
  {
    q: "How does this relate to grcmentor.ai?",
    a: "grcmentor.ai trains and assesses practitioners. GRC Department is where those practitioners are engaged by clients. Listing requires programme completion.",
  },
];

export default async function HomePage() {
  const { categories, service_count } = await getCatalogue();

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="border-b border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              grcmentor.ai talent network
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-[-0.03em] text-ink sm:text-5xl">
              Governance, risk and compliance specialists in your time zone — wherever you
              operate.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-4">
              GRC Department places vetted remote practitioners with organisations that need
              audit-ready programmes. Every consultant has completed the grcmentor.ai curriculum
              and a technical review before being listed for engagement.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/brief"
                className="focus-ring rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-dark"
              >
                Submit an engagement brief
              </Link>
              <Link
                href="/talent"
                className="focus-ring rounded-lg border border-line-strong bg-surface px-5 py-3 font-semibold text-ink hover:bg-sunken"
              >
                Browse consultants
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-5">
              <li>Coverage across 14 time zones</li>
              <li aria-hidden>·</li>
              <li>Four-hour working overlap guaranteed</li>
              <li aria-hidden>·</li>
              <li>Single services or bundled programmes</li>
            </ul>
          </div>
        </section>

        {/* Two doors */}
        <section className="mx-auto grid max-w-6xl gap-5 px-4 py-16 md:grid-cols-2">
          {[
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
          ].map((card) => (
            <div
              key={card.eyebrow}
              className="rounded-xl border border-line bg-surface p-7 transition-colors hover:border-line-strong"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-5">
                {card.eyebrow}
              </p>
              <h2 className="mt-3 text-xl font-bold leading-snug tracking-[-0.01em] text-ink">
                {card.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-4">{card.body}</p>
              <Link
                href={card.cta.href}
                className="focus-ring mt-5 inline-block rounded font-semibold text-accent hover:text-accent-dark"
              >
                {card.cta.label} →
              </Link>
            </div>
          ))}
        </section>

        {/* Catalogue teaser — counts come from the backend, never hardcoded */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Service catalogue
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-[-0.02em] text-ink">
              {service_count} services across {categories.length} categories, engaged singly or
              bundled.
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-ink-4">
              Rather than scoping an open-ended consulting engagement, select the discrete units
              of work you need — a business impact analysis, a supplier tiering model, a
              retention schedule — and receive a scoped proposal against each.
            </p>

            <ul className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((c) => (
                <li key={c.code}>
                  <Link
                    href={`/services?cat=${c.code}`}
                    className="focus-ring flex h-full items-start gap-3 rounded-lg border border-line bg-paper p-3.5 hover:border-accent hover:bg-accent-tint"
                  >
                    <span className="rounded bg-ink px-1.5 py-0.5 font-mono text-[11px] font-semibold text-white">
                      {c.code}
                    </span>
                    <span className="text-sm font-medium leading-snug text-ink-2">{c.name}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/services"
              className="focus-ring mt-8 inline-block rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-dark"
            >
              Browse the catalogue
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            How it works
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-[-0.02em] text-ink">
            Select the work. Scope it. A consultant delivers it.
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink-4">
            You do not have to define a consulting engagement from a blank page. The catalogue
            breaks GRC delivery into discrete services, each one a scoped unit of work with a
            named output.
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

        {/* Engagement models */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Engagement models
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] text-ink">
              Three ways to take services from the catalogue.
            </h2>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {MODELS.map((m) => (
                <div
                  key={m.title}
                  className={`relative rounded-xl border p-7 ${
                    m.featured ? "border-accent bg-accent-tint" : "border-line bg-paper"
                  }`}
                >
                  {m.featured && (
                    <span className="absolute -top-2.5 left-7 rounded bg-accent px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
                      Most engaged
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-ink">{m.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-4">{m.body}</p>
                  <ul className="mt-5 space-y-2 text-sm text-ink-3">
                    {m.points.map((p) => (
                      <li key={p} className="flex gap-2">
                        <span aria-hidden className="text-positive">
                          ✓
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="mt-8 text-sm text-ink-5">
              Terms for each model are set out in the proposal returned after scoping. Every
              engagement begins with a two-week trial period.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Frequently asked
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] text-ink">
            Common questions.
          </h2>

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
