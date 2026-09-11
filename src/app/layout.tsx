import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// The mockup's typeface. next/font self-hosts it, so there is no render-blocking
// request to fonts.googleapis.com and no layout shift on first paint.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GRC Department — remote governance, risk and compliance practitioners",
  description:
    "Vetted remote GRC consultants placed with organisations worldwide. The talent network of grcmentor.ai.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} antialiased`}>{children}</body>
    </html>
  );
}
