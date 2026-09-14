/**
 * The mark every consultant card carries, so a real person and an invented one are never
 * confusable in a mixed list.
 *
 * Real: green, because it is a settled claim — the profile is derived from graded work.
 * Demonstration: muted and explicit. It does not borrow any positive hue.
 */
export function ProfileMark({ isSeed }: { isSeed: boolean }) {
  return isSeed ? (
    <span className="rounded-full border border-line-strong bg-muted px-2 py-0.5 text-[11px] font-semibold text-ink-3">
      Demonstration profile
    </span>
  ) : (
    <span className="rounded-full border border-positive-line bg-positive-tint px-2 py-0.5 text-[11px] font-semibold text-positive">
      Listed from assessed work
    </span>
  );
}
