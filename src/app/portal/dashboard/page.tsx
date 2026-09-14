"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CLIENT_VIEWS, PortalDashboard, type ClientView } from "@/components/portal-dashboard";
import { ApiError } from "@/lib/api";
import { getMe, getPortal, getToken, setToken, type Contact, type Portal } from "@/lib/portal";

const SIGN_IN = "/portal";

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <p className="text-sm text-ink-5">Loading your portal…</p>
    </div>
  );
}

/**
 * The signed-in client portal: an application shell with its own sections. Client-rendered — the
 * session token lives in the browser — and a missing or rejected session goes back to sign-in.
 */
function Dashboard() {
  const router = useRouter();
  const params = useSearchParams();
  const requested = params.get("view") as ClientView | null;
  const view: ClientView = requested && CLIENT_VIEWS.includes(requested) ? requested : "overview";

  const [contact, setContact] = useState<Contact | null>(null);
  const [portal, setPortal] = useState<Portal | null>(null);
  const [error, setError] = useState<string | null>(null);

  const leave = useCallback(() => {
    setToken(null);
    router.replace(SIGN_IN);
  }, [router]);

  const load = useCallback(async () => {
    try {
      setPortal(await getPortal());
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return leave();
      setError("Could not load your engagements.");
    }
  }, [leave]);

  useEffect(() => {
    if (!getToken()) {
      router.replace(SIGN_IN);
      return;
    }
    (async () => {
      try {
        setContact(await getMe());
        await load();
      } catch {
        leave();
      }
    })();
  }, [router, load, leave]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4">
        <div className="rounded-xl border border-line bg-surface p-8">
          <h1 className="font-semibold text-ink">{error}</h1>
          <button
            type="button"
            onClick={load}
            className="focus-ring mt-4 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
  if (!contact || !portal) return <Loading />;

  return <PortalDashboard contact={contact} portal={portal} view={view} onRefresh={load} onSignOut={leave} />;
}

export default function PortalDashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  );
}
