import type { MetadataRoute } from "next";
import { CONSULTANTS_ENABLED, SITE_URL } from "@/lib/flags";

/** The public, indexable pages. Consultant pages are listed only while that side is switched on. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/services", "/slack-and-teams", "/brief", "/portal", "/portal/signup"];
  if (CONSULTANTS_ENABLED) pages.push("/talent", "/consultants");
  return pages.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" || path === "/services" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
