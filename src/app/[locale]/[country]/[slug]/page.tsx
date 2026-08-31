import { notFound, permanentRedirect } from "next/navigation";
import { RelatedTours } from "@/components/tour/RelatedTours";
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
import { buildMetadata, siteName, siteUrl } from "@/lib/seo";
import {
  departureList,
  expectList,
  factList,
  galleryList,
  highlightList,
  pricing,
  programmeList,
} from "@/lib/tour-view";

export const dynamic = "force-dynamic";

const readTour = (slug: string) => getTour(slug);

const MOVED = "adventure";

export async function generateMetadata({ params }: PageProps<"/[locale]/[country]/[slug]">) {
  const locale = await resolveLocale(params);
  const { country, slug } = await params;
  const source = await readTour(slug);
  if (!source || tourPath(source) !== `/${country}/${slug}`) return {};

  const tour = translate(source, locale);

  const hero = imageUrl(tour.hero_path);
  // A picture chosen for sharing wins, and the hero stands in when there is none.
  const sharing = imageUrl(tour.og_path) ?? hero;

  return buildMetadata({
    locale,
    path: tourPath(tour),
    title: tour.meta_title?.trim() || tour.title,
    description: (tour.meta_description?.trim() || tour.lead || "").slice(0, 300),
    keywords: [tour.title, countryName(tour.country) ?? "", "motorcycle expedition"].filter(
      Boolean,
    ),
    image: sharing
      ? {
          url: sharing,
          width: 1200,
          height: 630,
          alt: tour.og_alt ?? tour.hero_alt ?? tour.title,
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

  if (path !== `/${country}/${slug}`) {
    if (country === MOVED) permanentRedirect(`/${locale}${path}`);
    notFound();
  }

  const tour = translate(source, locale);

  const t = await getTranslations({ locale, namespace: "tour" });
  const ts = await getTranslations({ locale, namespace: "dest.shared" });

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
  const faqs = tour.faqs ?? [];
  const priceGroups = pricing(tour, departures);

  const priceCurrency = departures[0]?.currency;

  const fleet = [
    ...new Map(
      departures.flatMap((departure) => departure.vehicles).map((vehicle) => [vehicle.id, vehicle]),
    ).values(),
  ];

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

  // Every picture on the page, described. Google Images indexes what a page
  // shows, so the gallery and the programme count as much as the hero.
  const pictures = [
    { path: tour.hero_path, caption: tour.hero_alt },
    ...tour.gallery.map((item) => ({ path: item.path, caption: item.alt })),
    ...tour.programme.map((day) => ({ path: day.path, caption: day.alt || day.title })),
    ...tour.highlights.map((item) => ({ path: item.path, caption: item.alt || item.label })),
  ]
    .map((item) => ({ url: imageUrl(item.path), caption: item.caption }))
    .filter((item): item is { url: string; caption: string | null } => Boolean(item.url));

  const images = pictures.map((picture) => ({
    "@type": "ImageObject",
    contentUrl: picture.url,
    url: picture.url,
    caption: picture.caption || name,
    representativeOfPage: picture.url === imageUrl(tour.hero_path) || undefined,
    creditText: siteName,
    creator: { "@type": "Organization", name: siteName },
    copyrightNotice: siteName,
    acquireLicensePage: `${siteUrl}/${locale}/contact-us`,
  }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name,
    description: tour.lead ?? undefined,
    url: `${siteUrl}/${locale}${tourPath(tour)}`,
    image: images,
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
          { label: t("breadcrumb"), href: "/calendar" },
          { label: name },
        ]}
        seed={40.4}
      />

      <Highlights locale={locale} facts={facts} highlights={highlights} />

      {}
      {/* The section above is the same cream, so its padding and this one's
          added up to a gap the width of a screen with nothing in it. */}
      <section className="bg-cream-50 relative overflow-hidden pt-6 pb-18 sm:pt-10 sm:pb-24">
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

      {}
      {programme.length > 0 && <Program locale={locale} days={programme} />}

      {fleet.length > 0 && (
        <Fleet
          locale={locale}
          vehicles={fleet}
          currency={departures[0]?.currency ?? "INR"}
          from={priceCurrency}
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
          items={faqs.map((entry) => ({
            question: entry.question,
            answer: entry.answer
              .split(/\n\s*\n/)
              .map((part) => part.trim())
              .filter(Boolean),
          }))}
        />
      )}

      <RelatedTours tourId={tour.id} country={tour.country} region={tour.region} />

      <CtaBand
        title={t("cta.title")}
        body={t("cta.body")}
        image={hero ?? ""}
        imageAlt={tour.hero_alt ?? name}
        primary={{ label: ts("sendEnquiry"), href: "/custom-expeditions" }}
        secondary={{ label: t("breadcrumb"), href: "/calendar" }}
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
