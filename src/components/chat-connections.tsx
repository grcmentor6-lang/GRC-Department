"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ApiError } from "@/lib/api";
import {
  createChatChannel,
  disconnectChat,
  getChatPlatforms,
  startChatConnect,
  type ChatPlatform,
} from "@/lib/portal";

/**
 * Connect the client's own Slack workspace or Microsoft Teams tenant.
 *
 * Connection only: nothing is posted yet, and the panel says so rather than implying messages
 * start arriving. Authorising happens on the platform's own consent screen — we send the client
 * there and they come back to this view with `?chat=<platform>&status=<outcome>`.
 */

const OUTCOME: Record<string, { tone: "good" | "bad"; text: string }> = {
  connected: { tone: "good", text: "Connected. Nothing is posted yet — we will tell you before anything is." },
  cancelled: { tone: "bad", text: "The authorisation was cancelled, so nothing changed." },
  expired: { tone: "bad", text: "That took too long and the request expired. Start it again." },
  failed: { tone: "bad", text: "The connection could not be completed. Try again, and tell us if it keeps failing." },
};

const SLACK_LOGO = (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
    <path fill="#E01E5A" d="M5.1 15.2a2.1 2.1 0 1 1-2.1-2.1h2.1zM6.2 15.2a2.1 2.1 0 0 1 4.2 0v5.3a2.1 2.1 0 0 1-4.2 0z" />
    <path fill="#36C5F0" d="M8.3 5.1a2.1 2.1 0 1 1 2.1-2.1v2.1zM8.3 6.2a2.1 2.1 0 0 1 0 4.2H3a2.1 2.1 0 0 1 0-4.2z" />
    <path fill="#2EB67D" d="M18.9 8.3a2.1 2.1 0 1 1 2.1 2.1h-2.1zM17.8 8.3a2.1 2.1 0 0 1-4.2 0V3a2.1 2.1 0 0 1 4.2 0z" />
    <path fill="#ECB22E" d="M15.7 18.9a2.1 2.1 0 1 1-2.1 2.1v-2.1zM15.7 17.8a2.1 2.1 0 0 1 0-4.2H21a2.1 2.1 0 0 1 0 4.2z" />
  </svg>
);

const TEAMS_LOGO = (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
    <rect x="2" y="6" width="12" height="12" rx="2" fill="#5059C9" />
    <path fill="#fff" d="M5 9h6v1.4H8.8V15H7.2v-4.6H5z" />
    <circle cx="18" cy="7" r="2.4" fill="#7B83EB" />
    <path fill="#7B83EB" d="M15.4 10.5H21a1 1 0 0 1 1 1v3.6a3.6 3.6 0 0 1-3.6 3.6 3.6 3.6 0 0 1-3.6-3.6z" />
  </svg>
);

