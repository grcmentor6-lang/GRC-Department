import type { Category } from "@/lib/catalogue";
import { SITE_URL } from "@/lib/flags";

/**
 * JSON-LD for the home page: who we are, the site, and the questions we answer.
 *
 * Google and the AI crawlers read this instead of guessing from the markup, so the risk is not
 * that a field is missing but that one is wrong — a stated fact nobody maintains. Two rules keep
 * it honest:
 *
 *  - Everything here is derived, not retyped. The categories come from the live catalogue and the
 *    questions from the same FAQS the page renders, so the structured data cannot say something
 *    the page does not.
 *  - Anything we do not know is absent. A legal name, address, phone or logo we cannot fill is
 *    left out entirely rather than shipped as a placeholder; an empty field is a gap, a wrong one
 *    is a claim. See ORGANISATION_FACTS below for what is waiting.
 */

// Facts we do not hold yet. Fill these in and they appear; leave them undefined and every
// dependent field is omitted from the graph rather than rendered empty.
// ponytail: plain constants, not config — there is one site and these change about never.
const ORGANISATION_FACTS: {
  legalName?: string;
  email?: string;
  telephone?: string;
  logoPath?: string;
  linkedIn?: string;
  address?: { street: string; locality: string; region: string; postalCode: string; country: string };
} = {};

const FRAMEWORKS_KNOWN = [
  "Governance, risk and compliance",
  "SOC 2",
  "ISO/IEC 27001",
  "ISO/IEC 27701",
  "ISO/IEC 42001",
  "GDPR",
  "Digital Personal Data Protection Act (DPDPA)",
  "PCI DSS",
  "HIPAA",
  "HITRUST",
  "NIST Cybersecurity Framework",
  "NIST AI Risk Management Framework",
  "EU AI Act",
  "Business continuity planning",
  "Third-party risk management",
];

export function StructuredData({ categories, faqs }: { categories: Category[]; faqs: { q: string; a: string }[] }) {
  const f = ORGANISATION_FACTS;
  const org = {
    "@type": ["Organization", "ProfessionalService"],
    "@id": `${SITE_URL}/#organization`,
    name: "GRC Department",
    ...(f.legalName ? { legalName: f.legalName } : {}),
    url: `${SITE_URL}/`,
    ...(f.logoPath
      ? { logo: { "@type": "ImageObject", url: `${SITE_URL}${f.logoPath}`, width: 512, height: 512 } }
      : {}),
    description:
      "Scoped governance, risk and compliance (GRC) services: assessments, policies, testing and compliance programmes, engaged singly or bundled, priced in a written proposal, and delivered remotely within the client's working hours.",
    slogan: "Governance, risk and compliance specialists in your time zone.",
    ...(f.email ? { email: f.email } : {}),
    ...(f.telephone ? { telephone: f.telephone } : {}),
    ...(f.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: f.address.street,
            addressLocality: f.address.locality,
            addressRegion: f.address.region,
            postalCode: f.address.postalCode,
            addressCountry: f.address.country,
          },
        }
      : {}),
    areaServed: "Worldwide",
    priceRange: "Priced per written proposal",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      url: `${SITE_URL}/brief`,
      availableLanguage: ["English"],
      ...(f.email ? { email: f.email } : {}),
    },
    ...(f.linkedIn ? { sameAs: [f.linkedIn] } : {}),
    knowsAbout: FRAMEWORKS_KNOWN,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "GRC service catalogue",
      url: `${SITE_URL}/services`,
      // From the live catalogue: sixteen categories today, whatever it holds tomorrow.
      itemListElement: categories.map((c) => ({
        "@type": "OfferCatalog",
        name: c.name,
        url: `${SITE_URL}/services?cat=${c.code}`,
      })),
    },
  };

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      org,
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: "GRC Department",
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en",
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        // The same array the page renders. Structured data that answers a question the visitor
        // cannot find on the page is what Google penalises, so they must come from one place.
        mainEntity: faqs.map((x) => ({
          "@type": "Question",
          name: x.q,
          acceptedAnswer: { "@type": "Answer", text: x.a },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Content is ours, not a visitor's, and JSON.stringify escapes the quotes; the only
      // sequence that could break out of the tag is "</script>", which none of it contains.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
