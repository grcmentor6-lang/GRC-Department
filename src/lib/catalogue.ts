import { apiGet } from "./api";

export interface Service {
  /** Stable identifier: stored on engagements, passed as ?codes=. Not shown to clients. */
  code: string;
  name: string;
  /** One sentence saying what the work produces. Shown under the name in the catalogue. */
  blurb: string;
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
export async function getCatalogue(): Promise<Catalogue> {
  // Retried because the home page and /services are prerendered at build time: a single dropped
  // connection to the API would otherwise fail the whole deploy, which it has done twice.
  // Three tries, a second apart; a backend that is genuinely down should still fail the build
  // rather than publish a catalogue-less home page.
  for (let attempt = 1; ; attempt++) {
    try {
      return await apiGet<Catalogue>("/gd/catalogue", { next: { revalidate: 3600 } });
    } catch (err) {
      if (attempt === 3) throw err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}
