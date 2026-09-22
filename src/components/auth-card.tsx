import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/** The page frame every client account screen shares: public header, one centred card, footer. */
export function AuthCard({ title, intro, children, wide = false }: { title: string; intro?: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto px-4 py-12">
        <div className={`mx-auto ${wide ? "max-w-xl" : "max-w-md"}`}>
          <div className="rounded-xl border border-line bg-surface p-7">
            <h1 className="text-xl font-semibold tracking-[-0.02em] text-ink">{title}</h1>
            {intro && <div className="mt-2 text-sm leading-relaxed text-ink-4">{intro}</div>}
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

/** Success / neutral notice inside an auth card. */
export function Notice({ tone = "info", children }: { tone?: "info" | "error"; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${
        tone === "error" ? "border-line-strong bg-sunken text-ink-2" : "border-positive-line bg-positive-tint text-ink-2"
      }`}
    >
      {children}
    </div>
  );
}
