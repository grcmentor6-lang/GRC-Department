/**
 * The GRC lead's side: the request queue.
 *
 * A separate session from the client portal, kept in its own storage key so signing in here never
 * touches a client session and neither can be mistaken for the other. Its token carries the
 * `gd_admin` scope, which no client token has and no client endpoint accepts.
 */

import { ApiError, BASE_URL, apiGet, apiPost } from "./api";

const KEY = "gd_ops_token";

export function getOpsToken(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setOpsToken(token: string | null) {
  try {
    if (token) sessionStorage.setItem(KEY, token);
    else sessionStorage.removeItem(KEY);
  } catch {
    /* private mode — the session simply does not persist */
  }
}

function auth(): RequestInit {
  const t = getOpsToken();
  return t ? { headers: { Authorization: `Bearer ${t}` } } : {};
}

export interface OpsRequest {
  id: string;
  reference: string;
  kind: string;
  status: string;
  contact_name: string | null;
  contact_email: string;
  org: string | null;
  org_region: string | null;
  services: { code: string; name: string; category: string | null }[];
  answers: Record<string, unknown>;
  notes: string | null;
  note_count: number;
  created_at: string;
}

export interface OpsNote {
  id: string;
  side: "client" | "grc";
  author: string;
  body: string;
  internal: boolean;
  at: string;
}

export async function opsLogin(email: string, password: string): Promise<{ name: string; email: string }> {
  const res = await apiPost<{ access_token: string; admin: { name: string; email: string } }>(
    "/gd/admin/login",
    { email, password },
  );
  setOpsToken(res.access_token);
  return res.admin;
}

export const opsMe = () => apiGet<{ name: string; email: string }>("/gd/admin/me", { ...auth(), cache: "no-store" });

export const opsQueue = (status?: string) =>
  apiGet<{ requests: OpsRequest[]; open: number; statuses: string[] }>(
    `/gd/admin/requests${status ? `?status=${encodeURIComponent(status)}` : ""}`,
    { ...auth(), cache: "no-store" },
  );

export const opsRequest = (id: string) =>
  apiGet<OpsRequest & { thread: OpsNote[] }>(`/gd/admin/requests/${id}`, { ...auth(), cache: "no-store" });

export const opsSetStatus = (id: string, status: string) =>
  apiPost<{ status: string }>(`/gd/admin/requests/${id}/status`, { status }, { token: getOpsToken() ?? undefined });

export const opsReply = (id: string, body: string, internal: boolean) =>
  apiPost<{ id: string }>(`/gd/admin/requests/${id}/reply`, { body, internal }, { token: getOpsToken() ?? undefined });

export { ApiError, BASE_URL };
