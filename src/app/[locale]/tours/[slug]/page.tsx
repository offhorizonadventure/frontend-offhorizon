import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Riders } from "@/components/about/Riders";
import { CtaBand } from "@/components/destinations/CtaBand";
import { PageHero } from "@/components/destinations/PageHero";
import { Departures } from "@/components/tour/Departures";
import { ExpectTabs } from "@/components/tour/ExpectTabs";
import { Facts } from "@/components/tour/Facts";
import { Gallery } from "@/components/tour/Gallery";
import { Inclusions } from "@/components/tour/Inclusions";
import { Program } from "@/components/tour/Program";
import { RouteMap } from "@/components/tour/RouteMap";
import { Topo } from "@/components/ui/Topo";
import { getTour, tourPages } from "@/config/tour-pages";
import { locales } from "@/i18n/config";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata, siteUrl } from "@/lib/seo";

export function generateStaticParams() {
  return locales.flatMap((locale) => tourPages.map((tour) => ({ locale, slug: tour.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/tours/[slug]">) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const tour = getTour(slug);
  if (!tour) return {};

  const tt = await getTranslations({ locale, namespace: "tours" });

  return buildMetadata({
    locale,
    path: `/tours/${tour.slug}`,
    title: `${tt(`${tour.package.key}.name`)} | ${tt(`${tour.package.key}.summary`)}`,
    description: tour.lead,
    image: {
      url: `${siteUrl}${tour.hero.src}`,
      width: tour.hero.width,
      height: tour.hero.height,
      alt: tour.heroAlt,
      type: "image/jpeg",
    },
  });
}

export default async function TourPage({ params }: PageProps<"/[locale]/tours/[slug]">) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const tour = getTour(slug);
  if (!tour) notFound();

  const t = await getTranslations({ locale, namespace: "tour" });
  const tt = await getTranslations({ locale, namespace: "tours" });
  const ts = await getTranslations({ locale, namespace: "dest.shared" });

  const name = tt(`${tour.package.key}.name`);

  /**
   * TouristTrip with the itinerary as an ItemList. No `offers`: the prices in
   * the config are placeholders, and a wrong price in structured data can end
   * up shown in search results.
   */
  const schema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name,
    description: tour.lead,
    url: `${siteUrl}/${locale}/tours/${tour.slug}`,
    touristType: tt(`${tour.package.key}.summary`),
    itinerary: {
      "@type": "ItemList",
      numberOfItems: tour.program.length,
      itemListElement: tour.program.map((day) => ({
        "@type": "ListItem",
        position: day.day,
        name: day.title,
        description: day.body,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />

      <PageHero
        locale={locale}
        eyebrow={tt(`${tour.package.key}.summary`)}
        title={name}
        lead={tour.lead}
        image={tour.hero}
        imageAlt={tour.heroAlt}
        crumbs={[
          { label: ts("home"), href: "/" },
          { label: t("breadcrumb"), href: "/adventure-tours" },
          { label: name },
        ]}
        seed={40.4}
      />

      {/* The place, before the logistics */}
      <section className="relative overflow-hidden bg-cream-50 py-18 sm:py-24">
        <Topo className="text-brand-800/12" rings={11} seed={40.9} />

        {/* Title runs the width of the column and the body sits under it.
            Boxed into a narrow half, a title this long broke over three or
            four lines and stopped reading as a sentence. */}
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div data-anim="up">
            <h2 className="font-display text-[clamp(1.75rem,4vw,3rem)] leading-[1.06] font-extrabold tracking-[-0.035em] text-balance text-brand-900">
              {tour.place.title}
            </h2>
            <p className="mt-7 text-[15px] leading-[1.85] text-pretty text-brand-800/65 sm:text-[16.5px]">
              {tour.place.body}
            </p>
          </div>
        </div>
      </section>

      <Facts locale={locale} facts={tour.facts} />

      <Departures locale={locale} departures={tour.departures} />

      <Inclusions locale={locale} included={tour.included} excluded={tour.excluded} />

      <RouteMap locale={locale} image={tour.route.image} alt={tour.route.alt} />

      <Program locale={locale} days={tour.program} />

      <ExpectTabs eyebrow={t("expect.eyebrow")} items={tour.expect} />

      <Gallery
        eyebrow={t("gallery.eyebrow")}
        title={t("gallery.title")}
        items={tour.gallery}
        labels={{
          open: t("gallery.open"),
          close: t("gallery.close"),
          previous: t("gallery.previous"),
          next: t("gallery.next"),
          counter: t.raw("gallery.counter") as string,
        }}
      />

      <CtaBand
        title={t("cta.title")}
        body={t("cta.body")}
        image={tour.hero}
        imageAlt={tour.heroAlt}
        primary={{ label: ts("sendEnquiry"), href: "/custom-expeditions" }}
        secondary={{ label: t("breadcrumb"), href: "/adventure-tours" }}
      />

      <Riders />
    </>
  );
}
