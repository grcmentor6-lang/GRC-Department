/**
 * Shown wherever fabricated consultant profiles are on screen.
 *
 * This is not decoration and it is not a debug affordance. The seeded profiles carry invented
 * engagement histories — "a clean Type II opinion, no exceptions" for a company that does not
 * exist — and a visitor who reads one as a real person they can hire has been misled. The
 * backend flags the data (`is_demo_data`); this is the flag made visible, and it stays until
 * real graduates are listed.
 */
export function DemoNotice() {
  return (
    <div className="rounded-xl border border-line-strong bg-muted p-4">
      <p className="text-sm font-semibold text-ink">Some profiles below are demonstrations</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-4">
        Profiles marked <span className="font-semibold text-ink-2">Demonstration profile</span> are
        illustrative examples, not real people, and their engagement histories are invented. Profiles
        marked <span className="font-semibold text-positive">Listed from assessed work</span> are real
        grcmentor.ai consultants whose figures come from graded work.{" "}
        <a
          href="/brief"
          className="focus-ring rounded font-medium text-accent underline underline-offset-2 hover:text-accent-dark"
        >
          Submit a brief
        </a>{" "}
        and a GRC lead will tell you what is genuinely available.
      </p>
    </div>
  );
}
