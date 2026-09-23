import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ChatCardGallery } from "@/components/chat-cards";

export const metadata: Metadata = {
  title: "Your engagement in Slack or Teams — GRC Department",
  description:
    "Updates, approvals and evidence requests arrive in your own Slack or Microsoft Teams: six messages over the life of an engagement, each asking for one thing.",
};

const RULES = [
  {
    title: "One message, one action",
    body: "Each message asks for exactly one thing — accept, approve, upload. Everything else is a link. Nobody has to work out what is expected of them.",
  },
  {
    title: "Hours and dates, never rates",
    body: "Chat messages show hours worked against hours planned. Pricing stays where it belongs: in your engagement agreement and your invoices.",
  },
  {
    title: "The right people, not everyone",
    body: "Progress goes to the channel. Timesheets, evidence requests and escalations are direct messages to the people who own them.",
  },
];

export default function SlackAndTeamsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-line bg-surface">
          <div className="mx-auto max-w-4xl px-4 py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Working together</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Your engagement, in Slack or Teams
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-3">
              An engagement usually runs on status meetings and chased emails. Ours runs in the chat tool your team
              already has open. We open one channel for the engagement and post six messages over its life — a kickoff,
              a deliverable, a weekly digest, a timesheet, an evidence request and, if something is late, an
              escalation.
            </p>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-3">
              Your side approves a week of hours or accepts a deliverable without signing into anything. Everything
              still lands in your client portal, so the record does not live in a chat history.
            </p>
          </div>
        </section>

        <section className="border-b border-line">
          <div className="mx-auto grid max-w-4xl gap-6 px-4 py-12 sm:grid-cols-3 *:min-w-0">
            {RULES.map((r) => (
              <div key={r.title}>
                <h2 className="font-semibold text-ink">{r.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-4">{r.body}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 pt-10">
          <p className="rounded-lg border border-line bg-sunken px-4 py-3 text-sm text-ink-4">
            <span className="font-semibold text-ink-2">An illustrated example.</span> The engagement, names, dates and
            reference numbers below are made up to show the shape of the messages. Previews approximate each host;
            final spacing and button colours are set by Slack and Microsoft Teams.
          </p>
        </div>

        <ChatCardGallery />

        <section className="border-t border-line bg-surface">
          <div className="mx-auto max-w-4xl px-4 py-14">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">If you do not use either</h2>
            <p className="mt-3 max-w-2xl text-ink-3">
              Nothing is lost. The same six messages arrive by email, and every one of them is also a record in your
              client portal — deliverables to accept, timesheets to approve, evidence still owed. The chat channel is a
              convenience, never the system of record.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/brief"
                className="focus-ring rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
              >
                Submit a brief
              </Link>
              <Link
                href="/services"
                className="focus-ring rounded-lg border border-line-strong px-5 py-2.5 text-sm font-semibold text-ink-2 hover:border-rule"
              >
                Browse the catalogue
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
