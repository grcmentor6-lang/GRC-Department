"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import {
  getOpsToken,
  opsLogin,
  opsQueue,
  opsReply,
  opsRequest,
  opsSetStatus,
  setOpsToken,
  type OpsNote,
  type OpsRequest,
} from "@/lib/ops";

/**
 * The request queue — our side, not the client's.
 *
 * One unlisted page with its own sign-in. It is not linked from anywhere, excluded from the
 * sitemap and disallowed in robots.txt, but none of that is the security: the API refuses
 * anything without an admin token, so finding the URL buys you a login form and nothing else.
 */

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  reviewing: "Reviewing",
  proposal: "Proposal sent",
  accepted: "Accepted",
  declined: "Declined",
  withdrawn: "Withdrawn by client",
};

const STATUS_TONE: Record<string, string> = {
  new: "border-accent bg-accent-tint text-accent",
  reviewing: "border-line-strong bg-sunken text-ink-3",
  proposal: "border-line-strong bg-muted text-ink-2",
  accepted: "border-positive-line bg-positive-tint text-positive",
  declined: "border-line bg-sunken text-ink-5",
  withdrawn: "border-line bg-sunken text-ink-5",
};

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const waited = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return days < 1 ? "today" : days === 1 ? "1 day" : `${days} days`;
};

