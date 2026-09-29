import { getCatalogue } from "@/lib/catalogue";
import { SITE_URL } from "@/lib/flags";

/**
 * /llms.txt — a plain-text brief for the models that answer "who can help us with ISO 42001?".
 *
 * It exists so an AI reads what we actually do rather than inferring it from navigation and
 * script tags. The convention is emerging rather than standard, and it costs one route.
 *
 * Generated, not written: the service count, the categories and their descriptions come from the
 * same catalogue the site renders, so this file cannot describe a business we no longer run. The
 * only hand-written parts are the facts a catalogue does not hold — and the line about not
 * issuing audit opinions, which is here deliberately: left out, these tools describe us as an
 * auditor or a certification body, which we are not and may not claim to be.
 */
export const revalidate = 3600;

export async function GET() {
  const { categories, service_count } = await getCatalogue();

  const body = `# GRC Department

> GRC Department (${SITE_URL.replace("https://", "")}) delivers governance, risk and compliance (GRC) work as discrete, scoped services: assessments, policies, testing and full compliance programmes. Clients engage a single service or bundle several, receive a written proposal with scope, duration and price within one business day, and the work is delivered remotely with at least four hours of daily overlap with the client's business hours, in any time zone.

Key facts:
- Service model: a catalogue of ${service_count} scoped services across ${categories.length} categories, engaged singly, as a bundled programme, or as continuing support.
- Pricing: every service is priced in a written proposal before work starts. Briefs and scoping requests are free and carry no obligation.
- Frameworks covered: SOC 2, ISO/IEC 27001, ISO/IEC 27701, ISO/IEC 42001, GDPR, India's DPDPA, PCI DSS 4.0.1, HIPAA, HITRUST, NIST CSF, NIST AI RMF and the EU AI Act.
- Every engagement begins with a two-week trial period.
- GRC Department prepares organisations for audit and supports the audit process. It does not issue audit opinions or certifications; those remain with the client's licensed audit firm or accredited certification body.

## Start here
- [Submit an engagement brief](${SITE_URL}/brief): describe the framework, current state and deadline; a GRC lead returns a scoped proposal. This is also how to reach us.
- [Service catalogue](${SITE_URL}/services): browse and select individual services or build a bundle.
- [How it works](${SITE_URL}/#how-it-works): choose services, answer six scoping questions, receive a proposal, delivery under one agreement.
- [Engagement models](${SITE_URL}/#engagement-models): single service, bundled programme, continuing support.

## Service categories
${categories
  .map((c) => `- [${c.name} (${c.code})](${SITE_URL}/services?cat=${c.code}): ${c.blurb}`)
  .join("\n")}

## Frequently asked
- How do you work across time zones? Clients state their business hours when scoping; every engagement is staffed for at least four hours of daily overlap.
- Can you sign our audit opinion? No. GRC Department prepares organisations for assessment and supports the audit; the opinion remains with the licensed audit firm.
- What does it cost? Each service is priced in the written proposal after scoping, before work starts.

## Optional
- [Terms of use](${SITE_URL}/terms)
- [Privacy notice](${SITE_URL}/privacy)
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
