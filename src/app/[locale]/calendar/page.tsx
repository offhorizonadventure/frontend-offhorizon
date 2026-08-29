import { getTranslations } from "next-intl/server";

import { Riders } from "@/components/about/Riders";
import { CalendarFilters } from "@/components/calendar/CalendarFilters";
import { DepartureCard } from "@/components/calendar/DepartureCard";
import { CtaBand } from "@/components/destinations/CtaBand";
import { PageHero } from "@/components/destinations/PageHero";
import { EmptyTours } from "@/components/tours/EmptyTours";
import { Topo } from "@/components/ui/Topo";
import himalayas from "../../../../public/expeditions/himalayas.jpg";
import indiaAerial from "../../../../public/destinations/pages/india-aerial.jpg";
import { locales } from "@/i18n/config";
import { resolveLocale } from "@/i18n/params";
import {
  countryName,
  imageUrl,
  listDepartures,
  listTours,
  tourPath,
  type Departure,
  type Tour,
} from "@/lib/catalogue";
import { getPrice } from "@/lib/currency";
import { buildMetadata, siteName, siteUrl } from "@/lib/seo";

export const revalidate = 600;

const nightsBetween = (start: string, end: string) =>
  Math.max(
    0,
    Math.round(
      (new Date(`${end}T00:00:00Z`).getTime() - new Date(`${start}T00:00:00Z`).getTime()) /
        86_400_000,
    ),
  );

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/calendar">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "calendar.meta" });

  return buildMetadata({
    locale,
    path: "/calendar",
    title: t("title"),
    description: t("description"),
  });
}

type Dated = { departure: Departure; tour: Tour };