function SignIn({ onIn }: { onIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await opsLogin(email, password);
      onIn();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the server.");
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-line bg-surface p-7">
        <h1 className="text-lg font-semibold text-ink">GRC Department — internal</h1>
        <p className="mt-1 text-sm text-ink-5">The request queue.</p>
        {error && (
          <p className="mt-4 rounded-lg border border-line-strong bg-sunken px-3 py-2 text-sm text-ink-2">{error}</p>
        )}
        <label htmlFor="op-email" className="mt-5 block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="op-email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="focus-ring mt-1 w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink"
        />
        <label htmlFor="op-password" className="mt-4 block text-sm font-medium text-ink">
          Password
        </label>
        <input
          id="op-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="focus-ring mt-1 w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink"
        />
        <button
          type="submit"
          disabled={busy}
          className="focus-ring mt-6 w-full rounded-lg bg-accent px-4 py-2.5 font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function Detail({ id, onChanged }: { id: string; onChanged: () => Promise<void> }) {
  const [row, setRow] = useState<(OpsRequest & { thread: OpsNote[] }) | null>(null);
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setRow(await opsRequest(id));
  }, [id]);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  if (!row) return <p className="p-6 text-sm text-ink-5">Loading…</p>;

  const move = async (status: string) => {
    setBusy(true);
    await opsSetStatus(id, status).catch(() => undefined);
    await load();
    await onChanged();
    setBusy(false);
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    await opsReply(id, body, internal).catch(() => undefined);
    setBody("");
    await load();
    await onChanged();
    setBusy(false);
  };

  const answers = Object.entries(row.answers ?? {});

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-line bg-surface p-6">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="font-mono text-sm text-ink-5">{row.reference}</span>
          <h2 className="text-lg font-semibold text-ink">
            {row.kind === "brief" ? "Engagement brief" : "Scoping request"}
          </h2>
          <span className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_TONE[row.status] ?? ""}`}>
            {STATUS_LABEL[row.status] ?? row.status}
          </span>
          <span className="ml-auto text-xs text-ink-5">
            {when(row.created_at)} · waiting {waited(row.created_at)}
          </span>
        </div>

        <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-[auto_1fr] *:min-w-0">
          <dt className="text-ink-5">From</dt>
          <dd className="text-ink-2">
            {row.contact_name ?? "—"} · <a className="text-accent" href={`mailto:${row.contact_email}`}>{row.contact_email}</a>
          </dd>
          <dt className="text-ink-5">Organisation</dt>
          <dd className="text-ink-2">
            {row.org ?? "No account — submitted as a visitor"}
            {row.org_region ? ` · ${row.org_region} hours` : ""}
          </dd>
          {answers.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-ink-5">{k.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase())}</dt>
              <dd className="text-ink-2">{Array.isArray(v) ? v.join(", ") : String(v)}</dd>
            </div>
          ))}
        </dl>

        {row.services.length > 0 && (
          <div className="mt-4 border-t border-line pt-4">
            <p className="text-sm font-medium text-ink">Services requested</p>
            <ul className="mt-2 space-y-1 text-sm text-ink-3">
              {row.services.map((s) => (
                <li key={s.code}>
                  {s.name} <span className="text-ink-5">· {s.category}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {row.notes && (
          <div className="mt-4 border-t border-line pt-4">
            <p className="text-sm font-medium text-ink">What they wrote</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-3">{row.notes}</p>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
          {["reviewing", "proposal", "accepted", "declined"].map((s) => (
            <button
              key={s}
              type="button"
              disabled={busy || row.status === s}
              onClick={() => void move(s)}
              className="focus-ring rounded-lg border border-line-strong px-3 py-1.5 text-sm font-semibold text-ink-2 hover:border-rule disabled:opacity-40"
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-6">
        <h3 className="font-semibold text-ink">Conversation</h3>
        {row.thread.length === 0 ? (
          <p className="mt-2 text-sm text-ink-5">Nothing said yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {row.thread.map((n) => (
              <li
                key={n.id}
                className={`rounded-lg border p-3 ${
                  n.internal
                    ? "border-dashed border-line-strong bg-sunken"
                    : n.side === "client"
                      ? "border-line bg-paper"
                      : "border-accent/30 bg-accent-tint"
                }`}
              >
                <p className="text-xs text-ink-5">
                  {n.author} · {when(n.at)}
                  {n.internal && " · internal, the client cannot see this"}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-2">{n.body}</p>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={send} className="mt-5 border-t border-line pt-4">
          <label htmlFor="op-reply" className="text-sm font-medium text-ink">
            Reply
          </label>
          <textarea
            id="op-reply"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="This is emailed to the client unless you mark it internal."
            className="focus-ring mt-1 w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint"
          />
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={busy || !body.trim()}
              className="focus-ring rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
            >
              {busy ? "Sending…" : internal ? "Save note" : "Send to client"}
            </button>
            <label className="flex items-center gap-2 text-sm text-ink-4">
              <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} />
              Internal note — not sent, not shown to them
            </label>
          </div>
        </form>
      </div>
    </div>
  );
}

function Queue({ onOut }: { onOut: () => void }) {
  const [rows, setRows] = useState<OpsRequest[] | null>(null);
  const [open, setOpen] = useState(0);
  const [filter, setFilter] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await opsQueue(filter || undefined);
      setRows(res.requests);
      setOpen(res.open);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return onOut();
      setError("Could not load the queue.");
    }
  }, [filter, onOut]);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-10 border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <h1 className="font-semibold text-ink">Request queue</h1>
          <span className="rounded-full border border-accent bg-accent-tint px-2 py-0.5 text-xs text-accent">
            {open} open
          </span>
          <select
            value={filter}
            onChange={(e) => {
              setOpenId(null);
              setFilter(e.target.value);
            }}
            aria-label="Filter by status"
            className="focus-ring ml-auto rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-sm text-ink"
          >
            <option value="">All</option>
            {["new", "reviewing", "proposal", "accepted", "declined"].map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setOpsToken(null);
              onOut();
            }}
            className="focus-ring rounded-lg border border-line-strong px-3 py-1.5 text-sm font-semibold text-ink-2 hover:border-rule"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {error && <p className="mb-4 rounded-lg border border-line-strong bg-sunken px-4 py-3 text-sm">{error}</p>}

        {openId ? (
          <>
            <button
              type="button"
              onClick={() => setOpenId(null)}
              className="focus-ring mb-4 rounded text-sm text-ink-5 hover:text-ink"
            >
              ← Back to the queue
            </button>
            <Detail id={openId} onChanged={load} />
          </>
        ) : rows === null ? (
          <p className="text-sm text-ink-5">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="rounded-xl border border-line bg-surface p-8 text-sm text-ink-5">Nothing here.</p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {rows.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(r.id)}
                  className="focus-ring flex w-full flex-wrap items-baseline gap-x-3 gap-y-1 p-4 text-left hover:bg-sunken"
                >
                  <span className="font-mono text-xs text-ink-5">{r.reference}</span>
                  <span className="font-medium text-ink">{r.contact_name ?? r.contact_email}</span>
                  <span className="text-sm text-ink-4">{r.org ?? "no account"}</span>
                  {r.note_count > 0 && <span className="text-xs text-ink-5">{r.note_count} in thread</span>}
                  <span className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_TONE[r.status] ?? ""}`}>
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                  <span className="ml-auto text-xs text-ink-5">waiting {waited(r.created_at)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default function OpsPage() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      setSignedIn(getOpsToken() !== null);
    })();
  }, []);

  if (signedIn === null) return null;
  return signedIn ? <Queue onOut={() => setSignedIn(false)} /> : <SignIn onIn={() => setSignedIn(true)} />;
}
