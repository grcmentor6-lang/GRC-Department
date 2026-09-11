"use client";

import { useCallback, useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PortalSignIn } from "@/components/portal-signin";
import { PortalDashboard } from "@/components/portal-dashboard";
import { getMe, getPortal, getToken, setToken, type Contact, type Portal } from "@/lib/portal";

/**
 * Client-rendered rather than server-rendered, unlike every other page here: the session token
 * lives in the browser, so the server has nothing to render with. That is a consequence of the
 * sessionStorage decision in lib/portal.ts, and it goes away with the refresh-cookie upgrade.
 */
export default function PortalPage() {
  const [contact, setContact] = useState<Contact | null>(null);
  const [portal, setPortal] = useState<Portal | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setPortal(await getPortal());
      setError(null);
    } catch {
      setError("Could not load your engagements.");
    }
  }, []);

  // Resume an existing tab session. A stale or expired token drops us back to sign-in rather
  // than showing a broken shell.
  useEffect(() => {
    (async () => {
      if (getToken()) {
        try {
          setContact(await getMe());
          await load();
        } catch {
          setToken(null);
        }
      }
      setReady(true);
    })();
  }, [load]);

  async function onSignedIn(c: Contact) {
    setContact(c);
    await load();
  }

  function signOut() {
    setToken(null);
    setContact(null);
    setPortal(null);
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        {!ready ? (
          <p className="text-sm text-ink-5">Loading…</p>
        ) : !contact ? (
          <PortalSignIn onSignedIn={onSignedIn} />
        ) : error ? (
          <div className="rounded-xl border border-line bg-surface p-8">
            <h1 className="font-bold text-ink">{error}</h1>
            <button
              type="button"
              onClick={load}
              className="focus-ring mt-4 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
            >
              Try again
            </button>
          </div>
        ) : portal ? (
          <PortalDashboard
            contact={contact}
            portal={portal}
            onRefresh={load}
            onSignOut={signOut}
          />
        ) : (
          <p className="text-sm text-ink-5">Loading your engagements…</p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
