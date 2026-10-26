import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Installed — GRC Department",
  robots: { index: false },
};

/**
 * Where Slack returns a client after they approve the app.
 *
 * Everything on it comes from the query string the backend builds, because by the time anyone
 * reaches this page the work is already done — the channels exist and the welcome card has
 * been posted. The page's only job is to say so and point at Slack.
 *
 * It handles the unhappy paths too. A client who pressed Cancel, or whose workspace refused a
 * channel, lands here exactly as a successful one does, and a page that only knows how to say
 * "all done" would be lying to them at the worst possible moment.
 */

const PROBLEMS: Record<string, string> = {
  access_denied: "You cancelled at the Slack screen, so nothing was installed. You can try again whenever you like.",
  bad_state: "That installation link did not come from us, or it has been altered. Please start again.",
  no_signup: "We could not match that to a sign-up. Please start again.",
  no_code: "Slack did not send us back what we needed. Please try again.",
  install_failed: "Something went wrong after Slack approved the app. We have been told; please try again.",
  invalid_code: "That installation link had already been used. Please start again.",
};

const CHANNEL_NAMES: Record<string, string> = {
  grc: "#grc",
  "grc-leadership": "#grc-leadership",
  "grc-incidents": "#grc-incidents",
};

export default async function InstalledPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const one = (k: string) => (Array.isArray(params[k]) ? params[k][0] : params[k]) ?? "";

  const error = one("error");
  const workspace = one("workspace");
  const channels = one("channels").split(",").filter(Boolean);
  const partial = one("partial").split(",").filter(Boolean);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-16">
        {error ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-5">
              Not installed
            </p>
            <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
              That didn’t finish.
            </h1>
            <p className="mt-4 max-w-2xl leading-relaxed text-ink-4">
              {PROBLEMS[error] ??
                "Slack refused the installation. Nothing was added to your workspace."}
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-base font-semibold text-white transition hover:opacity-90"
            >
              Start again
            </Link>
            {/* Named rather than hidden: it is the one thing that tells us what went wrong. */}
            <p className="mt-6 text-xs text-ink-5">
              Reference: <code className="font-mono">{error}</code>
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Installed
            </p>
            <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
              Done. Now open Slack.
            </h1>
            <p className="mt-4 max-w-2xl leading-relaxed text-ink-4">
              A welcome message is waiting for you in your direct messages
              {workspace ? ` in ${workspace}` : ""}. Open it and press{" "}
              <strong className="font-semibold text-ink">Start onboarding</strong> — that is
              everything you need to do next. You will not need this website again.
            </p>

            {channels.length > 0 && (
              <div className="mt-10 max-w-xl rounded-xl border border-line bg-white p-6">
                <p className="text-sm font-semibold text-ink">Created in your workspace</p>
                <ul className="mt-3 space-y-1.5">
                  {channels.map((c) => (
                    <li key={c} className="font-mono text-sm text-ink-4">
                      {CHANNEL_NAMES[c] ?? `#${c}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {partial.length > 0 && (
              <div className="mt-6 max-w-xl rounded-xl border border-line-strong bg-sunken p-6">
                <p className="text-sm font-semibold text-ink">One thing to look at</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-4">
                  Your Slack would not let us create{" "}
                  {partial.map((c) => CHANNEL_NAMES[c] ?? `#${c}`).join(" or ")}. Everything else
                  is set up and your department is running — we will sort this out with you, and
                  you do not need to do anything now.
                </p>
              </div>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
