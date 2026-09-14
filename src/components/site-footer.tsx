import Link from "next/link";
import { Wordmark } from "./wordmark";

const COLUMNS = [
  {
    title: "Clients",
    links: [
      { href: "/brief", label: "Submit a brief" },
      { href: "/portal", label: "Client portal" },
      { href: "/services", label: "Service catalogue" },
      { href: "/talent", label: "Browse talent" },
      { href: "/#engagement-models", label: "Engagement models" },
      { href: "/#vetting", label: "Vetting process" },
    ],
  },
  {
    title: "Consultants",
    links: [
      { href: "/consultants#apply", label: "Apply for listing" },
      { href: "/consultants#requirements", label: "Listing requirements" },
      { href: "/consultant-portal", label: "Consultant portal" },
      { href: "https://grcmentor.app", label: "grcmentor.ai programme" },
    ],
  },
];

// ponytail: the mockup's footer also links Terms of engagement, Privacy notice and Sub-processors.
// None of those documents exists, and a link to an empty legal page is worse than no link — add
// them with the real text before taking a paying client.
export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Link href="/" className="focus-ring rounded text-xl">
            <Wordmark />
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-5">
            Remote governance, risk and compliance practitioners, placed with organisations
            worldwide. The talent network of grcmentor.ai.
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
          {/* Not boilerplate: it is the answer to "are these your employees", and it has to be
              on every page because it is a term of every engagement. */}
          <span>All consultants engaged as independent practitioners.</span>
        </div>
      </div>
    </footer>
  );
}
