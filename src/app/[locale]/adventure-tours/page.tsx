import { getTranslations } from "next-intl/server";

import { Riders } from "@/components/about/Riders";
import { CtaBand } from "@/components/destinations/CtaBand";
import { PageHero } from "@/components/destinations/PageHero";
import { TourCard } from "@/components/tours/TourCard";
import { ArrowRight } from "@/components/ui/icons";
import { Flag } from "@/components/ui/Flag";
import { Topo } from "@/components/ui/Topo";
import { countryPages } from "@/config/destination-pages";
import himalayas from "../../../../public/expeditions/himalayas.jpg";
import indiaAerial from "../../../../public/destinations/pages/india-aerial.jpg";
import { locales } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata, siteName, siteUrl } from "@/lib/seo";

/**
 * Every departure we sell, grouped by country.
 *
 * The list is derived from the destination config rather than kept separately,
 * so a tour cannot appear here and be missing from its region page, or the
 * reverse. Today that means India and Nepal, which is all we run.
 */
const groups = countryPages
  .map((page) => ({
    page,
    tours: page.regions.flatMap((region) => (region.status === "live" ? region.tours : [])),
  }))
  .filter((group) => group.tours.length > 0);

const tourCount = groups.reduce((total, group) => total + group.tours.length, 0);

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/adventure-tours">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "adventureTours.meta" });

  return buildMetadata({
    locale,
    path: "/adventure-tours",
    title: t("title"),
    description: t("description"),
  });
}

export default async function AdventureToursPage({
  params,
}: PageProps<"/[locale]/adventure-tours">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "adventureTours" });
  const td = await getTranslations({ locale, namespace: "destinations" });
  const tt = await getTranslations({ locale, namespace: "tours" });
  const ts = await getTranslations({ locale, namespace: "dest.shared" });

  const standards = t.raw("standards.items") as { title: string; body: string }[];

  /**
   * ItemList of the departures. Deliberately no `offers`: the prices in the
   * config are placeholders, and a wrong price in structured data can end up
   * shown in search results.
   */
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("meta.title"),
    description: t("meta.description"),
    url: `${siteUrl}/${locale}/adventure-tours`,
    isPartOf: { "@type": "WebSite", name: siteName, url: siteUrl },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: tourCount,
      itemListElement: groups
        .flatMap((group) => group.tours)
        .map(({ tour }, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "TouristTrip",
            name: tt(`${tour.key}.name`),
            description: tt(`${tour.key}.summary`),
            url: `${siteUrl}/${locale}${tour.href}`,
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

      {/* What is on the list, and what is honestly not */}
      <section className="relative overflow-hidden bg-cream-50 py-18 sm:py-24">
        <Topo className="text-brand-800/12" rings={11} seed={32.1} />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div data-anim="up" className="grid gap-8 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <h2 className="font-display text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance text-brand-900">
                {t("intro.title")}
              </h2>
            </div>
            <div className="space-y-4 lg:col-span-6 lg:pt-2">
              <p className="text-[15px] leading-[1.85] text-pretty text-brand-800/65 sm:text-[16px]">
                {t("intro.body", { count: tourCount })}
              </p>
              <p className="text-[15px] leading-[1.85] text-pretty text-brand-800/65 sm:text-[16px]">
                {t("intro.focus")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The departures, grouped by country */}
      <section className="bg-white py-18 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div data-anim="up" className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase">
                <span aria-hidden className="h-px w-8 bg-ember-500/60" />
                {t("list.eyebrow")}
              </span>
              <h2 className="font-display mt-5 text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-brand-900">
                {t("list.title")}
              </h2>
            </div>
            <p className="max-w-xs text-[13.5px] leading-relaxed text-brand-800/55 sm:text-right">
              {t("list.note")}
            </p>
          </div>

          <div className="mt-12 space-y-14">
            {groups.map(({ page, tours }) => (
              <div key={page.slug}>
                <div
                  data-anim="up"
                  className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-brand-900/12 pb-5"
                >
                  <h3 className="flex items-center gap-3">
                    <Flag country={page.destination.flag} />
                    <span className="font-display text-[21px] leading-none font-bold tracking-[-0.02em] text-brand-900">
                      {td(page.destination.key)}
                    </span>
                    <span className="text-[11px] font-semibold tracking-[0.14em] text-brand-800/45 uppercase">
                      {ts("expeditions", { count: tours.length })}
                    </span>
                  </h3>

                  <Link
                    href={`/destinations/${page.slug}`}
                    className="group inline-flex items-center gap-2 text-[10.5px] font-bold tracking-[0.14em] text-brand-800 uppercase"
                  >
                    {t("list.viewDestination")}
                    <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>

                <ul data-anim-group className="mt-8 grid gap-6 md:grid-cols-2">
                  {tours.map(({ tour, image }) => (
                    <li key={tour.key}>
                      <div data-anim="up">
                        <TourCard
                          tour={tour}
                          image={image}
                          headingLevel={4}
                          sizes="(max-width: 767px) 92vw, 560px"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How every departure is run. Operating standards, not commercial
          inclusions, so nothing here promises something a package might not
          carry. */}
      <section className="relative overflow-hidden bg-brand-950 py-18 text-cream-100 sm:py-24">
        <Topo className="text-cream-100/10" rings={14} seed={33.4} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_50%_at_50%_0%,rgba(180,95,43,0.2),transparent_70%)]"
        />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div data-anim="up" className="max-w-2xl">
            <span className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase">
              <span aria-hidden className="h-px w-8 bg-ember-500/60" />
              {t("standards.eyebrow")}
            </span>
            <h2 className="font-display mt-5 text-[clamp(1.7rem,3.4vw,2.5rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance">
              {t("standards.title")}
            </h2>
            <p className="mt-4 text-[15px] leading-[1.8] text-cream-100/55">{t("standards.body")}</p>
          </div>

          <ul
            data-anim-group
            className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-cream-100/12 sm:grid-cols-2 lg:grid-cols-3"
          >
            {standards.map((item, index) => (
              <li key={item.title} className="bg-brand-950 p-7">
                <span className="font-display block text-[12px] font-extrabold tracking-[0.14em] text-ember-500 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display mt-4 text-[16.5px] leading-tight font-bold tracking-[-0.015em]">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-[13.5px] leading-[1.75] text-pretty text-cream-100/50">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
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
