/**
 * "grc**department**" — set as one word with the second half in the accent, exactly as the
 * mockup's own thumbnail draws it. Tight tracking is part of the mark, not a style choice.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-semibold tracking-[-0.02em] text-ink ${className}`}>
      grc<span className="text-accent">department</span>
    </span>
  );
}
