"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { getRequest, replyToRequest, setRequestStatus, type RequestNote } from "@/lib/portal";

/**
 * One request, and the conversation on it.
 *
 * A request used to be a shout into a well: submitted, then nothing but a status the client could
 * read and not answer. Everything they might want to do afterwards — add the detail they forgot,
 * ask whether a subsidiary is included, accept the proposal, or say they no longer need it — had
 * to happen over email, which is exactly where the conversation then stayed.
 *
 * Attachments are the one thing still missing: they need somewhere to store a file, which is a
 * decision about storage and retention, not a form. Until then the reply box says to email
 * documents, rather than pretending they can be dropped here.
 */
export function RequestThread({
  id,
  reference,
  status,
  onChanged,
}: {
  id: string;
  reference: string;
  status: string;
  onChanged: () => Promise<void>;
}) {
  const [thread, setThread] = useState<RequestNote[] | null>(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setThread((await getRequest(id)).thread);
    } catch {
      setProblem("Could not load this conversation.");
    }
  }, [id]);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setProblem(null);
    try {
      await replyToRequest(id, body);
      setBody("");
      await load();
      await onChanged();
    } catch (err) {
      setProblem(err instanceof ApiError ? err.message : "Could not send that. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const decide = async (next: "accepted" | "withdrawn") => {
    const ask =
      next === "accepted"
        ? `Accept the proposal on ${reference}? We will start scheduling the work.`
        : `Withdraw ${reference}? You can always raise it again later.`;
    if (!window.confirm(ask)) return;
    setBusy(true);
    setProblem(null);
    try {
      await setRequestStatus(id, next);
      await onChanged();
    } catch (err) {
      setProblem(err instanceof ApiError ? err.message : "Could not do that. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const settled = ["accepted", "declined", "withdrawn"].includes(status);

  return (
    <div className="mt-3 rounded-lg border border-line bg-paper p-4">
      {thread === null ? (
        <p className="text-sm text-ink-5">Loading…</p>
      ) : thread.length === 0 ? (
        <p className="text-sm text-ink-5">Nothing said yet. Anything you add here reaches the GRC lead.</p>
      ) : (
        <ul className="space-y-3">
          {thread.map((n, i) => (
            <li
              key={i}
              className={`rounded-lg border p-3 ${
                n.side === "grc" ? "border-accent/30 bg-accent-tint" : "border-line bg-surface"
              }`}
            >
              <p className="text-xs text-ink-5">
                {n.side === "grc" ? `${n.author} · GRC Department` : n.author} ·{" "}
                {new Date(n.at).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-2">{n.body}</p>
            </li>
          ))}
        </ul>
      )}

      {problem && <p className="mt-3 text-sm text-ink-3">{problem}</p>}

      {!settled && (
        <>
          <form onSubmit={send} className="mt-4">
            <label htmlFor={`rt-${id}`} className="text-sm font-medium text-ink">
              Add to this request
            </label>
            <textarea
              id={`rt-${id}`}
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Something you forgot, or a question. To send a document, reply to any email from us."
              className="focus-ring mt-1 w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={busy || !body.trim()}
                className="focus-ring rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
              >
                {busy ? "Sending…" : "Send"}
              </button>
              {status === "proposal" && (
                <button
                  type="button"
                  onClick={() => void decide("accepted")}
                  disabled={busy}
                  className="focus-ring rounded-lg border border-positive-line bg-positive-tint px-4 py-2 text-sm font-semibold text-positive disabled:opacity-60"
                >
                  Accept the proposal
                </button>
              )}
              <button
                type="button"
                onClick={() => void decide("withdrawn")}
                disabled={busy}
                className="focus-ring rounded-lg border border-line-strong px-4 py-2 text-sm font-semibold text-ink-4 hover:border-rule disabled:opacity-60"
              >
                Withdraw
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
