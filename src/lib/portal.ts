"use client";

import { apiGet, apiPost, BASE_URL } from "./api";

/**
 * Client-portal session and reads.
 *
 * The token lives in `sessionStorage`, so it dies with the tab.
 * ponytail: this is weaker than the learner app, which keeps the access token in memory and
 * refreshes it from an httpOnly cookie (web/src/lib/token.ts) — a token in web storage is
 * readable by any injected script. Acceptable while the portal is behind a demo login and the
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
  consultant: { id: string; name: string; initials: string; window: string; is_seed: boolean } | null;
  milestones: Milestone[];
  deliverables: DeliverableItem[];
  asks: Ask[];
}

export interface Portal {
  projects: Project[];
  stats: {
    active: number;
    deliverables_outstanding: number;
    items_owed_by_you: number;
    requests_in_flight: number;
  };
  requests: { id: string; kind: string; status: string; services: ServiceLine[]; created_at: string }[];
  activity: { who: string; what: string; at: string }[];
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
