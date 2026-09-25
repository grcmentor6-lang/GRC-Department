"use client";

import { apiGet, apiPost, BASE_URL } from "./api";

/**
 * Client-portal session and reads.
 *
 * The token lives in `sessionStorage`, so it dies with the tab.
 * ponytail: this is weaker than the learner app, which keeps the access token in memory and
 * refreshes it from an httpOnly cookie (web/src/lib/token.ts) — a token in web storage is
 * readable by any injected script. Acceptable while the portal has few users and the
 * token is short-lived; the upgrade is to add the refresh-cookie endpoints for CLIENT_SCOPE and
 * copy web/'s client wholesale, which is also what removes the re-login on reload.
 */
const KEY = "gd_client_token";

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
    /* private mode — the session simply does not persist across a reload */
  }
}

function auth(): RequestInit {
  const t = getToken();
  return t ? { headers: { Authorization: `Bearer ${t}` } } : {};
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  job_title: string | null;
  org: { id: string; name: string; business_region: string } | null;
}

export interface ServiceLine {
  code: string;
  name: string;
  category: string | null;
  price: string;
  resolved: boolean;
}

export interface Milestone {
  id: string;
  name: string;
  status: string;
  due_on: string | null;
}

export interface DeliverableItem {
  id: string;
  name: string;
  status: string;
  version: number;
  submitted_at: string | null;
  accepted_at: string | null;
  can_accept: boolean;
}

export interface Ask {
  id: string;
  name: string;
  owner: string | null;
  status: string;
  due_on: string | null;
  overdue: boolean;
}

export interface Project {
  id: string;
  ref: string;
  name: string;
  stage: string;
  progress: number;
  milestones_complete: number;
  milestones_total: number;
  started_on: string | null;
  due_on: string | null;
  trial_ends_on: string | null;
  in_trial: boolean;
  channel: string | null;
  currency: string;
  billing_period: string | null;
  quoted_total: string;
  services: ServiceLine[];
  consultant: { id: string; name: string; initials: string; window: string } | null;
  milestones: Milestone[];
  deliverables: DeliverableItem[];
  asks: Ask[];
}

export interface PendingTimesheet {
  id: string;
  ref: string;
  engagement: string;
  consultant: string;
  week_start: string;
  minutes: number;
  submitted_at: string | null;
  auto_approves_at: string;
}

export interface Portal {
  projects: Project[];
  timesheets: PendingTimesheet[];
  stats: {
    active: number;
    deliverables_outstanding: number;
    items_owed_by_you: number;
    requests_in_flight: number;
    timesheets_to_approve: number;
  };
  requests: { id: string; reference: string; kind: string; status: string; services: ServiceLine[]; created_at: string }[];
  activity: { who: string; what: string; at: string }[];
}

/** Mirrors backend app/core/password_policy.py, so the form can say what is wrong before submitting. */
export const PASSWORD_RULE =
  "At least 10 characters, with an uppercase letter, a lowercase letter, a digit and a symbol.";

export function passwordProblem(pw: string): string | null {
  if (pw.length < 10 || !/[A-Z]/.test(pw) || !/[a-z]/.test(pw) || !/\d/.test(pw) || !/[^A-Za-z0-9]/.test(pw)) {
    return PASSWORD_RULE;
  }
  return null;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  company: string;
  job_title?: string;
  business_region: "Americas" | "EMEA" | "APAC";
}

export const signup = (input: SignupInput) =>
  apiPost<{ message: string; email: string }>("/gd/client/signup", input);

export const resendVerification = (email: string) =>
  apiPost<{ message: string }>("/gd/client/resend-verification", { email });

export const forgotPassword = (email: string) =>
  apiPost<{ message: string }>("/gd/client/password/forgot", { email });

/** Confirm an email from its link. Signs the contact in on success. */
export async function verifyEmail(token: string): Promise<Contact> {
  const res = await apiPost<{ access_token: string; contact: Contact }>("/gd/client/verify", { token });
  setToken(res.access_token);
  return res.contact;
}

