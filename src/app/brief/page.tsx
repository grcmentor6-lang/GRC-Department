import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BriefForm } from "@/components/brief-form";

export const metadata: Metadata = {
  title: "Submit an engagement brief — GRC Department",
  description:
    "Describe the obligation and a GRC lead returns a scoped proposal — deliverable, duration and price — within one business day.",
};

export default function BriefPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Engagement brief
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
          Describe the obligation and we will scope it.
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-4">
          A GRC lead reviews every submission and replies within one business day with a scoped
          proposal — or with the questions that decide it.
        </p>

        <div className="mt-10">
          <BriefForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
