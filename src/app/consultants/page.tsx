import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ListingForm } from "@/components/listing-form";

export const metadata: Metadata = {
  title: "For consultants — GRC Department",
  description:
    "Listing on GRC Department is open to grcmentor.ai graduates: set your availability and working window, and be introduced to engagements that match your assessed competencies.",
};

const PROVIDES = [
  {
    title: "Control of your practice",
    body: "You set your own availability, working window and the service categories you accept. Terms are agreed with you before any client introduction is made.",
  },
  {
    title: "Qualified introductions",
    body: "Client briefs are screened and scoped before they reach you. No unpaid proposals, and no competing against other consultants for the same brief.",
  },
  {
    title: "Payment administration",
    body: "Timesheets approved weekly by the client, and payment for approved hours administered centrally.",
  },
];

const STAGES = [
  { n: "01", title: "Graduate", body: "Complete the grcmentor.ai curriculum for at least one framework track." },
  { n: "02", title: "Submit artefacts", body: "Provide your simulated-audit deliverables: policy set, risk register, evidence index." },
  { n: "03", title: "Review session", body: "A working session with an assessor scores the competencies that appear on your profile." },
  { n: "04", title: "Publish and engage", body: "Set your availability, working window and accepted service categories. Introductions begin once your profile is live." },
];

const REQUIREMENTS = [
  "Completion of at least one grcmentor.ai framework track",
  "Four hours of daily overlap with at least one client region",
  "Professional written English; additional languages listed on profile",
  "Willingness to execute client confidentiality agreements",
  "Minimum availability of ten hours per week",
];

export default function ConsultantsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">For consultants</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-[-0.03em] text-ink sm:text-5xl">
              Complete the programme. Practise on international engagements.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-4">
              Listing on GRC Department is open to grcmentor.ai graduates. You set your availability,
              working window and the service categories you accept; we handle contracting, client
              vetting and administration, and introduce you only to engagements that match your
              assessed competencies.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#apply" className="focus-ring rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-dark">
                Apply for listing
              </a>
              <Link
                href="/talent"
                className="focus-ring rounded-lg border border-line-strong bg-surface px-5 py-3 font-semibold text-ink hover:bg-sunken"
              >
                See listed profiles
              </Link>
              <Link
                href="/consultant-portal"
                className="focus-ring rounded-lg px-5 py-3 font-semibold text-accent hover:text-accent-dark"
              >
                Already listed? Consultant portal →
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">What listing provides</p>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {PROVIDES.map((p) => (
              <div key={p.title} className="rounded-xl border border-line bg-surface p-6">
                <h2 className="font-bold text-ink">{p.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-4">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-3xl font-semibold tracking-[-0.02em] text-ink">The listing route, stage by stage.</h2>
            <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {STAGES.map((s) => (
                <li key={s.n} className="border-t-2 border-ink pt-4">
                  <span className="font-mono text-sm font-bold text-accent">{s.n}</span>
                  <h3 className="mt-2 font-bold text-ink">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-5">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1fr_1.4fr]">
          <div id="requirements" className="scroll-mt-28">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink">Listing requirements</h2>
            <ul className="mt-5 space-y-3">
              {REQUIREMENTS.map((r) => (
                <li key={r} className="flex gap-3 text-sm leading-relaxed text-ink-3">
                  <span aria-hidden className="text-accent">—</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div id="apply" className="scroll-mt-28 rounded-xl border border-line bg-surface p-7">
            <h2 className="text-xl font-bold text-ink">Register interest</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-4">
              Applications open on a rolling basis. Graduates are notified when review sessions are
              scheduled for their track.
            </p>
            <div className="mt-6">
              <ListingForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
