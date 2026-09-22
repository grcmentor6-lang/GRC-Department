import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-ink">This page does not exist.</h1>
        <p className="mt-3 max-w-xl leading-relaxed text-ink-4">
          The link may be out of date, or the address mistyped. Everything we offer starts from the catalogue or a brief.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="focus-ring rounded-lg bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-dark">
            Go to the home page
          </Link>
          <Link
            href="/services"
            className="focus-ring rounded-lg border border-line-strong bg-surface px-5 py-3 font-semibold text-ink hover:bg-sunken"
          >
            Browse the catalogue
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