export function ChatConnections() {
  const router = useRouter();
  const params = useSearchParams();
  const outcome = OUTCOME[params.get("status") ?? ""];

  const [platforms, setPlatforms] = useState<ChatPlatform[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setPlatforms((await getChatPlatforms()).platforms);
    } catch {
      setError("Could not load your connections.");
    }
  }, []);

  useEffect(() => {
    // Async, like the rest of the portal: a synchronous setState in an effect cascades renders.
    (async () => {
      await load();
    })();
  }, [load]);

  const connect = async (platform: string) => {
    setBusy(platform);
    setError(null);
    try {
      // The platform's consent screen, in this tab: it comes back to the portal either way.
      window.location.assign((await startChatConnect(platform)).url);
    } catch {
      setError("Could not start the connection. Try again.");
      setBusy(null);
    }
  };

  const remove = async (platform: string, label: string) => {
    if (!window.confirm(`Disconnect ${label}? We will stop posting there.`)) return;
    setBusy(platform);
    setError(null);
    try {
      await disconnectChat(platform);
      router.replace("/portal/dashboard?view=connections");
      await load();
    } catch {
      setError("Could not disconnect. Try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      {outcome && (
        <p
          className={`rounded-lg border px-4 py-3 text-sm ${
            outcome.tone === "good"
              ? "border-positive-line bg-positive-tint text-positive"
              : "border-line-strong bg-sunken text-ink-3"
          }`}
        >
          {outcome.text}
        </p>
      )}

      <div className="rounded-xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink">Where we reach your team</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-4">
          Connect the chat tool your team already uses and engagement updates can arrive there instead of
          only by email — the kickoff, a deliverable ready for review, the weekly digest, timesheets,
          evidence requests and anything overdue.{" "}
          <Link href="/slack-and-teams" className="focus-ring rounded text-accent underline underline-offset-4">
            See what those messages look like
          </Link>
          .
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-5">
          Connecting only grants permission. Nothing is posted until you have a live engagement, and we
          will tell you before the first message goes out. Email and this portal keep working either way.
        </p>
      </div>

      {error && <p className="rounded-lg border border-line-strong bg-sunken px-4 py-3 text-sm text-ink-3">{error}</p>}

      {platforms === null ? (
        <p className="text-sm text-ink-5">Loading…</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 *:min-w-0">
          {platforms.map((p) => (
            <li key={p.platform} className="rounded-xl border border-line bg-surface p-5">
              <div className="flex items-center gap-2">
                {p.platform === "slack" ? SLACK_LOGO : TEAMS_LOGO}
                <h3 className="font-semibold text-ink">{p.label}</h3>
                {p.connected && (
                  <span className="ml-auto rounded-full border border-positive-line bg-positive-tint px-2 py-0.5 text-xs text-positive">
                    Connected
                  </span>
                )}
              </div>

              {p.connected ? (
                <>
                  <p className="mt-3 text-sm text-ink-2">{p.workspace_name}</p>
                  <p className="mt-0.5 text-xs text-ink-5">
                    Authorised by {p.connected_by}
                    {p.connected_at ? ` on ${new Date(p.connected_at).toLocaleDateString("en-GB")}` : ""}
                  </p>
                  {p.platform === "slack" && <SlackChannel platform={p} onDone={load} />}

                  <button
                    type="button"
                    onClick={() => void remove(p.platform, p.label)}
                    disabled={busy === p.platform}
                    className="focus-ring mt-4 rounded-lg border border-line-strong px-3 py-1.5 text-sm font-semibold text-ink-2 hover:border-rule disabled:opacity-60"
                  >
                    {busy === p.platform ? "Disconnecting…" : "Disconnect"}
                  </button>
                  <p className="mt-3 text-xs leading-relaxed text-ink-5">
                    Disconnecting stops us posting. The channel stays, and removing the app itself is done
                    in {p.label}, by whoever administers it.
                  </p>
                </>
              ) : p.available ? (
                <>
                  <p className="mt-3 text-sm leading-relaxed text-ink-4">
                    You will be sent to {p.label} to approve this. Some workspaces need an administrator to
                    do it.
                  </p>
                  <button
                    type="button"
                    onClick={() => void connect(p.platform)}
                    disabled={busy !== null}
                    className="focus-ring mt-4 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
                  >
                    {busy === p.platform ? "Opening…" : `Connect ${p.label}`}
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-3 text-sm leading-relaxed text-ink-4">
                    Not available yet. Tell us if this is the one your team uses and we will prioritise it.
                  </p>
                  <span className="mt-4 inline-block rounded-lg border border-line bg-sunken px-3.5 py-2 text-sm font-semibold text-ink-5">
                    Coming soon
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * The engagement channel. One per connection: once it exists the card shows it and offers a way
 * in, rather than a button that would make a second one.
 */
function SlackChannel({ platform, onDone }: { platform: ChatPlatform; onDone: () => Promise<void> }) {
  const [name, setName] = useState("grc-department");
  const [isPrivate, setPrivate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  if (platform.channel) {
    return (
      <div className="mt-4 rounded-lg border border-line bg-paper p-3">
        <p className="text-sm text-ink-2">
          Channel <span className="font-medium text-ink">#{platform.channel.name}</span>
        </p>
        <a
          href={platform.channel.url}
          target="_blank"
          rel="noreferrer"
          className="focus-ring mt-1 inline-block rounded text-sm text-accent underline underline-offset-4"
        >
          Open it in Slack
        </a>
      </div>
    );
  }

  const create = async () => {
    setBusy(true);
    setProblem(null);
    try {
      await createChatChannel("slack", name, isPrivate);
      await onDone();
    } catch (err) {
      // The API's own sentence — "a channel with that name already exists", and the rest — is
      // more use to the client than anything generic we could write here.
      setProblem(err instanceof ApiError ? err.message : "The channel could not be created. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-line bg-paper p-3">
      <label htmlFor="ch-name" className="text-sm font-medium text-ink">
        Create a channel
      </label>
      <p className="mt-1 text-xs leading-relaxed text-ink-5">
        We will make it in your workspace and post one message so you can see it works.
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-sm text-ink-5">#</span>
        <input
          id="ch-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="focus-ring min-w-0 flex-1 rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-sm text-ink"
        />
      </div>
      <label className="mt-2 flex items-center gap-2 text-xs text-ink-4">
        <input type="checkbox" checked={isPrivate} onChange={(e) => setPrivate(e.target.checked)} />
        Make it private
      </label>
      {problem && <p className="mt-2 text-xs text-ink-3">{problem}</p>}
      <button
        type="button"
        onClick={() => void create()}
        disabled={busy || !name.trim()}
        className="focus-ring mt-3 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
      >
        {busy ? "Creating…" : "Create channel"}
      </button>
    </div>
  );
}
