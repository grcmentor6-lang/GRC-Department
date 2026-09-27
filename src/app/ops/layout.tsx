import type { Metadata } from "next";

/** Unlisted: never indexed, never linked, and no part of the public site's chrome. */
export const metadata: Metadata = {
  title: "Internal — GRC Department",
  robots: { index: false, follow: false },
};

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
