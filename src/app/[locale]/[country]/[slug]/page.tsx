import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Riders } from "@/components/about/Riders";
import { CtaBand } from "@/components/destinations/CtaBand";
import { Faq } from "@/components/destinations/Faq";
import { ExpectTabs } from "@/components/tour/ExpectTabs";
import { Fleet } from "@/components/tour/Fleet";
import { Gallery } from "@/components/tour/Gallery";
import { Highlights } from "@/components/tour/Highlights";
import { Inclusions } from "@/components/tour/Inclusions";
import { PlaceBody } from "@/components/tour/PlaceBody";
import { PriceCard } from "@/components/tour/PriceCard";
import { TourActions } from "@/components/tour/TourActions";
import { Program } from "@/components/tour/Program";
import { RouteMap } from "@/components/tour/RouteMap";
import { TourHero } from "@/components/tour/TourHero";
import { Topo } from "@/components/ui/Topo";
import { buildBooking } from "@/lib/booking-props";
import {
  countryName,
  getTour,
  imageUrl,
  listDepartures,
  listMyDepartures,
  tourPath,
} from "@/lib/catalogue";
import { translate } from "@/lib/translated";
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

/** Rendered per request, not cached as one page for everyone. */
export const dynamic = "force-dynamic";

/** The tour behind the page. Custom expeditions run ordinary tours. */
const readTour = (slug: string) => getTour(slug);

/**
 * The address tours used to live at, before the country became part of it.
 *
 * Old links are in Google, in emails already sent and on other people's sites,
 * so this segment still answers. A tour that now has a country is redirected
 * permanently, which hands the ranking on. A tour filed under no country has
 * nowhere else to be, so this stays its address.
 */
const MOVED = "adventure";

export async function generateMetadata({ params }: PageProps<"/[locale]/[country]/[slug]">) {
  const locale = await resolveLocale(params);
  const { country, slug } = await params;
  const source = await readTour(slug);
  if (!source || tourPath(source) !== `/${country}/${slug}`) return {};

  const tour = translate(source, locale);

  const hero = imageUrl(tour.hero_path);

  return buildMetadata({
    locale,
    path: tourPath(tour),
    title: tour.title,
    description: (tour.lead ?? "").slice(0, 155),
    keywords: [tour.title, countryName(tour.country) ?? "", "motorcycle expedition"].filter(
      Boolean,
    ),
    image: hero
      ? {
          url: hero,
          width: 1600,
          height: 1000,
          alt: tour.hero_alt ?? tour.title,
          type: "image/webp",
        }
      : undefined,
  });
}

export default async function TourPage({ params }: PageProps<"/[locale]/[country]/[slug]">) {
  const locale = await resolveLocale(params);
  const { country, slug } = await params;
  const source = await readTour(slug);
  if (!source) notFound();

  const path = tourPath(source);

  // The country in the address has to be the one the tour is filed under. Any
  // other spelling is a different page, not this one wearing a new name, and
  // two addresses for one page is what a canonical is meant to prevent.
  if (path !== `/${country}/${slug}`) {
    if (country === MOVED) permanentRedirect(`/${locale}${path}`);
    notFound();
  }

  // Translated fields laid over the English rows, field by field.
  const tour = translate(source, locale);

  const t = await getTranslations({ locale, namespace: "tour" });
  const ts = await getTranslations({ locale, namespace: "dest.shared" });

  // The dates on general sale, plus any custom departure of this tour sold to
  // the reader. The second read is theirs alone: the cached list is anonymous
  // and row level security keeps a private departure out of it.
  const [open, mine] = await Promise.all([listDepartures(tour.id), listMyDepartures(tour.id)]);
  const departures = [...mine, ...open].sort((a, b) => a.start_date.localeCompare(b.start_date));

  const name = tour.title;
  const hero = imageUrl(tour.hero_path);
  const facts = factList(tour);
  const highlights = highlightList(tour);
  const programme = programmeList(tour);
  const gallery = galleryList(tour);
  const expect = expectList(tour);
  const routeMap = imageUrl(tour.route_map_path);
  // A tour read before the column existed has none at all.
  const faqs = tour.faqs ?? [];
  const priceGroups = pricing(tour, departures);

  // Prices are written in whatever the departure says, and converting from the
  // wrong one is how a 45,000 rupee expedition became four million.
  const priceCurrency = departures[0]?.currency;

  /**
   * The machines on offer, gathered from every departure.
   *
   * A 4x4 always picks its cars from the fleet. A motorbike expedition may pick
   * its bikes or simply name one, and a named one is not a fleet record, so
   * those departures add nothing here and the section stays away.
   */
  const fleet = [
    ...new Map(
      departures.flatMap((departure) => departure.vehicles).map((vehicle) => [vehicle.id, vehicle]),
    ).values(),
  ];

  // The shortest departure, for the worked example beside each daily rate.
  const shortestDays = departures.length
    ? Math.min(
        ...departures.map(
          (departure) =>
            Math.round(
              (new Date(departure.end_date).getTime() - new Date(departure.start_date).getTime()) /
                86_400_000,
            ) + 1,
        ),
      )
    : 0;

  /** TouristTrip with the itinerary as an ItemList. */
  const schema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name,
    description: tour.lead ?? undefined,
    url: `${siteUrl}/${locale}${tourPath(tour)}`,
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
      <section className="bg-cream-50 relative overflow-hidden py-18 sm:py-24">
        <Topo className="text-brand-800/12" rings={11} seed={40.9} />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div data-anim="up" className="lg:col-span-7">
              <h2 className="font-display text-brand-900 text-[clamp(1.75rem,3.6vw,2.7rem)] leading-[1.06] font-extrabold tracking-[-0.035em] text-balance">
                {tour.place_title}
              </h2>
              <PlaceBody text={tour.place_body ?? ""} more={t("more")} less={t("less")} />
            </div>

            <div data-anim="up" className="lg:col-span-5">
              <PriceCard
                locale={locale}
                pricing={priceGroups}
                tourName={name}
                facts={facts}
                departures={departureList(departures)}
                from={priceCurrency}
              />
            </div>
          </div>
        </div>
      </section>

      {/**
       * Each section is dropped when the tour has nothing in it, rather than
       * rendering an empty heading over blank space.
       */}
      {programme.length > 0 && <Program locale={locale} days={programme} />}

      {fleet.length > 0 && (
        <Fleet
          locale={locale}
          vehicles={fleet}
          currency={departures[0]?.currency ?? "USD"}
          days={shortestDays}
        />
      )}

      {(tour.included_items.length > 0 || tour.excluded_items.length > 0) && (
        <Inclusions locale={locale} included={tour.included_items} excluded={tour.excluded_items} />
      )}

      {routeMap && <RouteMap locale={locale} image={routeMap} alt={tour.route_map_alt ?? ""} />}

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

      {faqs.length > 0 && (
        <Faq
          eyebrow={t("faq.eyebrow")}
          title={t("faq.title")}
          // One answer written in the office may run to several paragraphs, and
          // a blank line is how somebody typing into a box says so.
          items={faqs.map((entry) => ({
            question: entry.question,
            answer: entry.answer
              .split(/\n\s*\n/)
              .map((part) => part.trim())
              .filter(Boolean),
          }))}
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

      <TourActions
        locale={locale}
        booking={await buildBooking({
          locale,
          pricing: priceGroups,
          tourName: name,
          facts,
          departures: departureList(departures),
          from: priceCurrency,
        })}
      />
    </>
  );
}
