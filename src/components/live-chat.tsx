import Script from "next/script";
import { TAWK_ID } from "@/lib/flags";

/**
 * tawk.to's live-chat bubble.
 *
 * Renders nothing unless NEXT_PUBLIC_TAWK_ID is set, so local development and any deploy without
 * an ID stay clean — a half-configured widget is worse than none: it loads, shows a bubble, and
 * drops whatever a visitor types into an account nobody is watching.
 *
 * afterInteractive, never beforeInteractive: a third party's script must not sit in front of the
 * page a visitor came for. The widget appears a moment later, which is what it does on every
 * other site too.
 *
 * The two globals on the first line are tawk's, not ours, and are part of their documented
 * snippet: Tawk_LoadStart is read when the widget registers its session, and Tawk_API is the
 * handle any later call (setAttributes, hideWidget) needs. Omitting them left the first
 * POST /v1/session/start failing with a 400 before the client's own retry recovered it — a
 * console error on every page load and a visible delay before the bubble.
 */
export function LiveChat() {
  if (!TAWK_ID) return null;
  return (
    <Script id="tawk-to" strategy="afterInteractive">
      {`var Tawk_API=Tawk_API||{},Tawk_LoadStart=new Date();
(function(){var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;s1.src="https://embed.tawk.to/${TAWK_ID}";s1.charset="UTF-8";
s1.setAttribute("crossorigin","*");s0.parentNode.insertBefore(s1,s0);})();`}
    </Script>
  );
}
