import Link from "next/link";
import { Wordmark } from "./wordmark";

const NAV = [
  { href: "/services", label: "Services" },
  { href: "/talent", label: "Browse talent" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/consultants", label: "For consultants" },
];

/**
 * The lineage strip above the nav is load-bearing copy, not decoration: it is the one line that
 * explains why a training platform is sending you to a staffing site, and the mockup puts it
 * above everything else on every page.
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

          <nav className="hidden items-center gap-5 text-sm text-ink-4 md:flex">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="focus-ring rounded hover:text-ink">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 text-sm">
            <Link
              href="/portal"
              className="focus-ring hidden rounded-lg px-3 py-2 text-ink-4 hover:text-ink sm:block"
            >
              Client portal
            </Link>
            <Link
              href="/brief"
              className="focus-ring rounded-lg bg-accent px-3.5 py-2 font-semibold text-white hover:bg-accent-dark"
            >
              Submit a brief
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
