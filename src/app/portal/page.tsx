"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PortalSignIn } from "@/components/portal-signin";
import { getToken } from "@/lib/portal";

const DASHBOARD = "/portal/dashboard";

/**
 * The client portal's sign-in page. Signing in moves to /portal/dashboard, a page of its own, so
 * the signed-in view has its own URL (bookmarkable, back-button safe) instead of swapping content
 * in place. A visitor who already has a session in this tab is sent straight on.
 */
export default function PortalSignInPage() {
  const router = useRouter();

  useEffect(() => {
    if (getToken()) router.replace(DASHBOARD);
  }, [router]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <PortalSignIn onSignedIn={() => router.push(DASHBOARD)} />
      </main>
      <SiteFooter />
    </>
  );
}
