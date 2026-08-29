import { getTranslations } from "next-intl/server";

import { Riders } from "@/components/about/Riders";
import { CalendarFilters } from "@/components/calendar/CalendarFilters";
import { DbTourCard } from "@/components/tours/DbTourCard";
import { CtaBand } from "@/components/destinations/CtaBand";
import { Rail } from "@/components/tour/Rail";
import { PageHero } from "@/components/destinations/PageHero";
import { EmptyTours } from "@/components/tours/EmptyTours";
import { Topo } from "@/components/ui/Topo";
import himalayas from "../../../../public/expeditions/himalayas.jpg";
import indiaAerial from "../../../../public/destinations/pages/india-aerial.jpg";
import { locales } from "@/i18n/config";
import { resolveLocale } from "@/i18n/params";
import {
  COUNTRY_SLUGS,
  countryName,
  listDepartures,
  listTours,
  tourPath,
  type Departure,
  type Tour,
} from "@/lib/catalogue";
import { buildMetadata, siteName, siteUrl } from "@/lib/seo";

export const revalidate = 600;

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

  // Only departures still to come reach this page: the query behind
  // listDepartures already leaves the past behind.
  const shown = all.filter(
    (entry) =>
      (!wantedCountry || entry.tour.country === wantedCountry) &&
      (!wantedYear || entry.departure.start_date.slice(0, 4) === wantedYear),
  );

  const countries = COUNTRY_SLUGS.map((slug) => ({
    value: slug,
    label: countryName(slug) ?? slug,
  })).sort((a, b) => a.label.localeCompare(b.label));

  // Only the years somebody can actually book. Offering a year with nothing in
  // it sends people to an empty page.
  const years = [...new Set(all.map((entry) => entry.departure.start_date.slice(0, 4)))]
    .sort()
    .map((value) => ({ value, label: value }));

  const monthOf = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
  const months = new Map<string, { label: string; entries: Dated[] }>();

  for (const entry of shown) {
    const key = entry.departure.start_date.slice(0, 7);
    const label = monthOf.format(new Date(`${entry.departure.start_date}T00:00:00Z`));
    const bucket = months.get(key) ?? { label, entries: [] };
    bucket.entries.push(entry);
    months.set(key, bucket);
  }

  const ordered = [...months.entries()].sort(([a], [b]) => a.localeCompare(b));

  const cards = ordered.map(([key, month]) => ({
    key,
    label: month.label,
    cards: month.entries.map(({ departure, tour }) => ({
      id: departure.id,
      tour,
      priceFrom: departure.rider_price,
      currency: departure.currency,
    })),
  }));

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

      <section className="bg-cream-50 border-brand-900/8 border-b py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 sm:px-8 lg:flex-row lg:items-end lg:gap-10">
          <p className="font-display text-brand-900 shrink-0 pb-3 text-[22px] leading-none font-extrabold tracking-[-0.03em] tabular-nums">
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

                  <Rail
                    className="calendar-rail mt-8"
                    tone="light"
                    previousLabel={t("previous")}
                    nextLabel={t("next")}
                  >
                    {month.cards.map((card) => (
                      <li key={card.id} className="calendar-item">
                        <DbTourCard
                          tour={card.tour}
                          priceFrom={card.priceFrom}
                          currency={card.currency}
                          sizes="(max-width: 767px) 92vw, 560px"
                        />
                      </li>
                    ))}
                  </Rail>
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
