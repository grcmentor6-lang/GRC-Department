"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ConsultantSignIn } from "@/components/consultant-signin";
import { getToken } from "@/lib/consultant-portal";

const DASHBOARD = "/consultant-portal/dashboard";

/**
 * The consultant portal's sign-in page. Signing in moves to /consultant-portal/dashboard, its own
 * page; a visitor who already has a consultant session in this tab is sent straight on.
 */
export default function ConsultantSignInPage() {
  const router = useRouter();

  useEffect(() => {
    if (getToken()) router.replace(DASHBOARD);
  }, [router]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <ConsultantSignIn onSignedIn={() => router.push(DASHBOARD)} />
      </main>
      <SiteFooter />
    </>
  );
}
