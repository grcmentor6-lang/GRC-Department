"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api";
import { fmtDate, fmtMoney } from "@/lib/portal";
import {
  advanceTask,
  beginTimer,
  clock,
  hm,
  hours,
  logTime,
  readTimer,
  submitWeek,
  writeTimer,
  type ConsultantPortal,
  type CTask,
  type RunningTimer,
} from "@/lib/consultant-portal";

type Tab = "projects" | "tasks" | "time" | "earnings";

const TABS: { id: Tab; label: string }[] = [
  { id: "projects", label: "Projects" },
  { id: "tasks", label: "Tasks" },
  { id: "time", label: "Time tracking" },
  { id: "earnings", label: "Earnings" },
];

const FILTERS = ["All", "In progress", "Blocked", "In review", "Not started"];
const MAX_ENTRY = 12 * 60;

export function ConsultantDashboard({
  data,
  week,
  onWeek,
  reload,
  onSignOut,
}: {
  data: ConsultantPortal;
  week: string | undefined;
  onWeek: (w: string | undefined) => void;
  reload: () => Promise<void>;
  onSignOut: () => void;
}) {
  const [tab, setTab] = useState<Tab>("projects");
  const [projectId, setProjectId] = useState<string | null>(
    data.projects.find((p) => p.stage !== "Closed")?.id ?? data.projects[0]?.id ?? null,
  );
  const [filter, setFilter] = useState("All");
  // Read straight from storage: this component only ever renders in the browser, after sign-in,
  // so a timer left running before a reload is restored without a mount effect.
  const [timer, setTimer] = useState<RunningTimer | null>(() => readTimer());
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!timer) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const c = data.consultant;
  const taskById = useMemo(() => new Map(data.tasks.map((t) => [t.id, t])), [data.tasks]);
  const runSecs = timer ? Math.max(0, Math.floor((now - timer.startedAt) / 1000)) : 0;
  const runTask = timer ? taskById.get(timer.taskId) : undefined;
  const project = data.projects.find((p) => p.id === projectId) ?? null;
  const currency = data.earnings.currency;

  async function act(key: string, fn: () => Promise<unknown>, ok?: string) {
    setBusy(key);
    setMessage(null);
    try {
      await fn();
      await reload();
      if (ok) setMessage({ tone: "ok", text: ok });
      return true;
    } catch (err) {
      setMessage({
        tone: "err",
        text: err instanceof ApiError ? err.message : "That did not go through. Please try again.",
      });
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function stopTimer() {
    if (!timer) return;
    const minutes = Math.min(MAX_ENTRY, Math.max(1, Math.round(runSecs / 60)));
    const logged = await act(
      "timer",
      () => logTime(timer.taskId, minutes, "timer"),
      `Logged ${hm(minutes)} against ${runTask?.name ?? "the task"}.`,
    );
    // Keep the timer if the server refused it (a locked week, a closed task), so the tracked time
    // is not silently thrown away; the consultant can discard it deliberately.
    if (logged) {
      writeTimer(null);
      setTimer(null);
    }
  }

  async function startTimer(task: CTask) {
    if (timer) {
      await stopTimer();
      // If the running timer could not be logged it is still in storage — starting a new one now
      // would overwrite it and throw that tracked time away.
      if (readTimer()) return;
    }
    setTimer(beginTimer(task.id));
  }

  function discardTimer() {
    writeTimer(null);
    setTimer(null);
    setMessage(null);
  }

  return (
    <div>
      {/* Identity bar */}
      <div className="flex flex-wrap items-center gap-4 border-b border-line pb-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
          {c.initials}
        </span>
        <div className="min-w-0">
          <h1 className="font-bold text-ink">{c.name}</h1>
          <p className="text-sm text-ink-5">
            {c.is_listed ? "Listed consultant" : "Listing paused"} · {c.window}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {timer && (
            <button
              type="button"
              onClick={stopTimer}
              disabled={busy === "timer"}
              className="focus-ring flex items-center gap-2 rounded-lg border border-accent bg-accent-tint px-3 py-2 text-sm font-semibold text-accent"
            >
              <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              <span className="font-mono">{clock(runSecs)}</span> · stop
            </button>
          )}
          <button
            type="button"
            onClick={onSignOut}
            className="focus-ring rounded-lg border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink hover:bg-sunken"
          >
            Sign out
          </button>
        </div>
      </div>

      <nav className="mt-5 flex flex-wrap gap-1 border-b border-line" aria-label="Portal sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
            className={`focus-ring -mb-px rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-semibold ${
              tab === t.id ? "border-accent text-accent" : "border-transparent text-ink-5 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {message && (
        <p
          role={message.tone === "err" ? "alert" : "status"}
          className={`mt-5 flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
            message.tone === "err"
              ? "border-line-strong bg-sunken text-ink-2"
              : "border-positive-line bg-positive-tint text-positive"
          }`}
        >
          {message.text}
          {message.tone === "err" && timer && (
            <button type="button" onClick={discardTimer} className="focus-ring rounded font-semibold underline">
              Discard the running timer
            </button>
          )}
        </p>
      )}

      {tab === "projects" && (
        <section className="mt-6">
          <Stats
            items={[
              ["Active engagements", String(data.stats.active_engagements)],
              ["Open tasks", String(data.stats.open_tasks)],
              ["Blocked on client", String(data.stats.blocked_tasks)],
              ["Hours this week", hours(data.stats.week_minutes)],
            ]}
          />
          {data.projects.length === 0 ? (
            <Empty
              title="No engagements yet"
              body="When a GRC lead assigns you to a client engagement it appears here, with its milestones and your tasks."
            />
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
              <div className="grid gap-3 sm:grid-cols-2">
                {data.projects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProjectId(p.id)}
                    className={`focus-ring rounded-xl border p-4 text-left transition-colors ${
                      p.id === projectId ? "border-accent bg-accent-tint" : "border-line bg-surface hover:border-line-strong"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-ink-5">{p.ref}</span>
                      <Chip status={p.stage} />
                    </div>
                    <p className="mt-1.5 font-semibold leading-snug text-ink">{p.name}</p>
                    <p className="text-xs text-ink-5">
                      {p.client}
                      {p.overlap && ` · ${p.overlap}`}
                    </p>
                    <Bar value={p.progress} />
                    <p className="mt-1.5 text-xs text-ink-5">
                      {p.milestones_complete} of {p.milestones_total} milestones · {hours(p.logged_minutes)} logged ·{" "}
                      {p.open_tasks} open tasks
                    </p>
                  </button>
                ))}
              </div>

              {project && (
                <div className="rounded-xl border border-line bg-surface p-5 lg:self-start">
                  <span className="font-mono text-xs text-ink-5">{project.ref}</span>
                  <h2 className="text-lg font-bold text-ink">{project.name}</h2>
                  <p className="text-sm text-ink-5">{project.client}</p>
                  {!project.meets_overlap && (
                    <p className="mt-3 rounded-lg border border-line-strong bg-muted px-3 py-2 text-xs text-ink-2">
                      Your working window does not give this client the four hours of daily overlap the
                      service guarantees. Raise it with your GRC lead.
                    </p>
                  )}
                  <dl className="mt-4 space-y-2 text-sm">
                    {[
                      ["Engagement window", `${fmtDate(project.started_on)} — ${fmtDate(project.due_on)}`],
                      ["Client contact", project.lead ?? "—"],
                      ["Hours logged", hours(project.logged_minutes)],
                      ["Your rate", Number(project.rate) > 0 ? `${fmtMoney(project.rate, project.currency)}/h` : "No rate agreed"],
                      ["Channel", project.channel ?? "—"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4">
                        <dt className="text-ink-5">{k}</dt>
                        <dd className="text-right font-medium text-ink-2">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <h3 className="mt-5 text-sm font-bold text-ink">Milestones</h3>
                  <ol className="mt-2 space-y-2">
                    {project.milestones.map((m) => (
                      <li key={m.name} className="flex items-baseline gap-2 text-sm">
                        <span
                          aria-hidden
                          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                            m.status === "Complete" ? "bg-positive" : m.status === "In progress" ? "bg-accent" : "bg-line-strong"
                          }`}
                        />
                        <span className="min-w-0 flex-1 text-ink">{m.name}</span>
                        <span className="text-xs text-ink-5">
                          {m.status} · {fmtDate(m.due_on)}
                        </span>
                      </li>
                    ))}
                  </ol>
                  <button
                    type="button"
                    onClick={() => setTab("tasks")}
                    className="focus-ring mt-5 w-full rounded-lg border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink hover:bg-sunken"
                  >
                    View tasks for this engagement
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {tab === "tasks" && (
        <section className="mt-6">
          <p className="max-w-3xl text-sm leading-relaxed text-ink-4">
            Every activity assigned to you across engagements. Start the timer on the task you are
            working on — elapsed time is logged against that activity and appears on the week&apos;s
            timesheet.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`focus-ring rounded-full border px-3 py-1 text-xs font-medium ${
                  filter === f ? "border-accent bg-accent text-white" : "border-line-strong bg-surface text-ink-4 hover:text-ink"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <ul className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {data.tasks
              .filter((t) => filter === "All" || t.status === filter)
              .map((t) => {
                const running = timer?.taskId === t.id;
                return (
                  <li key={t.id} className="flex flex-wrap items-center gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink">{t.name}</p>
                      <p className="mt-0.5 text-xs text-ink-5">
                        {t.ref} · {t.client}
                        {t.due_note && ` · ${t.due_note}`}
                      </p>
                    </div>
                    <span className="rounded border border-line bg-paper px-1.5 py-0.5 text-xs text-ink-4">{t.kind}</span>
                    <span className="w-28 text-right text-xs text-ink-5">
                      <span className="font-semibold text-ink-2">{hm(t.logged_minutes)}</span> of{" "}
                      {Math.round(t.estimate_minutes / 60)}h est.
                    </span>
                    <Chip status={t.status} />
                    {t.closed ? (
                      <span className="w-28 text-center text-xs text-ink-5">Closed</span>
                    ) : running ? (
                      <button
                        type="button"
                        onClick={stopTimer}
                        className="focus-ring w-28 rounded-lg bg-accent px-3 py-1.5 font-mono text-sm font-semibold text-white"
                      >
                        {clock(runSecs)} ■
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startTimer(t)}
                        disabled={t.week_locked}
                        title={t.week_locked ? "This week has been submitted to the client" : undefined}
                        className="focus-ring w-28 rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-sm font-semibold text-ink hover:bg-sunken disabled:opacity-50"
                      >
                        Start timer
                      </button>
                    )}
                    {t.advance && (
                      <button
                        type="button"
                        onClick={() => act(`adv-${t.id}`, () => advanceTask(t.id), `${t.name}: ${t.advance!.to.toLowerCase()}.`)}
                        disabled={busy === `adv-${t.id}`}
                        className="focus-ring rounded-lg px-3 py-1.5 text-sm font-semibold text-accent hover:text-accent-dark disabled:opacity-50"
                      >
                        {t.advance.label}
                      </button>
                    )}
                  </li>
                );
              })}
          </ul>
          <p className="mt-3 text-xs text-ink-5">
            {data.tasks.length} tasks across {data.projects.length} engagements ·{" "}
            {hours(data.tasks.reduce((n, t) => n + t.logged_minutes, 0))} logged in total
          </p>
        </section>
      )}

      {tab === "time" && (
        <TimeTab
          data={data}
          week={week}
          onWeek={onWeek}
          timer={timer}
          runTask={runTask}
          runSecs={runSecs}
          stopTimer={stopTimer}
          busy={busy}
          act={act}
        />
      )}

      {tab === "earnings" && (
        <section className="mt-6">
          <p className="max-w-3xl text-sm leading-relaxed text-ink-4">
            Earnings are calculated from approved hours at the rate agreed on each engagement.
            Payouts are issued on the first business day of each month for everything approved in
            the preceding month.
          </p>
          <Stats
            items={[
              ["Total earned to date", fmtMoney(data.earnings.earned, currency), `${hours(data.earnings.approved_minutes)} approved`],
              ["Paid out", fmtMoney(data.earnings.paid, currency), `${data.earnings.payouts.filter((p) => p.status === "paid").length} payouts`],
              ["Approved, awaiting payout", fmtMoney(data.earnings.due, currency), `Scheduled ${fmtDate(nextFirst(data.today))}`],
              ["Pending time approval", fmtMoney(data.earnings.pending_value, currency), `${hours(data.earnings.pending_minutes)} not yet approved`],
            ]}
          />

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-6">
              <Panel title="By engagement" note="Approved hours at the rate agreed on each engagement.">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="border-b border-line text-left text-xs text-ink-5">
                        <th className="py-2 font-medium">Engagement</th>
                        <th className="py-2 text-right font-medium">Hours</th>
                        <th className="py-2 text-right font-medium">Rate</th>
                        <th className="py-2 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.earnings.rows.map((r) => (
                        <tr key={r.ref} className="border-b border-line">
                          <td className="py-2.5">
                            <p className="font-medium text-ink">{r.name}</p>
                            <p className="text-xs text-ink-5">
                              {r.ref} · {r.client} · {r.stage.toLowerCase()}
                            </p>
                          </td>
                          <td className="py-2.5 text-right text-ink-3">{hours(r.approved_minutes)}</td>
                          <td className="py-2.5 text-right text-ink-3">
                            {Number(r.rate) > 0 ? `${fmtMoney(r.rate, currency)}/h` : "—"}
                          </td>
                          <td className="py-2.5 text-right font-semibold text-ink">{fmtMoney(r.amount, currency)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td className="pt-3 font-semibold text-ink">Total approved earnings</td>
                        <td className="pt-3 text-right text-ink-3">{hours(data.earnings.approved_minutes)}</td>
                        <td />
                        <td className="pt-3 text-right font-bold text-ink">{fmtMoney(data.earnings.earned, currency)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel title="Payout history">
                {data.earnings.payouts.length === 0 ? (
                  <p className="text-sm text-ink-5">No payouts yet.</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {data.earnings.payouts.map((p) => (
                      <li key={p.period_start} className="flex flex-wrap items-center gap-3 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-ink">{fmtDate(p.paid_at)}</p>
                          <p className="text-xs text-ink-5">
                            {fmtDate(p.period_start)} — {fmtDate(p.period_end)} · {hours(p.minutes)} · {p.method}
                          </p>
                        </div>
                        <Chip status={p.status === "paid" ? "Paid" : "Scheduled"} />
                        <span className="w-24 text-right font-semibold text-ink">{fmtMoney(p.amount, p.currency)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-line bg-surface p-5">
                <p className="text-xs text-ink-5">Next payout</p>
                <p className="mt-1 text-2xl font-extrabold tracking-[-0.02em] text-ink">
                  {fmtMoney(data.earnings.due, currency)}
                </p>
                <p className="text-sm text-ink-5">
                  {fmtDate(nextFirst(data.today))} · everything approved this month
                </p>
                <p className="mt-4 border-t border-line pt-4 text-xs leading-relaxed text-ink-5">
                  Payouts are actioned by hand while automated payments are set up. Bank details and
                  tax forms will be collected when that goes live.
                </p>
              </div>
              {data.earnings.pending_minutes > 0 && (
                <div className="rounded-xl border border-line-strong bg-muted p-5">
                  <p className="text-sm font-bold text-ink">Unapproved time is not payable</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-4">
                    {fmtMoney(data.earnings.pending_value, currency)} of logged time is waiting on client
                    approval. Submit your current week from Time tracking so it enters the next cycle.
                  </p>
                  <button
                    type="button"
                    onClick={() => setTab("time")}
                    className="focus-ring mt-3 rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-sm font-semibold text-ink hover:bg-sunken"
                  >
                    Open time tracking
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function TimeTab({
  data,
  week,
  onWeek,
  timer,
  runTask,
  runSecs,
  stopTimer,
  busy,
  act,
}: {
  data: ConsultantPortal;
  week: string | undefined;
  onWeek: (w: string | undefined) => void;
  timer: RunningTimer | null;
  runTask: CTask | undefined;
  runSecs: number;
  stopTimer: () => Promise<void>;
  busy: string | null;
  act: (key: string, fn: () => Promise<unknown>, ok?: string) => Promise<boolean>;
}) {
  const ts = data.timesheet;
  const loggable = data.tasks.filter((t) => !t.closed);
  const [taskId, setTaskId] = useState(loggable[0]?.id ?? "");
  const [minutes, setMinutes] = useState(60);
  const [day, setDay] = useState(data.today);
  const maxKind = Math.max(1, ...ts.by_kind.map((k) => k.minutes));
  const shift = (weeks: number) => {
    const d = new Date(`${ts.week_start}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + weeks * 7);
    const iso = d.toISOString().slice(0, 10);
    onWeek(iso > data.today ? undefined : iso);
  };
  const cell = (m: number) => (m ? (m / 60).toFixed(1) : "—");

  return (
    <section className="mt-6">
      <p className="max-w-3xl text-sm leading-relaxed text-ink-4">
        Total time per task and activity for the week. Submit the week to the client contact for
        approval — approved hours are the basis of your payout, and anything still pending approval
        is held to the next cycle.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-5">
          {timer ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">Timer running</p>
              <p className="mt-1 font-semibold text-ink">{runTask?.name ?? "A task"}</p>
              <p className="text-xs text-ink-5">
                {runTask ? `${runTask.ref} · ${runTask.client} · ${runTask.kind}` : ""}
              </p>
              <p className="mt-3 font-mono text-4xl font-bold tracking-tight text-ink">{clock(runSecs)}</p>
              <button
                type="button"
                onClick={stopTimer}
                disabled={busy === "timer"}
                className="focus-ring mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
              >
                Stop and log
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-ink-4">
                No timer running. Start one from Tasks, or enter time manually against any open task.
              </p>
              {/* Task on its own row, minutes and day beneath it: three columns inside a half-width
                  card pushed the date input out over the neighbouring stat cards. */}
              <div className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-2">
                <select
                  aria-label="Task"
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                  className="focus-ring col-span-2 min-w-0 rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink"
                >
                  {loggable.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.ref} · {t.name}
                    </option>
                  ))}
                </select>
                <input
                  aria-label="Minutes"
                  type="number"
                  min={1}
                  max={MAX_ENTRY}
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="focus-ring min-w-0 rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink"
                />
                <input
                  aria-label="Day worked"
                  type="date"
                  max={data.today}
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="focus-ring min-w-0 rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink"
                />
              </div>
              <button
                type="button"
                disabled={!taskId || busy === "manual"}
                onClick={() => act("manual", () => logTime(taskId, minutes, "manual", day), `Logged ${hm(minutes)}.`)}
                className="focus-ring mt-3 rounded-lg border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink hover:bg-sunken disabled:opacity-50"
              >
                Add time
              </button>
            </>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-3">
          {[
            ["This week", hours(data.stats.week_minutes)],
            ["Logged this month", hours(data.stats.month_minutes)],
            ["Approved to date", hours(data.stats.approved_minutes)],
            ["Awaiting approval", hours(data.stats.pending_minutes)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-line bg-surface p-4">
              <dt className="text-xs text-ink-5">{k}</dt>
              <dd className="mt-1 text-xl font-extrabold tracking-[-0.02em] text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <Panel
        title={`Timesheet · ${fmtDate(ts.days[0])} — ${fmtDate(ts.days[6])}`}
        note="Hours per activity, per day, in your own calendar."
        className="mt-6"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => shift(-1)} className="focus-ring rounded-lg border border-line-strong px-2.5 py-1 text-sm text-ink hover:bg-sunken" aria-label="Previous week">
              ←
            </button>
            <button
              type="button"
              onClick={() => shift(1)}
              disabled={ts.is_current_week}
              className="focus-ring rounded-lg border border-line-strong px-2.5 py-1 text-sm text-ink hover:bg-sunken disabled:opacity-40"
              aria-label="Next week"
            >
              →
            </button>
            {ts.submittable ? (
              <button
                type="button"
                disabled={busy === "submit"}
                onClick={() => act("submit", () => submitWeek(ts.week_start), "Week submitted for client approval.")}
                className="focus-ring rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
              >
                Submit week for approval
              </button>
            ) : ts.rows.length > 0 ? (
              <span className="text-xs text-ink-5">
                {ts.engagement_statuses.map((s) => `${s.ref}: ${label(s.status)}`).join(" · ")}
              </span>
            ) : null}
          </div>
        }
      >
        {ts.rows.length === 0 ? (
          <p className="text-sm text-ink-5">No time logged in this week.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-ink-5">
                  <th className="py-2 text-left font-medium">Activity</th>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <th key={d} className="py-2 text-right font-medium">
                      {d}
                    </th>
                  ))}
                  <th className="py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {ts.rows.map((r) => (
                  <tr key={r.task_id} className="border-b border-line">
                    <td className="py-2.5 pr-3">
                      <p className="font-medium text-ink">{r.name}</p>
                      <p className="text-xs text-ink-5">
                        {r.ref} · {r.kind}
                      </p>
                    </td>
                    {r.days.map((m, i) => (
                      <td key={i} className={`py-2.5 text-right tabular-nums ${m ? "text-ink-2" : "text-faint"}`}>
                        {cell(m)}
                      </td>
                    ))}
                    <td className="py-2.5 text-right font-semibold tabular-nums text-ink">{(r.total_minutes / 60).toFixed(1)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="pt-3 font-semibold text-ink">Daily total</td>
                  {ts.day_totals.map((m, i) => (
                    <td key={i} className="pt-3 text-right font-medium tabular-nums text-ink-2">
                      {cell(m)}
                    </td>
                  ))}
                  <td className="pt-3 text-right font-bold tabular-nums text-ink">{(ts.total_minutes / 60).toFixed(1)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Time by activity type">
          {ts.by_kind.length === 0 ? (
            <p className="text-sm text-ink-5">Nothing logged this week.</p>
          ) : (
            <ul className="space-y-3">
              {ts.by_kind.map((k) => (
                <li key={k.kind}>
                  <div className="flex justify-between text-sm">
                    <span className="text-ink">{k.kind}</span>
                    <span className="text-ink-5">{hours(k.minutes)}</span>
                  </div>
                  <Bar value={Math.round((k.minutes / maxKind) * 100)} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Approval history" note="Clients have five business days to review a submitted week. Unreviewed weeks are approved automatically at the end of that period.">
          {data.approvals.length === 0 ? (
            <p className="text-sm text-ink-5">No weeks submitted yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {data.approvals.slice(0, 8).map((a) => (
                <li key={`${a.week_start}-${a.ref}`} className="flex flex-wrap items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">
                      Week of {fmtDate(a.week_start)} · {a.ref}
                    </p>
                    <p className="text-xs text-ink-5">{a.detail}</p>
                  </div>
                  <Chip status={label(a.status)} />
                  <span className="w-14 text-right text-sm font-semibold text-ink">{hours(a.minutes)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
      {week && (
        <button type="button" onClick={() => onWeek(undefined)} className="focus-ring mt-4 rounded text-sm text-accent hover:text-accent-dark">
          ← Back to this week
        </button>
      )}
    </section>
  );
}

function label(status: string): string {
  return (
    { draft: "Open", submitted: "Awaiting approval", approved: "Approved", auto_approved: "Auto-approved" }[status] ??
    status
  );
}

function nextFirst(todayIso: string): string {
  const d = new Date(`${todayIso}T00:00:00Z`);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)).toISOString();
}

function Stats({ items }: { items: [string, string, string?][] }) {
  return (
    <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([k, v, sub]) => (
        <div key={k} className="rounded-xl border border-line bg-surface p-4">
          <dt className="text-xs text-ink-5">{k}</dt>
          <dd className="mt-1 text-2xl font-extrabold tracking-[-0.02em] text-ink">{v}</dd>
          {sub && <dd className="mt-0.5 text-xs text-ink-5">{sub}</dd>}
        </div>
      ))}
    </dl>
  );
}

function Bar({ value }: { value: number }) {
  return (
    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sunken">
      <div className="h-full rounded-full bg-accent" style={{ width: `${value}%` }} />
    </div>
  );
}

function Chip({ status }: { status: string }) {
  // Green only for settled states: complete, approved, paid.
  const settled = ["Complete", "Approved", "Auto-approved", "Paid"].includes(status);
  const active = ["In progress", "In delivery", "In review", "Awaiting approval"].includes(status);
  const tone = settled
    ? "border-positive-line bg-positive-tint text-positive"
    : status === "Blocked"
      ? "border-ink-5 bg-muted font-semibold text-ink"
      : active
        ? "border-accent bg-accent-tint text-accent"
        : "border-line bg-sunken text-ink-5";
  return <span className={`shrink-0 rounded border px-2 py-0.5 text-xs ${tone}`}>{status}</span>;
}

function Panel({
  title,
  note,
  action,
  className = "",
  children,
}: {
  title: string;
  note?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`rounded-xl border border-line bg-surface p-5 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-ink">{title}</h3>
          {note && <p className="mt-1 max-w-xl text-xs text-ink-5">{note}</p>}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-6 rounded-xl border border-line bg-surface p-8">
      <h2 className="font-bold text-ink">{title}</h2>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-4">{body}</p>
    </div>
  );
}
