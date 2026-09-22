import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL } from "@/lib/flags";
import "./globals.css";

// grcmentor's typefaces, exactly as web/src/app/layout.tsx loads them. GRC Department is the
// same company's placement side, so it reads in the same type; the mockup's Plus Jakarta Sans made
// the two sites look unrelated. next/font self-hosts both, so there is no render-blocking request.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "GRC Department — governance, risk and compliance, delivered as scoped services",
  description:
    "Scoped GRC services — assessments, policies, testing and compliance programmes — engaged singly or bundled, priced in a written proposal, and delivered remotely within your working hours.",
  openGraph: {
    siteName: "GRC Department",
    type: "website",
    url: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // The font variables go on <html>, not <body>: globals.css resolves --font-sans from them at the
    // root, and a variable set only on <body> is undefined there — the page silently falls back to
    // the system font (which is what the mockup's typeface had been doing all along).
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
