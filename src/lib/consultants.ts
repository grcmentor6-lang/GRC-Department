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
}

export interface Competency {
  name: string;
  level: string;
  pct: string;
  /** Real consultants only: which graded evidence the figure comes from. */
  basis?: "rubric" | "judgment";
}

/** A consultant's record, derived from their graded grcmentor work. */
export interface Assessment {
  programme: string | null;
  verified_activities: number;
  total_activities: number;
  average_score: number | null;
  judgment_calls: number;
  programme_work: { org: string; industry: string | null; tasks: number }[];
  standards: string[];
  assessed_at: string | null;
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
  competencies: Competency[];
  history: HistoryEntry[];
  assessment: Assessment;
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

/**
 * The home page's shortlist and "available for engagement" strip. Cached for five minutes rather
 * than fetched per request, so the landing page stays fast and does not wake the backend for
 * every visitor; a newly listed consultant appears within that window.
 */
export function getDirectoryPreview(): Promise<Directory> {
  return apiGet<Directory>("/gd/consultants", { next: { revalidate: 300 } });
}

export function getConsultant(
  id: string,
  region?: string,
): Promise<{ consultant: ConsultantProfile }> {
  const r = region ? `?region=${encodeURIComponent(region)}` : "";
  return apiGet(`/gd/consultants/${id}${r}`, { cache: "no-store" });
}
