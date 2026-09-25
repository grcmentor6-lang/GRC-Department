"use client";

import { useEffect, useState } from "react";
import { getSignupPlatforms, signupWithUrl } from "@/lib/portal";

/**
 * "Sign up with Slack" and "Sign up with Microsoft Teams", under the email form on both account
 * pages.
 *
 * The button does more than identify somebody: approving it installs GRC Department in their
 * workspace, which is what lets us open their channel and post engagement updates later. The
 * caption says so, because a person expecting a login button should not discover afterwards that
 * they have added an app to their company's Slack.
 *
 * A platform with no credentials configured is shown disabled rather than hidden, so the choice
 * is visible and its absence is explained.
 */

type Platform = { platform: "slack" | "teams"; label: string; available: boolean };

const LOGOS: Record<string, React.ReactNode> = {
  slack: (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path fill="#E01E5A" d="M5.1 15.2a2.1 2.1 0 1 1-2.1-2.1h2.1zM6.2 15.2a2.1 2.1 0 0 1 4.2 0v5.3a2.1 2.1 0 0 1-4.2 0z" />
      <path fill="#36C5F0" d="M8.3 5.1a2.1 2.1 0 1 1 2.1-2.1v2.1zM8.3 6.2a2.1 2.1 0 0 1 0 4.2H3a2.1 2.1 0 0 1 0-4.2z" />
      <path fill="#2EB67D" d="M18.9 8.3a2.1 2.1 0 1 1 2.1 2.1h-2.1zM17.8 8.3a2.1 2.1 0 0 1-4.2 0V3a2.1 2.1 0 0 1 4.2 0z" />
      <path fill="#ECB22E" d="M15.7 18.9a2.1 2.1 0 1 1-2.1 2.1v-2.1zM15.7 17.8a2.1 2.1 0 0 1 0-4.2H21a2.1 2.1 0 0 1 0 4.2z" />
    </svg>
  ),
  teams: (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <rect x="2" y="6" width="12" height="12" rx="2" fill="#5059C9" />
      <path fill="#fff" d="M5 9h6v1.4H8.8V15H7.2v-4.6H5z" />
      <circle cx="18" cy="7" r="2.4" fill="#7B83EB" />
      <path fill="#7B83EB" d="M15.4 10.5H21a1 1 0 0 1 1 1v3.6a3.6 3.6 0 0 1-3.6 3.6 3.6 3.6 0 0 1-3.6-3.6z" />
    </svg>
  ),
};

export function SignUpWith({ verb = "Sign up" }: { verb?: "Sign up" | "Sign in" }) {
  const [platforms, setPlatforms] = useState<Platform[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setPlatforms((await getSignupPlatforms()).platforms);
      } catch {
        setPlatforms([]); // the email form still works; offering nothing beats offering a broken button
      }
    })();
  }, []);

  if (!platforms?.length) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-5">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="mt-4 grid gap-2">
        {platforms.map((p) =>
          p.available ? (
            <a
              key={p.platform}
              href={signupWithUrl(p.platform)}
              className="focus-ring flex items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-ink hover:bg-sunken"
            >
              {LOGOS[p.platform]}
              {verb} with {p.label}
            </a>
          ) : (
            <span
              key={p.platform}
              aria-disabled
              title={`${p.label} is not available yet`}
              className="flex items-center justify-center gap-2 rounded-lg border border-line bg-sunken px-4 py-2.5 text-sm font-semibold text-faint"
            >
              {LOGOS[p.platform]}
              {verb} with {p.label}
              <span className="text-xs font-normal">· soon</span>
            </span>
          ),
        )}
      </div>

      <p className="mt-3 text-center text-xs leading-relaxed text-ink-5">
        Approving this adds GRC Department to your workspace and creates a channel for your
        engagement updates. Nothing is posted there until your first engagement starts.
      </p>
    </div>
  );
}
