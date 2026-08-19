import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Riders } from "@/components/about/Riders";
import { CtaBand } from "@/components/destinations/CtaBand";
import { ExpectTabs } from "@/components/tour/ExpectTabs";
import { Gallery } from "@/components/tour/Gallery";
import { Highlights } from "@/components/tour/Highlights";
import { Inclusions } from "@/components/tour/Inclusions";
import { PriceCard } from "@/components/tour/PriceCard";
import { Program } from "@/components/tour/Program";
import { RouteMap } from "@/components/tour/RouteMap";
import { TourHero } from "@/components/tour/TourHero";
import { Topo } from "@/components/ui/Topo";
import { getTour, imageUrl, listDepartures } from "@/lib/catalogue";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata, siteUrl } from "@/lib/seo";
import {
  departureList,
  expectList,
  factList,
  galleryList,
  highlightList,
  pricing,
  programmeList,
} from "@/lib/tour-view";

/**
 * Built on first request and cached, rather than enumerated at build time.
 *
 * Tours are added from the admin after the site is deployed, so a list baked at
 * build time would mean a redeploy for every new one.
 */
export const revalidate = 600;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/[locale]/tours/[slug]">) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const tour = await getTour(slug);
  if (!tour) return {};

  const hero = imageUrl(tour.hero_path);

  return buildMetadata({
    locale,
    path: `/tours/${tour.slug}`,
    title: tour.title,
    description: tour.lead ?? "",
    image: hero
      ? { url: hero, width: 1600, height: 1000, alt: tour.hero_alt ?? tour.title, type: "image/webp" }
      : undefined,
  });
}

export default async function TourPage({ params }: PageProps<"/[locale]/tours/[slug]">) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const tour = await getTour(slug);
  if (!tour) notFound();

  const t = await getTranslations({ locale, namespace: "tour" });
  const ts = await getTranslations({ locale, namespace: "dest.shared" });

  const departures = await listDepartures(tour.id);

  const name = tour.title;
  const hero = imageUrl(tour.hero_path);
  const facts = factList(tour);
  const highlights = highlightList(tour);
  const programme = programmeList(tour);
  const gallery = galleryList(tour);
  const expect = expectList(tour);
  const routeMap = imageUrl(tour.route_map_path);
  const priceGroups = pricing(tour, departures);

  /**
   * TouristTrip with the itinerary as an ItemList. No `offers`: the prices in
   * the config are placeholders, and a wrong price in structured data can end
   * up shown in search results.
   */
  const schema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name,
    description: tour.lead ?? undefined,
    url: `${siteUrl}/${locale}/tours/${tour.slug}`,
    itinerary: {
      "@type": "ItemList",
      numberOfItems: programme.length,
      itemListElement: programme.map((day) => ({
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

      <TourHero
        locale={locale}
        eyebrow={t("breadcrumb")}
        title={name}
        lead={tour.lead ?? ""}
        image={hero ?? ""}
        imageAlt={tour.hero_alt ?? name}
        crumbs={[
          { label: ts("home"), href: "/" },
          { label: t("breadcrumb"), href: "/adventure-tours" },
          { label: name },
        ]}
        seed={40.4}
      />

      <Highlights locale={locale} facts={facts} highlights={highlights} />

      {/* The place, with the price beside it */}
      <section className="relative overflow-hidden bg-cream-50 py-18 sm:py-24">
        <Topo className="text-brand-800/12" rings={11} seed={40.9} />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div data-anim="up" className="lg:col-span-7">
              <h2 className="font-display text-[clamp(1.75rem,3.6vw,2.7rem)] leading-[1.06] font-extrabold tracking-[-0.035em] text-balance text-brand-900">
                {tour.place_title}
              </h2>
              <p className="mt-7 text-[15px] leading-[1.85] text-pretty text-brand-800/65 sm:text-[16.5px]">
                {tour.place_body}
              </p>
            </div>

            <div data-anim="up" className="lg:col-span-5">
              <PriceCard
                locale={locale}
                pricing={priceGroups}
                tourName={name}
                facts={facts}
                departures={departureList(departures)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Each section is dropped when the tour has nothing in it, rather than
          rendering an empty heading over blank space. */}
      {programme.length > 0 && <Program locale={locale} days={programme} />}

      {(tour.included.length > 0 || tour.excluded.length > 0) && (
        <Inclusions locale={locale} included={tour.included} excluded={tour.excluded} />
      )}

      {routeMap && (
        <RouteMap locale={locale} image={routeMap} alt={tour.route_map_alt ?? ""} />
      )}

      {expect.length > 0 && <ExpectTabs eyebrow={t("expect.eyebrow")} items={expect} />}

      {gallery.length > 0 && (
      <Gallery
        eyebrow={t("gallery.eyebrow")}
        title={t("gallery.title")}
        items={gallery}
        labels={{
          open: t("gallery.open"),
          close: t("gallery.close"),
          previous: t("gallery.previous"),
          next: t("gallery.next"),
          counter: t.raw("gallery.counter") as string,
        }}
      />
      )}

      <CtaBand
        title={t("cta.title")}
        body={t("cta.body")}
        image={hero ?? ""}
        imageAlt={tour.hero_alt ?? name}
        primary={{ label: ts("sendEnquiry"), href: "/custom-expeditions" }}
        secondary={{ label: t("breadcrumb"), href: "/adventure-tours" }}
      />

      <Riders />
    </>
  );
}
