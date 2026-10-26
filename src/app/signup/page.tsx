import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SignupForm } from "@/components/signup-form";

export const metadata: Metadata = {
  title: "Get your GRC department — GRC Department",
  description:
    "Answer seven questions, add it to your Slack, and your governance, risk and compliance department starts work. Everything happens in your own workspace.",
};

export default function SignupPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Get started</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
          Your GRC department, inside the chat you already use.
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-4">
          Seven questions, then you add it to Slack. There is no portal to log into and no
          software to learn — onboarding, your GRC map, your weekly plan and your consultant all
          arrive in your own workspace.
        </p>

        <div className="mt-10">
          <SignupForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
