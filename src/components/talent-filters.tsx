"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { PracticeArea } from "@/lib/catalogue";

const AVAILABILITY = ["Full-time", "Part-time", "Project-based"];
const EXPERIENCE = [
  { value: 0, label: "Any experience" },
  { value: 5, label: "5+ years" },
  { value: 7, label: "7+ years" },
  { value: 10, label: "10+ years" },
];

/**
 * Filters live in the URL, not in state.
 *
 * The directory is server-rendered — the overlap arithmetic that decides who appears runs on
 * the backend — so a filter change has to become a request. Putting the filters in the query
 * string gets that for free, and makes a shortlist a link a GRC lead can send to a client.
 */
export function TalentFilters({
  practiceAreas,
  regions,
  resultCount,
}: {
  practiceAreas: PracticeArea[];
  regions: string[];
  resultCount: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const selectedAreas = params.getAll("practice_area");
  const region = params.get("region") ?? "";
  const availability = params.get("availability") ?? "";
  const minExperience = Number(params.get("min_experience") ?? 0);

  function apply(mutate: (p: URLSearchParams) => void) {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    startTransition(() => router.push(`/talent?${next.toString()}`, { scroll: false }));
  }

  const toggleArea = (code: string) =>
    apply((p) => {
      const current = p.getAll("practice_area");
      p.delete("practice_area");
      const next = current.includes(code)
        ? current.filter((c) => c !== code)
        : [...current, code];
      next.forEach((c) => p.append("practice_area", c));
    });

  const setOne = (key: string, value: string) =>
    apply((p) => (value ? p.set(key, value) : p.delete(key)));

  const hasFilters = selectedAreas.length > 0 || region || availability || minExperience > 0;

  return (
    <aside className={pending ? "opacity-60 transition-opacity" : "transition-opacity"}>
      <div className="space-y-7 rounded-xl border border-line bg-surface p-5">
        <div>
          <h2 className="text-sm font-bold text-ink">Your business hours</h2>
          <p className="mt-1 text-xs leading-relaxed text-ink-5">
            Choosing one hides anyone who cannot give you four hours of daily overlap, and shows
            how much each of the rest offers.
          </p>
          <div className="mt-3 space-y-1.5">
            {["", ...regions].map((r) => (
              <label key={r || "any"} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="region"
                  checked={region === r}
                  onChange={() => setOne("region", r)}
                  className="accent-[var(--gd-accent)]"
                />
                <span className={region === r ? "font-medium text-ink" : "text-ink-4"}>
                  {r || "Any region"}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-line pt-5">
          <h2 className="text-sm font-bold text-ink">Practice area</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {practiceAreas.map((a) => {
              const on = selectedAreas.includes(a.code);
              return (
                <button
                  key={a.code}
                  type="button"
                  onClick={() => toggleArea(a.code)}
                  title={a.desc}
                  className={`focus-ring rounded-full border px-2.5 py-1 text-xs font-medium ${
                    on
                      ? "border-accent bg-accent text-white"
                      : "border-line-strong bg-surface text-ink-4 hover:border-ink-5 hover:text-ink"
                  }`}
                >
                  {a.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-line pt-5">
          <h2 className="text-sm font-bold text-ink">Availability</h2>
          <select
            value={availability}
            onChange={(e) => setOne("availability", e.target.value)}
            className="focus-ring mt-3 w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink"
          >
            <option value="">Any availability</option>
            {AVAILABILITY.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>

        <div className="border-t border-line pt-5">
          <h2 className="text-sm font-bold text-ink">Experience</h2>
          <select
            value={minExperience}
            onChange={(e) => setOne("min_experience", e.target.value === "0" ? "" : e.target.value)}
            className="focus-ring mt-3 w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink"
          >
            {EXPERIENCE.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between border-t border-line pt-5 text-sm">
          <span className="text-ink-5">
            {resultCount} consultant{resultCount === 1 ? "" : "s"}
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={() => startTransition(() => router.push("/talent", { scroll: false }))}
              className="focus-ring rounded font-medium text-accent hover:text-accent-dark"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
