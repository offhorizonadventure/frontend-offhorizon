import { getTranslations } from "next-intl/server";

import { AboutHero } from "@/components/about/AboutHero";
import { Journey } from "@/components/about/Journey";
import { Rewards } from "@/components/about/Rewards";
import { Riders } from "@/components/about/Riders";
import { Team } from "@/components/about/Team";
import { locales } from "@/i18n/config";
import { COUNTRY_SLUGS, countryName } from "@/lib/catalogue";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata, siteName, siteUrl } from "@/lib/seo";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/about-us">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "about.meta" });

  return buildMetadata({
    locale,
    path: "/about-us",
    title: t("title"),
    description: t("description"),
  });
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about-us">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "about" });

  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: t("meta.title"),
    description: t("meta.description"),
    url: `${siteUrl}/${locale}/about-us`,
    mainEntity: {
      "@type": "TravelAgency",
      name: siteName,
      foundingDate: "2014",
      areaServed: COUNTRY_SLUGS.map((slug) => countryName(slug)).filter(Boolean),
      description: t("meta.description"),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <AboutHero />
      <Journey />
      <Team />
      <Riders />
      <Rewards />
    </>
  );
}
