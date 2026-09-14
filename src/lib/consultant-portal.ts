"use client";

import { ApiError, BASE_URL, apiGet, apiPost } from "./api";

/**
 * Consultant-portal session, reads and writes.
 *
 * Sign-in uses the consultant's grcmentor learner account — same email, same password — and the
 * backend issues a consultant-scoped token that the learner app will not accept, and vice versa.
 * Token storage follows lib/portal.ts (sessionStorage, with the same noted ceiling).
 */
const KEY = "gd_consultant_token";
const TIMER_KEY = "gd_consultant_timer";

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) sessionStorage.setItem(KEY, token);
    else sessionStorage.removeItem(KEY);
  } catch {
    /* private mode — the session does not survive a reload */
  }
}

const auth = (): Record<string, string> => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

export interface ConsultantIdentity {
  id: string;
  name: string;
  initials: string;
  location: string;
  headline: string;
  window: string;
  practice_areas: string[];
  is_listed: boolean;
  rate_agreed: boolean;
}

export interface CProject {
  id: string;
  ref: string;
  name: string;
  stage: string;
  client: string;
  client_region: string | null;
  overlap: string | null;
  meets_overlap: boolean;
  lead: string | null;
  channel: string | null;
  started_on: string | null;
  due_on: string | null;
  rate: string;
  currency: string;
  progress: number;
  milestones_complete: number;
  milestones_total: number;
  logged_minutes: number;
  open_tasks: number;
  milestones: { name: string; status: string; due_on: string | null }[];
}

export interface CTask {
  id: string;
  name: string;
  kind: string;
  status: string;
  ref: string;
  client: string;
  due_note: string | null;
  estimate_minutes: number;
  logged_minutes: number;
  approved_minutes: number;
  closed: boolean;
  week_locked: boolean;
  advance: { to: string; label: string } | null;
}

export interface ConsultantPortal {
  consultant: ConsultantIdentity;
  today: string;
  stats: {
    active_engagements: number;
    open_tasks: number;
    blocked_tasks: number;
    week_minutes: number;
    month_minutes: number;
    approved_minutes: number;
    pending_minutes: number;
  };
  projects: CProject[];
  tasks: CTask[];
  timesheet: {
    week_start: string;
    days: string[];
    rows: { task_id: string; name: string; ref: string; kind: string; days: number[]; total_minutes: number }[];
    day_totals: number[];
    total_minutes: number;
    engagement_statuses: { ref: string; status: string }[];
    submittable: boolean;
    is_current_week: boolean;
    by_kind: { kind: string; minutes: number }[];
  };
  approvals: { week_start: string; ref: string; status: string; detail: string; minutes: number }[];
  earnings: {
    currency: string;
    earned: string;
    paid: string;
    due: string;
    pending_value: string;
    approved_minutes: number;
    pending_minutes: number;
    rows: {
      ref: string;
      name: string;
      client: string;
      stage: string;
      approved_minutes: number;
      rate: string;
      amount: string;
    }[];
    payouts: {
      period_start: string;
      period_end: string;
      minutes: number;
      amount: string;
      currency: string;
      status: string;
      method: string | null;
      paid_at: string | null;
    }[];
  };
}

export async function login(email: string, password: string): Promise<void> {
  const res = await apiPost<{ access_token: string }>("/gd/consultant/login", { email, password });
  setToken(res.access_token);
}

export const getPortal = (week?: string) =>
  apiGet<ConsultantPortal>(`/gd/consultant/portal${week ? `?week=${week}` : ""}`, {
    headers: auth(),
    cache: "no-store",
  });

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { ...auth(), ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const parsed = await res.json().catch(() => null);
  if (!res.ok) {
    const detail =
      parsed && typeof parsed === "object" && "detail" in parsed && typeof parsed.detail === "string"
        ? parsed.detail
        : "That did not go through.";
    throw new ApiError(res.status, detail, parsed);
  }
  return parsed as T;
}

export const logTime = (taskId: string, minutes: number, source: "timer" | "manual", workedOn?: string) =>
  post(`/gd/consultant/tasks/${taskId}/time`, { minutes, source, ...(workedOn ? { worked_on: workedOn } : {}) });

export const advanceTask = (taskId: string) => post(`/gd/consultant/tasks/${taskId}/advance`);

export const submitWeek = (weekStart: string) =>
  post<{ submitted: number }>("/gd/consultant/timesheet/submit", { week_start: weekStart });

/**
 * The running timer is kept in localStorage, not React state, so a reload or a closed tab does not
 * throw away an hour of tracked work. Only the start instant is stored; elapsed time is always
 * computed from it, so there is no ticking counter to drift or double-count.
 */
export interface RunningTimer {
  taskId: string;
  startedAt: number;
}

/** Start a timer for a task: the start instant is taken here and persisted in one step. */
export function beginTimer(taskId: string): RunningTimer {
  const t = { taskId, startedAt: Date.now() };
  writeTimer(t);
  return t;
}

export function readTimer(): RunningTimer | null {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    return raw ? (JSON.parse(raw) as RunningTimer) : null;
  } catch {
    return null;
  }
}

export function writeTimer(t: RunningTimer | null) {
  try {
    if (t) localStorage.setItem(TIMER_KEY, JSON.stringify(t));
    else localStorage.removeItem(TIMER_KEY);
  } catch {
    /* storage blocked — the timer then lives only as long as the page */
  }
}

export function hm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

export const hours = (minutes: number) => `${(minutes / 60).toFixed(1)} h`;

export function clock(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mmss = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return h ? `${h}:${mmss}` : mmss;
}
