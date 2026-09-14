"use client";

import { useCallback, useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ConsultantSignIn } from "@/components/consultant-signin";
import { ConsultantDashboard } from "@/components/consultant-dashboard";
import { getPortal, getToken, setToken, type ConsultantPortal } from "@/lib/consultant-portal";
import { ApiError } from "@/lib/api";

/** Client-rendered for the same reason as /portal: the session token lives in the browser. */
export default function ConsultantPortalPage() {
  const [data, setData] = useState<ConsultantPortal | null>(null);
  const [week, setWeek] = useState<string | undefined>(undefined);
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (w?: string) => {
    try {
      setData(await getPortal(w));
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setToken(null);
        setSignedIn(false);
        return;
      }
      setError("Could not load your portal.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (getToken()) {
        setSignedIn(true);
        await load();
      }
      setReady(true);
    })();
  }, [load]);

  async function changeWeek(w: string | undefined) {
    setWeek(w);
    await load(w);
  }

  function signOut() {
    setToken(null);
    setSignedIn(false);
    setData(null);
    setWeek(undefined);
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        {!ready ? (
          <p className="text-sm text-ink-5">Loading…</p>
        ) : !signedIn ? (
          <ConsultantSignIn
            onSignedIn={async () => {
              setSignedIn(true);
              await load();
            }}
          />
        ) : error ? (
          <div className="rounded-xl border border-line bg-surface p-8">
            <h1 className="font-bold text-ink">{error}</h1>
            <button
              type="button"
              onClick={() => load(week)}
              className="focus-ring mt-4 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
            >
              Try again
            </button>
          </div>
        ) : data ? (
          <ConsultantDashboard
            data={data}
            week={week}
            onWeek={changeWeek}
            reload={() => load(week)}
            onSignOut={signOut}
          />
        ) : (
          <p className="text-sm text-ink-5">Loading your portal…</p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
