import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CatalogueBrowser } from "@/components/catalogue-browser";
import { getCatalogue } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Service catalogue — GRC Department",
  description:
    "320 discrete units of GRC work across 16 categories, engaged singly or bundled into one statement of work.",
};

export default async function ServicesPage() {
  const catalogue = await getCatalogue();
  return (
    <>
      <SiteHeader />
      <main>
        {/* useSearchParams needs a Suspense boundary to keep the rest of the page static. */}
        <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-12 text-ink-5">Loading…</div>}>
          <CatalogueBrowser catalogue={catalogue} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
