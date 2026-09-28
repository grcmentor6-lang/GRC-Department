import { notFound } from "next/navigation";
import { PORTAL_ENABLED } from "@/lib/flags";

/**
 * The client portal is off for launch (NEXT_PUBLIC_PORTAL_ENABLED). Briefs arrive by form and are
 * answered by email; nobody holds an account yet. While it is off every page here is a 404 rather
 * than an unlinked live page, so a shared or guessed URL cannot walk into a half-launched product.
 */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  if (!PORTAL_ENABLED) notFound();
  return children;
}
