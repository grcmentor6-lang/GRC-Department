"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Wordmark } from "./wordmark";

/**
 * The signed-in shell shared by the client and consultant portals — the same shape as grcmentor's
 * own app (web/src/components/app/app-shell.tsx): a full-height sidebar with the section list, a
 * top bar with the page title and the account, and the content beside it. The marketing header and
 * footer stay on the public pages; once you are signed in you are in an application, not a website.
 *
 * Sections are chosen with `?view=`, so each has its own URL (reload, back button and a shared link
 * all land on the same section) while the portal's data is loaded once for the whole shell.
 */

export type IconName = "overview" | "briefcase" | "tasks" | "clock" | "wallet" | "timesheet" | "activity" | "user" | "chat";

const PATHS: Record<IconName, string> = {
  overview: "M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z",
  briefcase: "M3 7h18v13H3zM8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18",
  tasks: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  wallet: "M3 7h18v13H3zM3 7l3-4h12l3 4M16 14h.01",
  timesheet: "M8 2v4M16 2v4M3 8h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM8 13l2 2 4-4",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  user: "M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z",
  chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
};

export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`shrink-0 ${className}`}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

export interface ShellNavItem {
  key: string;
  label: string;
  icon: IconName;
  /** A count worth acting on — deliverables to review, weeks awaiting approval. */
  badge?: number;
}

export function PortalShell({
  portal,
  basePath,
  nav,
  active,
  title,
  subtitle,
  user,
  onSignOut,
  actions,
  children,
}: {
  portal: string;
  basePath: string;
  nav: ShellNavItem[];
  active: string;
  title: string;
  subtitle?: string;
  user: { name: string; initials: string; detail?: string };
  onSignOut: () => void;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const href = (key: string) => (key === nav[0].key ? basePath : `${basePath}?view=${key}`);

  const sidebar = (
    <>
      {/* The same height and the same two lines as the main header beside it, so the rule under
          each one is a single line across the page rather than two at slightly different heights. */}
      <div className="flex h-[68px] shrink-0 flex-col justify-center border-b border-line px-5">
        <Link href="/" className="focus-ring -my-0.5 rounded text-[17px] leading-tight">
          <Wordmark />
        </Link>
        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-ink-5">{portal}</p>
      </div>
      {/* min-h-0 lets this scroll instead of pushing the account block off a short screen. */}
      <nav aria-label={portal} className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {nav.map((item) => {
          const on = item.key === active;
          return (
            <Link
              key={item.key}
              href={href(item.key)}
              onClick={() => setMenuOpen(false)}
              aria-current={on ? "page" : undefined}
              // shrink-0, or a short window squeezes the rows instead of scrolling them.
              className={`focus-ring flex h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-[13.5px] transition-colors ${
                on ? "bg-accent-tint font-medium text-accent" : "text-ink-4 hover:bg-sunken hover:text-ink"
              }`}
            >
              <Icon name={item.icon} />
              <span className="flex-1 truncate">{item.label}</span>
              {!!item.badge && (
                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-md px-1.5 text-[11px] font-semibold ${
                    on ? "bg-accent text-white" : "bg-muted text-ink-3"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="shrink-0 border-t border-line p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-[12px] font-semibold text-white">
            {user.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{user.name}</p>
            {user.detail && <p className="truncate text-xs text-ink-5">{user.detail}</p>}
          </div>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="focus-ring mt-3 w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm font-semibold text-ink hover:bg-sunken"
        >
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-line bg-surface md:flex">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="absolute inset-0 bg-ink/40" />
          <aside className="absolute inset-y-0 left-0 flex w-[260px] flex-col bg-surface shadow-2xl">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-[68px] items-center gap-3 border-b border-line bg-paper/95 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="focus-ring rounded-lg border border-line-strong px-2.5 py-1.5 text-sm font-semibold text-ink md:hidden"
          >
            Menu
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-[-0.02em] text-ink">{title}</h1>
            {subtitle && <p className="truncate text-xs text-ink-5">{subtitle}</p>}
          </div>
          <div className="ml-auto flex items-center gap-2">{actions}</div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
