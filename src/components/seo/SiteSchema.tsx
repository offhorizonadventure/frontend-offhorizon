import { contact } from "@/config/contact";
import { socialLinks } from "@/config/social";
import type { Locale } from "@/i18n/config";
import { siteName, siteUrl } from "@/lib/seo";

/** Who publishes this site, said once in a form a search engine can read. */
export function SiteSchema({ locale }: { locale: Locale }) {
  const organisation = {
    "@type": "TravelAgency",
    "@id": `${siteUrl}/#organisation`,
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/logo/logo-horizontal.png`,
    image: `${siteUrl}/logo/logo-horizontal.png`,
    telephone: contact.phone,
    email: contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Log Huts Rd, Siyal",
      addressLocality: "Manali",
      addressRegion: "Himachal Pradesh",
      postalCode: "175131",
      addressCountry: "IN",
    },
    sameAs: socialLinks.map((channel) => channel.href),
    areaServed: ["India", "Nepal", "Bhutan", "Sri Lanka", "Mongolia"],
  };

  const website = {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: `${siteUrl}/${locale}`,
    name: siteName,
    inLanguage: locale,
    publisher: { "@id": `${siteUrl}/#organisation` },
  };

  // One graph, so the website and the organisation point at each other by id.
  const graph = { "@context": "https://schema.org", "@graph": [organisation, website] };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
    />
  );
}