export default async function CalendarPage({
  params,
  searchParams,
}: PageProps<"/[locale]/calendar">) {
  const locale = await resolveLocale(params);
  const { country, year } = await searchParams;
  const t = await getTranslations({ locale, namespace: "calendar" });
  const ts = await getTranslations({ locale, namespace: "dest.shared" });

  const [tours, departures] = await Promise.all([listTours(), listDepartures()]);
  const byId = new Map(tours.map((tour) => [tour.id, tour]));

  const all: Dated[] = departures
    .map((departure) => ({ departure, tour: byId.get(departure.tour_id) }))
    .filter((entry): entry is Dated => Boolean(entry.tour));

  const wantedCountry = typeof country === "string" ? country : "";
  const wantedYear = typeof year === "string" ? year : "";

  const shown = all.filter(
    (entry) =>
      (!wantedCountry || entry.tour.country === wantedCountry) &&
      (!wantedYear || entry.departure.start_date.slice(0, 4) === wantedYear),
  );

  const countries = [...new Set(all.map((entry) => entry.tour.country).filter(Boolean))]
    .map((slug) => ({ value: slug as string, label: countryName(slug) ?? (slug as string) }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const years = [...new Set(all.map((entry) => entry.departure.start_date.slice(0, 4)))]
    .sort()
    .map((value) => ({ value, label: value }));

  const monthOf = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
  const dayOf = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });
  const dayYearOf = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const months = new Map<string, { label: string; entries: Dated[] }>();

  for (const entry of shown) {
    const key = entry.departure.start_date.slice(0, 7);
    const label = monthOf.format(new Date(`${entry.departure.start_date}T00:00:00Z`));
    const bucket = months.get(key) ?? { label, entries: [] };
    bucket.entries.push(entry);
    months.set(key, bucket);
  }

  const ordered = [...months.entries()].sort(([a], [b]) => a.localeCompare(b));

  const cards = await Promise.all(
    ordered.map(async ([key, month]) => ({
      key,
      label: month.label,
      cards: await Promise.all(
        month.entries.map(async ({ departure, tour }) => {
          const start = new Date(`${departure.start_date}T00:00:00Z`);
          const end = new Date(`${departure.end_date}T00:00:00Z`);
          const left =
            departure.seats === null
              ? null
              : Math.max(0, departure.seats - (departure.seats_taken ?? 0));

          return {
            id: departure.id,
            href: tourPath(tour),
            title: tour.title,
            image: imageUrl(tour.hero_path),
            imageAlt: tour.hero_alt ?? tour.title,
            dates: `${dayOf.format(start)} – ${dayYearOf.format(end)}`,
            nights: t("nights", {
              count: nightsBetween(departure.start_date, departure.end_date),
            }),
            kind: departure.kind === "4x4" ? t("kind4x4") : t("kindBike"),
            country: countryName(tour.country),
            price: departure.rider_price
              ? await getPrice(departure.rider_price, locale, departure.currency)
              : null,
            places: left === null ? null : t("placesLeft", { count: left }),
            soldOut: departure.sold_out || left === 0,
          };
        }),
      ),
    })),
  );

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("meta.title"),
    description: t("meta.description"),
    url: `${siteUrl}/${locale}/calendar`,
    isPartOf: { "@type": "WebSite", name: siteName, url: siteUrl },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: shown.length,
      itemListElement: shown.map(({ departure, tour }, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "TouristTrip",
          name: tour.title,
          startDate: departure.start_date,
          endDate: departure.end_date,
          url: `${siteUrl}/${locale}${tourPath(tour)}`,
        },
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
        eyebrow={t("eyebrow")}
        title={t("title")}
        lead={t("lead")}
        image={himalayas}
        imageAlt={t("heroAlt")}
        crumbs={[{ label: ts("home"), href: "/" }, { label: t("eyebrow") }]}
        seed={31.2}
      />

      <section className="bg-cream-50 border-brand-900/8 sticky top-0 z-30 border-b py-5 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 sm:px-8 lg:flex-row lg:items-end lg:gap-10">
          <p className="font-display text-brand-900 shrink-0 text-[22px] leading-none font-extrabold tracking-[-0.03em] tabular-nums">
            {t("trips", { count: shown.length })}
          </p>

          <div className="min-w-0 flex-1">
            <CalendarFilters
              countries={countries}
              years={years}
              labels={{
                trips: t("trips", { count: shown.length }),
                destination: t("destination"),
                allDestinations: t("allDestinations"),
                year: t("year"),
                allYears: t("allYears"),
              }}
            />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-16 sm:py-20">
        <Topo className="text-brand-800/10" rings={11} seed={32.1} />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          {cards.length === 0 ? (
            <div className="mx-auto max-w-lg">
              <EmptyTours />
            </div>
          ) : (
            <div className="space-y-16">
              {cards.map((month) => (
                <div key={month.key}>
                  <div data-anim="up" className="flex items-center gap-4">
                    <h2 className="font-display text-brand-900 shrink-0 text-[clamp(1.3rem,2.6vw,1.8rem)] leading-none font-extrabold tracking-[-0.03em]">
                      {month.label}
                    </h2>
                    <span aria-hidden className="bg-brand-900/10 h-px flex-1" />
                    <span className="text-brand-800/45 shrink-0 text-[12px] tabular-nums">
                      {t("trips", { count: month.cards.length })}
                    </span>
                  </div>

                  <ul data-anim-group className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {month.cards.map((card) => (
                      <li key={card.id}>
                        <DepartureCard
                          locale={locale}
                          href={card.href}
                          title={card.title}
                          image={card.image}
                          imageAlt={card.imageAlt}
                          dates={card.dates}
                          nights={card.nights}
                          kind={card.kind}
                          country={card.country}
                          price={card.price}
                          priceLabel={t("from")}
                          places={card.places}
                          soldOut={card.soldOut}
                          soldOutLabel={t("soldOut")}
                          cta={t("view")}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <CtaBand
        title={t("cta.title")}
        body={t("cta.body")}
        image={indiaAerial}
        imageAlt={t("cta.imageAlt")}
        primary={{ label: ts("planTrip"), href: "/custom-expeditions" }}
        secondary={{ label: ts("destinations"), href: "/destinations" }}
      />

      <Riders />
    </>
  );
}
