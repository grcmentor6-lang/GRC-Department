/**
 * The handful of field shapes both capture forms use. Not a form library — three wrappers and
 * two class strings, because the alternative is repeating the same label/input pair a dozen
 * times and having them drift.
 */
import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink " +
  "placeholder:text-faint focus-ring";

export const selectClass = `${inputClass} appearance-none bg-[length:0]`;

export function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      {hint && <p className="mt-1 text-xs text-ink-5">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

/**
 * A one-of-N choice rendered as cards rather than a <select>, for the questions where the
 * options are sentences the reader has to weigh against each other — the scoping boundary
 * question especially. Radio inputs stay in the markup so keyboard and screen-reader
 * behaviour is the browser's, not ours.
 */
export function ChoiceCards({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <label
            key={opt}
            className={`focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent
              flex cursor-pointer items-start gap-2.5 rounded-lg border p-3.5 text-sm transition-colors ${
                selected
                  ? "border-accent bg-accent-tint text-ink"
                  : "border-line bg-surface text-ink-4 hover:border-line-strong"
              }`}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={selected}
              onChange={() => onChange(opt)}
              className="mt-0.5 accent-[var(--gd-accent)]"
            />
            <span className="leading-snug">{opt}</span>
          </label>
        );
      })}
    </div>
  );
}

/** Shown after either form posts. The copy differs; the shape does not. */
export function Submitted({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-positive-line bg-positive-tint p-8">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-positive text-lg text-white">
        ✓
      </div>
      <h2 className="mt-4 text-xl font-bold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-3">{summary}</p>
      {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}
