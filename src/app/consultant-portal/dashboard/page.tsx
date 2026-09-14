"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CONSULTANT_VIEWS, ConsultantDashboard, type ConsultantView } from "@/components/consultant-dashboard";
import { ApiError } from "@/lib/api";
import { getPortal, getToken, setToken, type ConsultantPortal } from "@/lib/consultant-portal";

const SIGN_IN = "/consultant-portal";

function Loading({ text }: { text: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <p className="text-sm text-ink-5">{text}</p>
    </div>
  );
}

/**
 * The signed-in consultant portal: an application shell with its own sections, not a marketing
 * page. Client-rendered — the session token lives in the browser — and a missing or rejected
 * session goes back to the sign-in page.
 */
function Dashboard() {
  const router = useRouter();
  const params = useSearchParams();
  const requested = params.get("view") as ConsultantView | null;
  const view: ConsultantView = requested && CONSULTANT_VIEWS.includes(requested) ? requested : "overview";

  const [data, setData] = useState<ConsultantPortal | null>(null);
  const [week, setWeek] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const leave = useCallback(() => {
    setToken(null);
    router.replace(SIGN_IN);
  }, [router]);

  const load = useCallback(
    async (w?: string) => {
      try {
        setData(await getPortal(w));
        setError(null);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return leave();
        setError("Could not load your portal.");
      }
    },
    [leave],
  );

  useEffect(() => {
    if (!getToken()) {
      router.replace(SIGN_IN);
      return;
    }
    (async () => {
      await load();
    })();
  }, [router, load]);

  async function changeWeek(w: string | undefined) {
    setWeek(w);
    await load(w);
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4">
        <div className="rounded-xl border border-line bg-surface p-8">
          <h1 className="font-semibold text-ink">{error}</h1>
          <button
            type="button"
            onClick={() => load(week)}
            className="focus-ring mt-4 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
  if (!data) return <Loading text="Loading your portal…" />;

  return (
    <ConsultantDashboard data={data} view={view} week={week} onWeek={changeWeek} reload={() => load(week)} onSignOut={leave} />
  );
}

export default function ConsultantDashboardPage() {
  return (
    <Suspense fallback={<Loading text="Loading your portal…" />}>
      <Dashboard />
    </Suspense>
  );
}
