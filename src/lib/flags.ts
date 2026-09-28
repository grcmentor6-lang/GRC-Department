/**
 * Launch switches. Read at build time — NEXT_PUBLIC_ values are inlined into the bundle, so
 * changing one on Vercel needs a redeploy to take effect.
 *
 * CONSULTANTS_ENABLED — the consultant side of the site: the talent directory and profiles, the
 * For consultants page and listing application, the consultant portal, and the grcmentor.ai
 * talent-network story in the header, home page and footer. Off until there are qualified
 * GRC 101 graduates to list. The backend has its own switch (GD_CONSULTANTS_ENABLED) and must be
 * turned on with this one: this flag hides the pages, that one closes the API behind them.
 */
export const CONSULTANTS_ENABLED = process.env.NEXT_PUBLIC_CONSULTANTS_ENABLED === "1";

/**
 * PORTAL_ENABLED — the client portal: creating an account, signing in, and everything behind it
 * (dashboard, requests, team, Slack). Off for launch: a visitor sends a brief and we answer it by
 * email, which is the whole of the product until there is a reason to hold accounts. While it is
 * off every /portal page is a 404 and nothing links to one. The API behind it stays open, so
 * turning this on is one variable and a redeploy — no accounts are lost while it is off.
 */
export const PORTAL_ENABLED = process.env.NEXT_PUBLIC_PORTAL_ENABLED === "1";

/** Public origin, for absolute URLs in metadata. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://grcdepartment.com").replace(/\/$/, "");
