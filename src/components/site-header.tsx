"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CONSULTANTS_ENABLED } from "@/lib/flags";
import { isSignedIn } from "@/lib/portal";
import { Wordmark } from "./wordmark";

type NavItem = {
  href: string;
  label: string;
  /** Path prefixes this item owns: /talent/<id> is still Browse talent, /scoping is Services. */
  match?: string[];
  /** Prefixes a more specific item owns instead: /portal/signup belongs to Create account. */
  except?: string[];
  /** Home-page section this item points at, highlighted while it is on screen. */
  section?: string;
};

// The mockup's navigation, in its order. With the consultant side switched off, the talent
// items give way to the client-facing sections of the home page.
const NAV: NavItem[] = CONSULTANTS_ENABLED
  ? [
      { href: "/talent", label: "Browse talent", match: ["/talent"] },
      { href: "/services", label: "Services", match: ["/services", "/scoping"] },
      { href: "/#practice-areas", label: "Practice areas", section: "practice-areas" },
      { href: "/#how-it-works", label: "How it works", section: "how-it-works" },
      { href: "/consultants", label: "For consultants", match: ["/consultants"] },
    ]
  : [
      { href: "/services", label: "Services", match: ["/services", "/scoping"] },
      { href: "/#how-it-works", label: "How it works", section: "how-it-works" },
      { href: "/#engagement-models", label: "Engagement models", section: "engagement-models" },
    ];

const PORTALS: NavItem[] = [
  ...(CONSULTANTS_ENABLED ? [{ href: "/consultant-portal", label: "Consultant portal", match: ["/consultant-portal"] }] : []),
  { href: "/portal", label: "Client portal", match: ["/portal"], except: ["/portal/signup"] },
];

/** Sign-up is its own call to action, not a portal link: it is what a first-time visitor needs. */
const CREATE_ACCOUNT: NavItem = { href: "/portal/signup", label: "Create account", match: ["/portal/signup"] };

const HOME_SECTIONS = NAV.flatMap((n) => (n.section ? [n.section] : []));

/** A path owns its exact route and anything beneath it, but not a sibling that shares a prefix. */
const owns = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

/**
 * Which home-page section is in the middle of the viewport. Observed rather than computed from
 * scroll offsets, so it costs nothing while idle and survives layout changes. Returns null when
 * no tracked section is on screen — the top of the page belongs to no nav item.
 */
function useSectionInView(enabled: boolean): string | null {
  const [section, setSection] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const els = HOME_SECTIONS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        // Several can overlap the band only at a boundary; the later section in page order wins.
        const current = HOME_SECTIONS.filter((id) => visible.has(id));
        setSection(current.length ? current[current.length - 1] : null);
      },
      // A thin band across the middle of the screen: a section is "current" while it crosses it.
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [enabled]);
  return enabled ? section : null;
}

/**
 * The lineage strip above the nav is load-bearing copy, not decoration: it is the one line that
 * explains why a training platform is sending you to a staffing site, and the mockup puts it
 * above everything else on every page.
 *
 * Below `lg` the nav collapses into a native <details> menu — keyboard and screen-reader
 * behaviour for free, and it works before hydration.
 */
export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const section = useSectionInView(pathname === "/");
  // Read after mount, never during render: the server has no session to look at, and rendering
  // one state then another would be a hydration mismatch.
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    (async () => {
      setSignedIn(isSignedIn());
    })();
  }, [pathname]);

  const isActive = (item: NavItem) =>
    item.section
      ? pathname === "/" && section === item.section
      : (item.match ?? []).some((m) => owns(pathname, m)) &&
        !(item.except ?? []).some((m) => owns(pathname, m));

  // Current page: accent text plus a bar under the item, and aria-current so it is announced.
  const navClass = (active: boolean) =>
    `focus-ring relative rounded py-1 transition-colors ${
      active
        ? "font-medium text-accent after:absolute after:inset-x-0 after:-bottom-[15px] after:h-0.5 after:rounded-full after:bg-accent"
        : "text-ink-4 hover:text-ink"
    }`;

  const menuClass = (active: boolean) =>
    `focus-ring block rounded-lg px-3 py-2 ${active ? "bg-accent-tint font-medium text-accent" : "text-ink-3 hover:bg-sunken hover:text-ink"}`;

  return (
    <header className="sticky top-0 z-50">
      {CONSULTANTS_ENABLED && (
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
      )}

      <div className="border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
          <Link href="/" className="focus-ring rounded text-xl" aria-current={pathname === "/" && !section ? "page" : undefined}>
            <Wordmark />
          </Link>

          <nav className="hidden items-center gap-5 text-sm lg:flex" aria-label="Main">
            {NAV.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? (item.section ? "location" : "page") : undefined}
                  className={navClass(active)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-4 text-sm">
            {PORTALS.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  // Signed in, "Client portal" means the portal itself, not its sign-in page.
                  href={signedIn && item.href === "/portal" ? "/portal/dashboard" : item.href}
                  aria-current={active ? "page" : undefined}
                  className={`hidden sm:block ${navClass(active)}`}
                >
                  {item.label}
                </Link>
              );
            })}
            {!signedIn && (
            <Link
              href={CREATE_ACCOUNT.href}
              aria-current={isActive(CREATE_ACCOUNT) ? "page" : undefined}
              className={`focus-ring hidden rounded-lg border px-3.5 py-2 font-semibold sm:block ${
                isActive(CREATE_ACCOUNT)
                  ? "border-accent bg-accent-tint text-accent"
                  : "border-line-strong text-ink-2 hover:border-rule hover:text-ink"
              }`}
            >
              {CREATE_ACCOUNT.label}
            </Link>
            )}
            <Link
              href="/brief"
              aria-current={owns(pathname, "/brief") ? "page" : undefined}
              className={`focus-ring rounded-lg bg-accent px-3.5 py-2 font-semibold text-white hover:bg-accent-dark ${
                owns(pathname, "/brief") ? "ring-2 ring-accent ring-offset-2 ring-offset-paper" : ""
              }`}
            >
              Submit a brief
            </Link>

            <details className="relative lg:hidden">
              <summary className="focus-ring cursor-pointer list-none rounded-lg border border-line-strong px-3 py-2 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                Menu
              </summary>
              <nav aria-label="Main" className="absolute right-0 mt-2 w-56 rounded-xl border border-line bg-surface p-2 shadow-lg">
                {[...NAV, ...PORTALS, CREATE_ACCOUNT].map((item) => {
                  const active = isActive(item);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={menuClass(active)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
}
