import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScopingForm } from "@/components/scoping-form";
import { getCatalogue } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Scoping — GRC Department",
};

export default async function ScopingPage({
  searchParams,
}: {
  searchParams: Promise<{ codes?: string }>;
}) {
  const { codes: raw } = await searchParams;
  const catalogue = await getCatalogue();

  // The bundle arrives as ?codes=BCR-02,ASM-01. Unknown codes are dropped here rather than sent
  // on: the API would reject the whole request and the visitor would see a validation error for
  // something they never typed.
  const known = new Set(catalogue.categories.flatMap((c) => c.services.map((s) => s.code)));
  const codes = (raw ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter((c) => known.has(c));

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Scoping</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-[-0.02em] text-ink sm:text-4xl">
          {codes.length > 1
            ? `Scope ${codes.length} services as one engagement`
            : "Scope this service"}
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-4">
          Six questions. A GRC lead reviews the request and returns a written proposal setting out
          the deliverable, duration and the consultant assigned, within one business day.
        </p>

        <div className="mt-10">
          <ScopingForm catalogue={catalogue} codes={codes} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
