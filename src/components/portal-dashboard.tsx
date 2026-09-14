"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PortalShell, type ShellNavItem } from "@/components/portal-shell";
import {
  acceptDeliverable,
  approveTimesheet,
  fmtDate,
  fmtMoney,
  type Contact,
  type Portal,
  type Project,
} from "@/lib/portal";

const STAGE_TONE: Record<string, string> = {
  Closed: "border-line bg-sunken text-ink-5",
  "In delivery": "border-accent bg-accent-tint text-accent",
  Scoping: "border-line-strong bg-muted text-ink-3",
};

export type ClientView = "overview" | "engagements" | "timesheets" | "activity";
export const CLIENT_VIEWS: ClientView[] = ["overview", "engagements", "timesheets", "activity"];

const BASE = "/portal/dashboard";
const TITLES: Record<ClientView, string> = {
  overview: "Overview",
  engagements: "Engagements",
  timesheets: "Timesheets",
  activity: "Activity",
};

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "?";

export function PortalDashboard({
  contact,
  portal,
  view,
  onRefresh,
  onSignOut,
}: {
  contact: Contact;
  portal: Portal;
  view: ClientView;
  onRefresh: () => Promise<void>;
  onSignOut: () => void;
}) {
  const router = useRouter();
  const go = (v: ClientView, project?: string) =>
    router.push(v === "overview" ? BASE : `${BASE}?view=${v}${project ? `&engagement=${project}` : ""}`);

  const [openId, setOpenId] = useState<string | null>(
    () =>
      (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("engagement")) ||
      portal.projects.find((p) => p.stage !== "Closed")?.id ||
      portal.projects[0]?.id ||
      null,
  );
  const open = portal.projects.find((p) => p.id === openId) ?? null;

  const nav: ShellNavItem[] = [
    { key: "overview", label: "Overview", icon: "overview" },
    { key: "engagements", label: "Engagements", icon: "briefcase", badge: portal.stats.deliverables_outstanding },
    { key: "timesheets", label: "Timesheets", icon: "timesheet", badge: portal.stats.timesheets_to_approve },
    { key: "activity", label: "Activity", icon: "activity" },
  ];

  const stats: [string, number, boolean][] = [
    ["Active engagements", portal.stats.active, false],
    ["Deliverables to review", portal.stats.deliverables_outstanding, portal.stats.deliverables_outstanding > 0],
    ["Items owed by your teams", portal.stats.items_owed_by_you, portal.stats.items_owed_by_you > 0],
    ["Timesheets to approve", portal.stats.timesheets_to_approve, portal.stats.timesheets_to_approve > 0],
  ];

  const noEngagements = (
    <div className="rounded-xl border border-line bg-surface p-8">
      <h2 className="font-semibold text-ink">No engagements yet</h2>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-4">
        Once a proposal is accepted it appears here with its milestones, deliverables and the consultant
        assigned.
      </p>
      <Link
        href="/services"
        className="focus-ring mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
      >
        Browse the service catalogue
      </Link>
    </div>
  );

  return (
    <PortalShell
      portal="Client portal"
      basePath={BASE}
      nav={nav}
      active={view}
      title={TITLES[view]}
      subtitle={[contact.org?.name, contact.org && `${contact.org.business_region} business hours`].filter(Boolean).join(" · ")}
      user={{ name: contact.name, initials: initials(contact.name), detail: contact.job_title ?? contact.email }}
      onSignOut={onSignOut}
      actions={
        <Link
          href="/services"
          className="focus-ring rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          Request a service
        </Link>
      }
    >
      {view === "overview" && (
        <div className="space-y-6">
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(([label, value, urgent]) => (
              <div key={label} className={`rounded-xl border p-4 ${urgent ? "border-accent bg-accent-tint" : "border-line bg-surface"}`}>
                <dt className="text-xs text-ink-5">{label}</dt>
                <dd className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          {portal.timesheets.length > 0 && <TimesheetsToApprove timesheets={portal.timesheets} onRefresh={onRefresh} />}

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <section className="rounded-xl border border-line bg-surface p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-ink">Your engagements</h2>
                {portal.projects.length > 0 && (
                  <button type="button" onClick={() => go("engagements")} className="focus-ring rounded text-sm font-semibold text-accent hover:text-accent-dark">
                    All engagements →
                  </button>
                )}
              </div>
              {portal.projects.length === 0 ? (
                <p className="mt-3 text-sm leading-relaxed text-ink-5">
                  Nothing in delivery yet. Accepted proposals appear here.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-line">
                  {portal.projects.map((p) => (
                    <li key={p.id}>
                      <button type="button" onClick={() => go("engagements", p.id)} className="focus-ring w-full py-3 text-left">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-ink-5">{p.ref}</span>
                          <span className={`rounded border px-1.5 py-0.5 text-[11px] font-medium ${STAGE_TONE[p.stage] ?? "border-line bg-sunken text-ink-5"}`}>
                            {p.stage}
                          </span>
                          <span className="ml-auto text-xs text-ink-5">{fmtMoney(p.quoted_total, p.currency)}</span>
                        </div>
                        <p className="mt-1 font-medium text-ink">{p.name}</p>
                        <ProgressBar value={p.progress} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-xl border border-line bg-surface p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-ink">Recent activity</h2>
                {portal.activity.length > 5 && (
                  <button type="button" onClick={() => go("activity")} className="focus-ring rounded text-sm font-semibold text-accent hover:text-accent-dark">
                    All →
                  </button>
                )}
              </div>
              {portal.activity.length === 0 ? (
                <p className="mt-3 text-sm text-ink-5">No activity yet.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {portal.activity.slice(0, 5).map((a, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium text-ink">{a.who}</span> <span className="text-ink-4">{a.what}</span>
                      <p className="text-xs text-ink-5">{fmtDate(a.at)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}

      {view === "engagements" &&
        (portal.projects.length === 0 ? (
          noEngagements
        ) : (
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <nav className="space-y-2" aria-label="Engagements">
              {portal.projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setOpenId(p.id)}
                  className={`focus-ring w-full rounded-xl border p-4 text-left transition-colors ${
                    p.id === openId ? "border-accent bg-accent-tint" : "border-line bg-surface hover:border-line-strong"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-ink-5">{p.ref}</span>
                    <span className={`rounded border px-1.5 py-0.5 text-[11px] font-medium ${STAGE_TONE[p.stage] ?? "border-line bg-sunken text-ink-5"}`}>
                      {p.stage}
                    </span>
                  </div>
                  <p className="mt-1.5 font-semibold leading-snug text-ink">{p.name}</p>
                  <ProgressBar value={p.progress} />
                  <p className="mt-1 text-xs text-ink-5">
                    {p.milestones_complete}/{p.milestones_total} milestones · {fmtMoney(p.quoted_total, p.currency)}
                  </p>
                </button>
              ))}
            </nav>
            {open && <ProjectDetail project={open} onRefresh={onRefresh} />}
          </div>
        ))}

      {view === "timesheets" &&
        (portal.timesheets.length > 0 ? (
          <TimesheetsToApprove timesheets={portal.timesheets} onRefresh={onRefresh} />
        ) : (
          <div className="rounded-xl border border-line bg-surface p-8">
            <h2 className="font-semibold text-ink">Nothing to approve</h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-4">
              When a consultant submits a week of time on one of your engagements it appears here. Hours you
              approve become payable; a week you do not review within five business days is approved
              automatically.
            </p>
          </div>
        ))}

      {view === "activity" &&
        (portal.activity.length === 0 ? (
          <div className="rounded-xl border border-line bg-surface p-8">
            <h2 className="font-semibold text-ink">No activity yet</h2>
            <p className="mt-2 text-sm text-ink-4">Deliverables, approvals and submissions on your engagements are logged here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {portal.activity.map((a, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-x-2 p-4 text-sm">
                <span className="font-semibold text-ink">{a.who}</span>
                <span className="text-ink-4">{a.what}</span>
                <span className="ml-auto text-xs text-ink-5">{fmtDate(a.at)}</span>
              </li>
            ))}
          </ul>
        ))}
    </PortalShell>
  );
}

function TimesheetsToApprove({
  timesheets,
  onRefresh,
}: {
  timesheets: Portal["timesheets"];
  onRefresh: () => Promise<void>;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function approve(id: string) {
    setBusy(id);
    setError(null);
    try {
      await approveTimesheet(id);
      await onRefresh();
    } catch {
      setError("Could not approve this timesheet. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-xl border border-accent bg-accent-tint p-5">
      <h2 className="font-bold text-ink">Timesheets to approve</h2>
      <p className="mt-1 text-xs text-ink-4">
        Hours you approve become payable to the consultant. A week you do not review is approved
        automatically at the date shown.
      </p>
      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-surface px-3 py-2 text-sm text-ink-2">
          {error}
        </p>
      )}
      <ul className="mt-3 divide-y divide-line rounded-lg border border-line bg-surface">
        {timesheets.map((t) => (
          <li key={t.id} className="flex flex-wrap items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">
                {t.consultant} · week of {fmtDate(t.week_start)}
              </p>
              <p className="text-xs text-ink-5">
                {t.ref} · {t.engagement} · auto-approves {fmtDate(t.auto_approves_at)}
              </p>
            </div>
            <span className="text-sm font-semibold text-ink">{(t.minutes / 60).toFixed(1)} h</span>
            <button
              type="button"
              disabled={busy === t.id}
              onClick={() => approve(t.id)}
              className="focus-ring rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
            >
              {busy === t.id ? "Approving…" : "Approve"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sunken">
      <div className="h-full rounded-full bg-accent" style={{ width: `${value}%` }} />
    </div>
  );
}

function ProjectDetail({
  project,
  onRefresh,
}: {
  project: Project;
  onRefresh: () => Promise<void>;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function accept(id: string) {
    setBusy(id);
    setError(null);
    try {
      await acceptDeliverable(id);
      // Awaited, not fired and forgotten: the refetch crosses the network to a remote database
      // and takes a second or two. Without the await, `finally` clears the busy state first and
      // the button reads "done" over numbers that have not moved yet — which looks exactly like
      // a click that did nothing.
      await onRefresh();
    } catch {
      setError("Could not accept this deliverable. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-xs text-ink-5">{project.ref}</span>
          <h2 className="text-lg font-bold text-ink">{project.name}</h2>
          {project.in_trial && (
            <span className="rounded border border-line-strong bg-muted px-1.5 py-0.5 text-[11px] font-medium text-ink-3">
              In trial until {fmtDate(project.trial_ends_on)}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-ink-5">
          {project.progress}% · started {fmtDate(project.started_on)} · due{" "}
          {fmtDate(project.due_on)}
          {project.billing_period === "monthly" && " · billed monthly"}
        </p>

        {project.consultant && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-line bg-paper p-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
              {project.consultant.initials}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{project.consultant.name}</p>
              <p className="text-xs text-ink-5">{project.consultant.window}</p>
            </div>
            <span className="ml-auto text-xs text-ink-5">Assigned consultant</span>
          </div>
        )}
      </div>

      <Panel title="Deliverables" note="Accepting closes the milestone it belongs to.">
        {error && (
          <p role="alert" className="mb-3 rounded-lg bg-sunken px-3 py-2 text-sm text-ink-2">
            {error}
          </p>
        )}
        <ul className="divide-y divide-line">
          {project.deliverables.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{d.name}</p>
                <p className="text-xs text-ink-5">
                  v{d.version} ·{" "}
                  {d.accepted_at
                    ? `accepted ${fmtDate(d.accepted_at)}`
                    : d.submitted_at
                      ? `submitted ${fmtDate(d.submitted_at)}`
                      : "not yet submitted"}
                </p>
              </div>
              {d.can_accept ? (
                <button
                  type="button"
                  disabled={busy === d.id}
                  onClick={() => accept(d.id)}
                  className="focus-ring rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
                >
                  {busy === d.id ? "Accepting…" : "Review and accept"}
                </button>
              ) : (
                <StatusChip status={d.status} />
              )}
            </li>
          ))}
        </ul>
      </Panel>

      {project.asks.length > 0 && (
        <Panel
          title="Owed by your teams"
          note="A stalled engagement is usually stalled here, not with the consultant."
        >
          <ul className="divide-y divide-line">
            {project.asks.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{a.name}</p>
                  <p className="text-xs text-ink-5">
                    {a.owner} · due {fmtDate(a.due_on)}
                  </p>
                </div>
                <StatusChip status={a.status} overdue={a.overdue} />
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel title="Milestones">
        <ol className="space-y-3">
          {project.milestones.map((m) => (
            <li key={m.id} className="flex flex-wrap items-baseline gap-3">
              <span
                aria-hidden
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  m.status === "Complete" ? "bg-positive" : "bg-line-strong"
                }`}
              />
              <span className="min-w-0 flex-1 text-sm text-ink">{m.name}</span>
              <span className="text-xs text-ink-5">{fmtDate(m.due_on)}</span>
              <StatusChip status={m.status} />
            </li>
          ))}
        </ol>
      </Panel>

      <Panel title="Catalogue services in scope" note={`Quoted ${fmtMoney(project.quoted_total, project.currency)} in total.`}>
        <ul className="divide-y divide-line">
          {project.services.map((s) => (
            <li key={s.code} className="flex flex-wrap items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink">{s.name}</p>
                <p className="font-mono text-xs text-ink-5">{s.code}</p>
              </div>
              <span className="text-sm font-medium text-ink-2">
                {fmtMoney(s.price, project.currency)}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function Panel({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <h3 className="font-bold text-ink">{title}</h3>
      {note && <p className="mt-1 text-xs text-ink-5">{note}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function StatusChip({ status, overdue = false }: { status: string; overdue?: boolean }) {
  // Green is reserved for settled: accepted, complete, received. Nothing else earns it.
  const settled = ["Accepted", "Complete", "Received"].includes(status);
  const tone = overdue
    ? "border-line-strong bg-muted text-ink font-semibold"
    : settled
      ? "border-positive-line bg-positive-tint text-positive"
      : "border-line bg-sunken text-ink-5";
  return (
    <span className={`shrink-0 rounded border px-2 py-0.5 text-xs ${tone}`}>
      {overdue ? "Overdue" : status}
    </span>
  );
}
