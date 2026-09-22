import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/flags";

/** Index the public pages; keep account screens and the signed-in portal out of search results. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/portal/", "/consultant-portal", "/scoping"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
