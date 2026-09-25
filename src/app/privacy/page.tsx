import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy notice — GRC Department",
  description: "What personal data GRC Department collects, why, who it is shared with and how long it is kept.",
};

/**
 * Written from what the system actually does — the fields the sign-up form collects, the emails
 * the backend sends, the processors it calls — rather than from a template. It has not been
 * reviewed by a lawyer; the dates and the controller's details still need filling in by whoever
 * owns that, and this file is the place to do it.
 */
const SECTIONS: { h: string; p: string[] }[] = [
  {
    h: "Who we are",
    p: [
      "GRC Department provides governance, risk and compliance services to organisations. This notice covers grcdepartment.com and the client portal on it.",
      "For the personal data described here we are the controller. For anything inside the material a client sends us during an engagement, the client is the controller and we act on their instructions under the engagement agreement.",
    ],
  },
  {
    h: "What we collect, and why",
    p: [
      "When you create an account we collect your name, work email address, job title if you give one, your organisation's name and the business-hours region you choose. We need these to open the account, to staff an engagement that overlaps your working day, and to address you correctly.",
      "When you submit a brief or a scoping request we collect what you write in it, including the framework, timing and the services you select. We use it to prepare a proposal.",
      "If you sign up with Slack, Slack tells us your name, your email address and the workspace you approved. We do not receive your Slack password, and we do not read your conversations.",
      "Our server records the usual request logs, which include IP addresses, so we can keep the service available and spot abuse.",
    ],
  },
  {
    h: "The legal basis",
    p: [
      "Opening your account and delivering an engagement is performance of a contract with you, or steps taken at your request before one exists.",
      "Keeping the service secure and preventing abuse is our legitimate interest. Where we are required to keep records, for example for tax or professional obligations, the basis is legal obligation.",
      "We do not use your data for advertising and we do not sell it.",
    ],
  },
  {
    h: "Who else sees it",
    p: [
      "Our hosting and database providers, who store the service and its data on our behalf.",
      "Our email provider, which delivers confirmation, notification and engagement email.",
      "Slack or Microsoft, if you choose to connect a workspace, to the extent needed to create your channel and post the updates you have asked for.",
      "The consultant assigned to your engagement, and the GRC lead scoping it, see what is needed to do the work.",
      "We do not share your data with anyone else unless the law requires it or you ask us to.",
    ],
  },
  {
    h: "How long we keep it",
    p: [
      "Your account and its requests are kept while the account is open and for as long afterwards as we need them for our records and obligations.",
      "Ask us to close your account and we will delete or anonymise what we are not required to keep, and tell you what remains and why.",
    ],
  },
  {
    h: "Your rights",
    p: [
      "You can ask for a copy of your data, ask us to correct it, ask us to delete it, object to how we use it, or ask for it in a portable form. Some of this you can do yourself in the portal under Settings.",
      "Write to us and we will answer within one month. If you are not satisfied you can complain to your data protection authority.",
    ],
  },
  {
    h: "Cookies and storage",
    p: [
      "We use no advertising or analytics cookies. Your browser stores your sign-in session so you are not asked to sign in on every page, and remembers small preferences like whether you asked to stay signed in.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Privacy</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Privacy notice</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-3">
          What we collect about you, why, who else sees it and what you can ask us to do about it.
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

          <section>
            <h2 className="text-xl font-semibold text-ink">Contact us</h2>
            <p className="mt-3 leading-relaxed text-ink-3">
              Write to us about anything in this notice, including a request about your own data, through{" "}
              <Link href="/brief" className="focus-ring rounded text-accent underline underline-offset-4">
                the contact form
              </Link>
              , and we will reply with the right address for your request.
            </p>
          </section>
        </div>

        <p className="mt-12 border-t border-line pt-6 text-sm text-ink-5">
          We will post any change to this notice on this page. If a change materially affects how we use
          your data, we will tell account holders by email.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
