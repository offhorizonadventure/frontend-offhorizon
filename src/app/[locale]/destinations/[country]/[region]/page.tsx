import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Riders } from "@/components/about/Riders";
import { CtaBand } from "@/components/destinations/CtaBand";
import { Faq, type FaqItem } from "@/components/destinations/Faq";
import { PageHero } from "@/components/destinations/PageHero";
import { DbTourCard } from "@/components/tours/DbTourCard";
import { EmptyTours } from "@/components/tours/EmptyTours";
import { Topo } from "@/components/ui/Topo";
import { countryPages, getCountry, getRegion } from "@/config/destination-pages";
import { locales } from "@/i18n/config";
import { resolveLocale } from "@/i18n/params";
import { regionCards } from "@/lib/catalogue-cards";
import { buildMetadata, siteUrl } from "@/lib/seo";

/** A numbered point in the "why us" grid. */
type Blurb = { title: string; body: string };

export const revalidate = 600;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    countryPages.flatMap((page) =>
      page.regions
        .filter((region) => region.status === "live")
        .map((region) => ({ locale, country: page.slug, region: region.slug })),
    ),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/destinations/[country]/[region]">) {
  const locale = await resolveLocale(params);
  const { country, region: regionSlug } = await params;
  const region = getRegion(country, regionSlug);
  if (!region) return {};

  const t = await getTranslations({ locale, namespace: `dest.${region.content}.meta` });

  return buildMetadata({
    locale,
    path: `/destinations/${country}/${regionSlug}`,
    title: t("title"),
    description: t("description"),
  });
}

export default async function RegionPage({
  params,
}: PageProps<"/[locale]/destinations/[country]/[region]">) {
  const locale = await resolveLocale(params);
  const { country: countrySlug, region: regionSlug } = await params;
  const page = getCountry(countrySlug);
  const region = getRegion(countrySlug, regionSlug);
  if (!page || !region) notFound();

  const td = await getTranslations({ locale, namespace: "destinations" });
  const ts = await getTranslations({ locale, namespace: "dest.shared" });
  const t = await getTranslations({ locale, namespace: `dest.${region.content}` });
  const strengths = t.raw("why.items") as Blurb[];

  // Only this region's tours: the Indian Himalayas page should not list a South India ride.
  const cards = await regionCards(countrySlug, regionSlug);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: t("title"),
    description: t("meta.description"),
    url: `${siteUrl}/${locale}/destinations/${countrySlug}/${regionSlug}`,
    containedInPlace: { "@type": "Country", name: td(page.destination.key) },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />

      <PageHero
        locale={locale}
        eyebrow={t("eyebrow")}
        title={t("title")}
        lead={t("lead")}
        image={region.hero}
        imageAlt={region.imageAlt}
        crumbs={[
          { label: ts("home"), href: "/" },
          { label: ts("destinations"), href: "/destinations" },
          { label: td(page.destination.key), href: `/destinations/${page.slug}` },
          { label: t("shortName") },
        ]}
        seed={24.5}
      />

      {/* Tours available in this region */}
      <section className="bg-cream-50 relative overflow-hidden py-18 sm:py-24">
        <Topo className="text-brand-800/12" rings={11} seed={25.3} />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div data-anim="up">
            <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
              <span aria-hidden className="bg-ember-500/60 h-px w-8" />
              {t("tours.eyebrow")}
            </span>
            <h2 className="font-display text-brand-900 mt-5 max-w-2xl text-[clamp(1.7rem,3.4vw,2.5rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance">
              {t("tours.title")}
            </h2>
          </div>

          {cards.length === 0 && (
            <div className="mt-10">
              <EmptyTours />
            </div>
          )}

          <ul data-anim-group className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <li key={card.tour.id}>
                <div data-anim="up">
                  <DbTourCard
                    {...card}
                    sizes="(max-width: 639px) 92vw, (max-width: 1023px) 46vw, 360px"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why ride the region with us */}
      <section className="bg-brand-950 text-cream-100 relative overflow-hidden py-18 sm:py-24">
        <Topo className="text-cream-100/10" rings={15} seed={26.1} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_50%_at_50%_0%,rgba(180,95,43,0.2),transparent_70%)]"
        />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div data-anim="up" className="max-w-2xl">
            <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
              <span aria-hidden className="bg-ember-500/60 h-px w-8" />
              {t("why.eyebrow")}
            </span>
            <h2 className="font-display mt-5 text-[clamp(1.7rem,3.4vw,2.5rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance">
              {t("why.title")}
            </h2>
            <p className="text-cream-100/55 mt-4 text-[15px] leading-[1.8]">{t("why.body")}</p>
          </div>

          <ul
            data-anim-group
            className="bg-cream-100/12 mt-12 grid gap-px overflow-hidden rounded-3xl sm:grid-cols-2 lg:grid-cols-3"
          >
            {strengths.map((strength, index) => (
              <li key={strength.title} className="bg-brand-950 p-7">
                <span className="font-display text-ember-500 block text-[12px] font-extrabold tracking-[0.14em] tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display mt-4 text-[16.5px] leading-tight font-bold tracking-[-0.015em]">
                  {strength.title}
                </h3>
                <p className="text-cream-100/50 mt-2.5 text-[13.5px] leading-[1.75] text-pretty">
                  {strength.body}
                </p>
              </li>
            ))}
            <li className="bg-brand-900 p-7">
              <p className="font-display text-cream-100/90 text-[15px] leading-snug font-bold tracking-[-0.015em]">
                {t("why.closing")}
              </p>
            </li>
          </ul>
        </div>
      </section>

      <CtaBand
        title={t("cta.title")}
        body={t("cta.body")}
        image={region.ctaImage}
        imageAlt={region.imageAlt}
        primary={{ label: ts("viewTours"), href: "/calendar" }}
        secondary={{ label: ts("sendEnquiry"), href: "/custom-expeditions" }}
      />

      <Faq
        items={t.raw("faq.items") as FaqItem[]}
        eyebrow={ts("faqEyebrow")}
        title={t("faq.title")}
      />

      <Riders />
    </>
  );
}
