import { notFound } from "next/navigation";
import { CONSULTANTS_ENABLED } from "@/lib/flags";

/**
 * The consultant side is off until there are qualified GRC 101 graduates to list
 * (NEXT_PUBLIC_CONSULTANTS_ENABLED). While it is off every page in this section is a 404 — not a
 * hidden link to a live page — and the backend closes the API behind it (GD_CONSULTANTS_ENABLED).
 */
export default function ConsultantSideLayout({ children }: { children: React.ReactNode }) {
  if (!CONSULTANTS_ENABLED) notFound();
  return children;
}
