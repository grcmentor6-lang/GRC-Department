import { apiGet } from "./api";

export interface Service {
  code: string;
  name: string;
}

export interface Category {
  code: string;
  name: string;
  blurb: string;
  /** What one of these is bought in — "assessment", "plan", "cycle". */
  unit: string;
  /** The first of the six scoping questions, which is per category. */
  scope_question: string;
  scope_options: string[];
  services: Service[];
}

export interface PracticeArea {
  code: string;
  name: string;
  desc: string;
}

export interface Catalogue {
  categories: Category[];
  practice_areas: PracticeArea[];
  service_count: number;
}

/**
 * The catalogue is identical for every visitor and changes about never, so it is fetched once
 * on the server and cached for an hour rather than re-requested per navigation. A deploy that
 * changes _seed/gd_services.json also restarts the server, which clears this.
 */
export function getCatalogue(): Promise<Catalogue> {
  return apiGet<Catalogue>("/gd/catalogue", { next: { revalidate: 3600 } });
}