/** Set a new password from a reset link. Signs the contact in on success. */
export async function resetPassword(token: string, password: string): Promise<Contact> {
  const res = await apiPost<{ access_token: string; contact: Contact }>("/gd/client/password/reset", { token, password });
  setToken(res.access_token);
  return res.contact;
}

export async function login(email: string, password: string): Promise<Contact> {
  const res = await apiPost<{ access_token: string; contact: Contact }>("/gd/client/login", {
    email,
    password,
  });
  setToken(res.access_token);
  return res.contact;
}

export const getMe = () => apiGet<Contact>("/gd/client/me", { ...auth(), cache: "no-store" });

export const getPortal = () =>
  apiGet<Portal>("/gd/client/portal", { ...auth(), cache: "no-store" });

/** A chat platform this organisation could connect, and whether it has. Never carries a token. */
export interface ChatChannel {
  id: string;
  name: string;
  /** Opens the channel in the client's Slack. */
  url: string;
}

export interface ChatPlatform {
  platform: "slack" | "teams";
  label: string;
  /** False when this deploy has no app credentials for it: show it as unavailable, not broken. */
  available: boolean;
  connected: boolean;
  workspace_name: string | null;
  connected_by: string | null;
  connected_at: string | null;
  /** The channel we created for them, once they have asked for one. */
  channel: ChatChannel | null;
}

/** Which sign-up buttons to offer. Public: the sign-up page asks before anyone has an account. */
export const getSignupPlatforms = () =>
  apiGet<{ platforms: { platform: "slack" | "teams"; label: string; available: boolean }[] }>(
    "/gd/client/chat/platforms",
    { cache: "no-store" },
  );

/** Where a "Sign up with …" button sends the browser. A redirect, not a fetch. */
export const signupWithUrl = (platform: string) => `${BASE_URL}/gd/client/chat/${platform}/signup`;

/** Trade the token in the return URL for a session, the way a confirmation link does. */
export async function sessionFromHandoff(token: string): Promise<Contact> {
  const res = await apiPost<{ access_token: string; contact: Contact }>("/gd/client/chat/session", { token });
  setToken(res.access_token);
  return res.contact;
}

export const getChatPlatforms = () =>
  apiGet<{ platforms: ChatPlatform[] }>("/gd/client/chat", { ...auth(), cache: "no-store" });

/** Where to send the client to authorise. The platform, not us, asks them to approve. */
export const startChatConnect = (platform: string) =>
  apiPost<{ url: string }>(`/gd/client/chat/${platform}/start`, {}, { token: getToken() ?? undefined });

/** Retry the channel, for a workspace that refused one when it was connected. */
export const createChatChannel = (platform: string) =>
  apiPost<ChatChannel>(`/gd/client/chat/${platform}/channel`, {}, { token: getToken() ?? undefined });

export async function disconnectChat(platform: string): Promise<void> {
  const t = getToken();
  const res = await fetch(`${BASE_URL}/gd/client/chat/${platform}`, {
    method: "DELETE",
    headers: t ? { Authorization: `Bearer ${t}` } : {},
  });
  if (!res.ok) throw new Error("Could not disconnect. Try again.");
}

export async function acceptDeliverable(id: string): Promise<void> {
  const t = getToken();
  // BASE_URL, not the raw env var: api.ts strips a trailing slash, and "https://x.onrender.com/"
  // typed into a hosting dashboard would otherwise make this one call hit "//gd/..." and 404
  // while every other request kept working.
  const res = await fetch(`${BASE_URL}/gd/client/deliverables/${id}/accept`, {
    method: "POST",
    headers: t ? { Authorization: `Bearer ${t}` } : {},
  });
  if (!res.ok) throw new Error("Could not accept this deliverable.");
}

export async function approveTimesheet(id: string): Promise<void> {
  const t = getToken();
  const res = await fetch(`${BASE_URL}/gd/client/timesheets/${id}/approve`, {
    method: "POST",
    headers: t ? { Authorization: `Bearer ${t}` } : {},
  });
  if (!res.ok) throw new Error("Could not approve this timesheet.");
}

/** "12 Jun 2026" — the format the whole product uses. */
export function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fmtMoney(amount: string, currency: string): string {
  const n = Number(amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}
