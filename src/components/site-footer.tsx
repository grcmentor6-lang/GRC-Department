import Link from "next/link";
import { CONSULTANTS_ENABLED } from "@/lib/flags";
import { Wordmark } from "./wordmark";

const CLIENTS = {
  title: "Clients",
  links: [
    { href: "/brief", label: "Submit a brief" },
    { href: "/services", label: "Service catalogue" },
    { href: "/portal/signup", label: "Create an account" },
    { href: "/portal", label: "Client portal" },
    { href: "/#engagement-models", label: "Engagement models" },
    ...(CONSULTANTS_ENABLED
      ? [
          { href: "/talent", label: "Browse talent" },
          { href: "/#vetting", label: "Vetting process" },
        ]
      : []),
  ],
};

const CONSULTANTS = {
  title: "Consultants",
  links: [
    { href: "/consultants#apply", label: "Apply for listing" },
    { href: "/consultants#requirements", label: "Listing requirements" },
    { href: "/consultant-portal", label: "Consultant portal" },
    { href: "https://grcmentor.app", label: "grcmentor.ai programme" },
  ],
};

const COLUMNS = CONSULTANTS_ENABLED ? [CLIENTS, CONSULTANTS] : [CLIENTS];

// ponytail: the mockup's footer also links Terms of engagement, Privacy notice and Sub-processors.
// None of those documents exists, and a link to an empty legal page is worse than no link — add
// them with the real text before taking a paying client.
export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className={`mx-auto grid max-w-6xl gap-10 px-4 py-14 ${CONSULTANTS_ENABLED ? "md:grid-cols-[2fr_1fr_1fr]" : "md:grid-cols-[2fr_1fr]"}`}>
        <div>
          <Link href="/" className="focus-ring rounded text-xl">
            <Wordmark />
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-5">
            {CONSULTANTS_ENABLED
              ? "Remote governance, risk and compliance practitioners, placed with organisations worldwide. The talent network of grcmentor.ai."
              : "Scoped governance, risk and compliance services — assessments, policies, testing and programmes — delivered remotely within your working hours."}
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-3">{col.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="focus-ring rounded hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-5 text-xs text-ink-5">
          <span>© {new Date().getFullYear()} GRC Department.</span>
          {/* It answers "are these your employees", so it belongs on every page — but only while
              there are listed consultants for it to describe. */}
          {CONSULTANTS_ENABLED && <span>All consultants engaged as independent practitioners.</span>}
        </div>
      </div>
    </footer>
  );
}
