"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { getTeam, inviteColleague, setMemberRole, type Team } from "@/lib/portal";

const SELECT =
  "focus-ring mt-1 rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink";

/**
 * The people in this client organisation, and how to add one.
 *
 * An engagement is not a one-person job on the client's side either: somebody approves the
 * timesheets, somebody else owns the evidence a control needs, and a third person hears about it
 * when that evidence is late. Until this existed, an organisation could only ever have the person
 * who signed up, so every one of those messages had nowhere to go.
 *
 * A role is chosen when somebody is added, because that is the moment the person adding them knows
 * the answer. It decides who we address, never what anyone is allowed to do — the one exception is
 * that only an administrator manages the list itself.
 */
export function PortalTeam() {
  const [team, setTeam] = useState<Team | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setTeam(await getTeam());
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
      const res = await inviteColleague(email.trim(), role);
      setSaid(res.message);
      if (!res.already_member) setEmail("");
      await load();
    } catch (err) {
      setProblem(err instanceof ApiError ? err.message : "Could not send that invitation.");
    } finally {
      setBusy(false);
    }
  };

  const changeRole = async (personId: string, next: string) => {
    setSaid(null);
    setProblem(null);
    try {
      await setMemberRole(personId, next);
      await load();
    } catch (err) {
      setProblem(err instanceof ApiError ? err.message : "Could not change that role.");
      await load();
    }
  };

  const roles = team?.roles ?? [];
  const admin = team?.you_are_admin ?? false;

  return (
    <div className="space-y-5">
      {admin && (
        <div className="rounded-xl border border-line bg-surface p-6">
          <h2 className="font-semibold text-ink">Invite a colleague</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-4">
            Anyone you add sees the same requests and engagements. What you pick below decides who we
            write to — the approver gets the timesheet, the evidence owner gets the document request —
            not what they are allowed to do.
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
            <div>
              <label htmlFor="inv-role" className="text-sm font-medium text-ink">
                Here to
              </label>
              <select
                id="inv-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={SELECT}
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
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
      )}

      <div className="rounded-xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink">In your organisation</h2>
        {!admin && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-4">
            Your administrator adds people and sets what each of them is here to do. Everything else
            in the portal is open to all of you.
          </p>
        )}
        {team === null ? (
          <p className="mt-3 text-sm text-ink-5">Loading…</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {team.members.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
                <span className="font-medium text-ink">
                  {m.name}
                  {m.is_you && <span className="ml-2 text-xs font-normal text-ink-5">you</span>}
                </span>
                <span className="min-w-0 text-sm text-ink-4">{m.email}</span>
                {m.job_title && <span className="text-sm text-ink-5">· {m.job_title}</span>}
                <span className="ml-auto flex items-center gap-2">
                  {!m.confirmed && (
                    <span className="rounded-full border border-line-strong bg-sunken px-2 py-0.5 text-xs text-ink-5">
                      Not confirmed
                    </span>
                  )}
                  {admin ? (
                    <select
                      aria-label={`What ${m.name} is here to do`}
                      value={m.role}
                      onChange={(e) => changeRole(m.id, e.target.value)}
                      className="focus-ring rounded-lg border border-line-strong bg-surface px-2 py-1 text-xs text-ink-3"
                    >
                      {roles.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-sm text-ink-5">{m.role_label}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
        {!admin && problem && <p className="mt-3 text-sm text-ink-3">{problem}</p>}
      </div>
    </div>
  );
}
