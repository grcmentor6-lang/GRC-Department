import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Terms of use — GRC Department",
  description: "The terms that govern using grcdepartment.com and the client portal.",
};

/**
 * Terms for using the website and portal — deliberately not the engagement agreement, which is
 * the signed contract for paid work and says different things about liability, IP and payment.
 * Not reviewed by a lawyer; whoever owns that should read this before it carries real weight.
 */
const SECTIONS: { h: string; p: string[] }[] = [
  {
    h: "What these terms cover",
    p: [
      "These terms govern your use of grcdepartment.com and the client portal on it. They are not the agreement under which we do paid work: that is the engagement agreement you sign for a specific piece of work, and where the two differ on an engagement, the engagement agreement wins.",
      "By opening an account you accept these terms on behalf of the organisation you name.",
    ],
  },
  {
    h: "Your account",
    p: [
      "Keep your sign-in details to yourself and tell us promptly if you think somebody else has them. Anyone you invite into your organisation can see its requests and engagements, accept deliverables and approve timesheets, so invite deliberately.",
      "Approving hours or accepting a deliverable in the portal is a decision with commercial effect under your engagement agreement. Approved hours become payable.",
      "You are responsible for what is submitted from your account.",
    ],
  },
  {
    h: "Briefs, proposals and prices",
    p: [
      "A brief or a scoping request is a request, not an order, and carries no obligation on either side. Nothing is chargeable until you accept a written proposal.",
      "Prices are agreed in that proposal before work starts. Anything shown elsewhere on this site is indicative.",
    ],
  },
  {
    h: "What we do not do",
    p: [
      "We prepare organisations for assessment and support audits. We do not issue audit opinions or certifications: that remains with your licensed audit or certification body.",
      "Material on this site is general information about our services, not legal or regulatory advice on your circumstances.",
    ],
  },
  {
    h: "Connecting Slack",
    p: [
      "Connecting your Slack workspace is optional. By connecting one you confirm you are permitted to install applications in it.",
      "We create a channel and post engagement updates to it. Removing the application, and with it our access, is done in Slack by whoever administers the workspace.",
    ],
  },
  {
    h: "Confidentiality",
    p: [
      "What you send us about your organisation is treated as confidential and used only to scope and deliver your work. The engagement agreement sets out the full terms, including any non-disclosure obligations.",
    ],
  },
  {
    h: "Availability",
    p: [
      "We aim to keep the site and portal available but do not guarantee uninterrupted service. We may change or withdraw features, and we will not remove something an active engagement depends on without telling the clients who rely on it.",
    ],
  },
  {
    h: "Acceptable use",
    p: [
      "Do not attempt to access data that is not yours, disrupt the service, or use it to break the law. We may suspend an account that does.",
      "Security researchers are welcome: tell us what you have found through the contact form before disclosing it anywhere else, and we will work with you.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Terms</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Terms of use</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-3">
          The rules for using this site and the client portal. The work itself is governed by your
          engagement agreement.
        </p>

        <div className="mt-10 space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h2 className="text-xl font-semibold text-ink">{s.h}</h2>
              {s.p.map((line) => (
                <p key={line} className="mt-3 leading-relaxed text-ink-3">
                  {line}
                </p>
              ))}
            </section>
          ))}
        </div>

        <p className="mt-12 border-t border-line pt-6 text-sm text-ink-5">
          How we handle personal data is set out in our{" "}
          <Link href="/privacy" className="focus-ring rounded text-accent underline underline-offset-4">
            privacy notice
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
