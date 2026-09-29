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
 */
export function LiveChat() {
  if (!TAWK_ID) return null;
  return (
    <Script id="tawk-to" strategy="afterInteractive">
      {`(function(){var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;s1.src="https://embed.tawk.to/${TAWK_ID}";s1.charset="UTF-8";
s1.setAttribute("crossorigin","*");s0.parentNode.insertBefore(s1,s0);})();`}
    </Script>
  );
}
