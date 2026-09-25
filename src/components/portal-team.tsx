"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { getTeam, inviteColleague, type TeamMember } from "@/lib/portal";

/**
 * The people in this client organisation, and how to add one.
 *
 * An engagement is not a one-person job on the client's side either: somebody approves the
 * timesheets, somebody else owns the evidence a control needs, and a third person hears about it
 * when that evidence is late. Until this existed, an organisation could only ever have the person
 * who signed up, so every one of those messages had nowhere to go.
 */
export function PortalTeam() {
  const [members, setMembers] = useState<TeamMember[] | null>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setMembers((await getTeam()).members);
    } catch {
      setProblem("Could not load your team.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setSaid(null);
    setProblem(null);
    try {
      const res = await inviteColleague(email.trim());
      setSaid(res.message);
      if (!res.already_member) setEmail("");
      await load();
    } catch (err) {
      setProblem(err instanceof ApiError ? err.message : "Could not send that invitation.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink">Invite a colleague</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-4">
          Anyone you add sees the same requests and engagements, and can review deliverables and approve
          timesheets. Add the people who will approve hours and provide evidence — requests for those go
          to them by name.
        </p>
        <form onSubmit={invite} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1">
            <label htmlFor="inv-email" className="text-sm font-medium text-ink">
              Their work email
            </label>
            <input
              id="inv-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="focus-ring mt-1 w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint"
            />
          </div>
          <button
            type="submit"
            disabled={busy || !email.trim()}
            className="focus-ring rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send invitation"}
          </button>
        </form>
        {said && <p className="mt-3 text-sm text-positive">{said}</p>}
        {problem && <p className="mt-3 text-sm text-ink-3">{problem}</p>}
        <p className="mt-3 text-xs text-ink-5">The invitation is good for seven days.</p>
      </div>

      <div className="rounded-xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink">In your organisation</h2>
        {members === null ? (
          <p className="mt-3 text-sm text-ink-5">Loading…</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {members.map((m) => (
              <li key={m.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3">
                <span className="font-medium text-ink">
                  {m.name}
                  {m.is_you && <span className="ml-2 text-xs font-normal text-ink-5">you</span>}
                </span>
                <span className="min-w-0 text-sm text-ink-4">{m.email}</span>
                {m.job_title && <span className="text-sm text-ink-5">· {m.job_title}</span>}
                {!m.confirmed && (
                  <span className="ml-auto rounded-full border border-line-strong bg-sunken px-2 py-0.5 text-xs text-ink-5">
                    Not confirmed
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
