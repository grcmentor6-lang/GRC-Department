"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PortalFrame } from "@/components/portal-frame";
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
    <PortalFrame>
      <PortalSignIn onSignedIn={() => router.push(DASHBOARD)} />
    </PortalFrame>
  );
}
