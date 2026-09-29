import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/flags";

/**
 * Index the public pages; keep account screens and the signed-in portal out of search results.
 *
 * The AI crawlers are named one by one and allowed. That is not decoration: several hosts and
 * CDNs now block them by default, and a firm that cannot be read by ChatGPT, Claude or Perplexity
 * cannot be recommended by them either — which for a service bought by people asking "who does
 * ISO 42001 readiness?" is most of the point. Each one still inherits the disallow list below,
 * because a crawler that indexes /ops helps nobody.
 */
const AI_CRAWLERS = [
  // OpenAI: training, ChatGPT search, and browsing on a user's request.
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  // Anthropic.
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  // Perplexity.
  "PerplexityBot",
  "Perplexity-User",
  // Google's AI training and AI Overviews, separate from Googlebot's ordinary crawl.
  "Google-Extended",
  // Apple Intelligence.
  "Applebot-Extended",
  // Bing, which also feeds Copilot and some ChatGPT results.
  "Bingbot",
  // The dataset a great many models are trained on.
  "CCBot",
];

// /ops is our own queue. Keeping it out of search is tidiness, not security — the API refuses
// anything without an admin token, so the URL alone buys you a login form.
const DISALLOW = ["/portal/", "/consultant-portal", "/scoping", "/ops", "/api/", "/_next/data/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
