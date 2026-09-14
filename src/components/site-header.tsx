import Link from "next/link";
import { Wordmark } from "./wordmark";

// The mockup's navigation, in its order.
const NAV = [
  { href: "/talent", label: "Browse talent" },
  { href: "/services", label: "Services" },
  { href: "/#practice-areas", label: "Practice areas" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/consultants", label: "For consultants" },
];

/**
 * The lineage strip above the nav is load-bearing copy, not decoration: it is the one line that
 * explains why a training platform is sending you to a staffing site, and the mockup puts it
 * above everything else on every page.
 *
 * Below `lg` the nav collapses into a native <details> menu — no JavaScript, keyboard and screen
 * reader behaviour for free, and it works before hydration.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-line bg-ink text-[13px] text-white/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2">
          <span className="font-semibold text-white">grcmentor</span>
          <span>trains and assesses</span>
          <span aria-hidden className="text-accent">
            →
          </span>
          <span className="font-semibold text-white">grcdepartment</span>
          <span>places them on client engagements.</span>
          <a
            href="https://grcmentor.app"
            className="focus-ring ml-auto rounded underline decoration-white/30 underline-offset-4 hover:text-white"
          >
            Visit grcmentor.ai
          </a>
        </div>
      </div>

      <div className="border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
          <Link href="/" className="focus-ring rounded text-xl">
            <Wordmark />
          </Link>

          <nav className="hidden items-center gap-5 text-sm text-ink-4 lg:flex" aria-label="Main">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="focus-ring rounded hover:text-ink">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 text-sm">
            <Link
              href="/consultant-portal"
              className="focus-ring hidden rounded-lg px-3 py-2 text-ink-4 hover:text-ink sm:block"
            >
              Consultant portal
            </Link>
            <Link href="/portal" className="focus-ring hidden rounded-lg px-3 py-2 text-ink-4 hover:text-ink sm:block">
              Client portal
            </Link>
            <Link
              href="/brief"
              className="focus-ring ml-1 rounded-lg bg-accent px-3.5 py-2 font-semibold text-white hover:bg-accent-dark"
            >
              Submit a brief
            </Link>

            <details className="relative lg:hidden">
              <summary className="focus-ring ml-1 cursor-pointer list-none rounded-lg border border-line-strong px-3 py-2 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                Menu
              </summary>
              <nav
                aria-label="Main"
                className="absolute right-0 mt-2 w-56 rounded-xl border border-line bg-surface p-2 shadow-lg"
              >
                {[...NAV, { href: "/consultant-portal", label: "Consultant portal" }, { href: "/portal", label: "Client portal" }].map(
                  (item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="focus-ring block rounded-lg px-3 py-2 text-ink-3 hover:bg-sunken hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  ),
                )}
              </nav>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
}
