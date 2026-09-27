import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/flags";

/** Index the public pages; keep account screens and the signed-in portal out of search results. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /ops is our own queue. Keeping it out of search is tidiness, not security — the API
      // refuses anything without an admin token, so the URL alone buys you a login form.
      disallow: ["/portal/", "/consultant-portal", "/scoping", "/ops"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
