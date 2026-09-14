/**
 * Minimal typed client for the FastAPI backend.
 *
 * Deliberately smaller than web/src/lib/api.ts: this surface is public for now, so there is no
 * token attachment, no silent-refresh retry and no camel/snake conversion — the two endpoints
 * that exist return snake_case and the types below say so. When the portals land and need auth,
 * copy web/'s client rather than growing this one; it is already battle-tested.
 */

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * Every request gives up after this long. The backend runs on a free tier that can hang while it
 * cold-starts or crash-loops; without a limit a server-rendered page waits until Vercel kills the
 * function and shows its own error page, and a build-time fetch stalls static generation until the
 * whole deploy fails. A timeout turns both into an ordinary error the page can handle.
 */
const TIMEOUT_MS = 25_000;

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(TIMEOUT_MS),
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new ApiError(res.status, `GET ${path} failed`, await safeBody(res));
  return (await res.json()) as T;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const parsed = await safeBody(res);
    throw new ApiError(res.status, detailOf(parsed) ?? `POST ${path} failed`, parsed);
  }
  return (await res.json()) as T;
}

async function safeBody(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/** FastAPI puts the human-readable reason in `detail`; surface it instead of a generic message. */
function detailOf(body: unknown): string | null {
  if (body && typeof body === "object" && "detail" in body) {
    const d = (body as { detail: unknown }).detail;
    if (typeof d === "string") return d;
  }
  return null;
}
