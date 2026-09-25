import type { ReactNode } from "react";
import Link from "next/link";
import { Wordmark } from "./wordmark";

/**
 * The frame every client account screen sits in — sign in, sign up, confirm, reset, join.
 *
 * Deliberately **not** the public header and footer. Those carry a catalogue, engagement models
 * and a "create account" button, which is the marketing site talking to a stranger; somebody
 * signing in to their own portal is not a stranger and is not shopping. The portal is its own
 * place, and the only way back out is the one link that says so.
 */
export function PortalFrame({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-baseline gap-3">
            <Link href="/portal" className="focus-ring rounded text-xl">
              <Wordmark />
            </Link>
            <span className="hidden text-sm text-ink-5 sm:inline">Client portal</span>
          </div>
          <Link href="/" className="focus-ring rounded text-sm text-ink-5 hover:text-ink">
            ← grcdepartment.com
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-12">
        <div className={`mx-auto ${wide ? "max-w-xl" : "max-w-md"}`}>{children}</div>
      </main>

      <footer className="border-t border-line px-4 py-5">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-5">
          <span>© {new Date().getFullYear()} GRC Department</span>
          <Link href="/terms" className="focus-ring rounded hover:text-ink">
            Terms of use
          </Link>
          <Link href="/privacy" className="focus-ring rounded hover:text-ink">
            Privacy notice
          </Link>
        </div>
      </footer>
    </div>
  );
}
