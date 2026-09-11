import { apiGet } from "./api";
import type { PracticeArea } from "./catalogue";

export interface ConsultantCard {
  id: string;
  name: string;
  initials: string;
  location: string;
  cohort: string | null;
  headline: string;
  summary: string | null;
  region: string;
  timezone: string;
  /** Pre-rendered "UTC+5:30 · 14:00–22:00 IST" — the server owns the offset arithmetic. */
  window: string;
  availability: string;
  experience_years: number;
  practice_areas: string[];
  skills: string[];
  notice_days: number;
  response_hours: number;
  /** Null unless the caller stated a region; the four-hour rule is only meaningful against one. */
  overlap_minutes: number | null;
  overlap_label: string | null;
  is_seed: boolean;
}

export interface Competency {
  name: string;
  level: string;
  pct: string;
}

export interface HistoryEntry {
  title: string;
  meta: string;
  detail: string;
}

export interface ConsultantProfile extends ConsultantCard {
  bio: string | null;
  certifications: string[];
  tools: string[];
  languages: string[];
  hours_per_week: number;
  overlap_note: string | null;
  package_note: string | null;
  competencies: Competency[];
  history: HistoryEntry[];
}

export interface DirectoryFilters {
  practiceArea?: string[];
  availability?: string;
  minExperience?: number;
  region?: string;
  q?: string;
}

export interface Directory {
  consultants: ConsultantCard[];
  /** True when the listed profiles are fabricated demonstrations. The UI must say so. */
  is_demo_data: boolean;
  regions: string[];
  practice_areas: PracticeArea[];
}

function qs(f: DirectoryFilters): string {
  const p = new URLSearchParams();
  for (const a of f.practiceArea ?? []) p.append("practice_area", a);
  if (f.availability) p.set("availability", f.availability);
  if (f.minExperience) p.set("min_experience", String(f.minExperience));
  if (f.region) p.set("region", f.region);
  if (f.q) p.set("q", f.q);
  const s = p.toString();
  return s ? `?${s}` : "";
}

/**
 * Not cached: the listing depends on who is listed and on the client's stated region, and a
 * stale directory would offer somebody who has since come off the bench.
 */
export function getDirectory(filters: DirectoryFilters = {}): Promise<Directory> {
  return apiGet<Directory>(`/gd/consultants${qs(filters)}`, { cache: "no-store" });
}

export function getConsultant(
  id: string,
  region?: string,
): Promise<{ consultant: ConsultantProfile; is_demo_data: boolean }> {
  const r = region ? `?region=${encodeURIComponent(region)}` : "";
  return apiGet(`/gd/consultants/${id}${r}`, { cache: "no-store" });
}
