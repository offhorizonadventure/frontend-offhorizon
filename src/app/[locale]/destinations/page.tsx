import { getTranslations } from "next-intl/server";

import { PageHero } from "@/components/destinations/PageHero";
import { PlaceCard } from "@/components/destinations/PlaceCard";
import { Riders } from "@/components/about/Riders";
import { Topo } from "@/components/ui/Topo";
import { countryPages, hubHero } from "@/config/destination-pages";
import { locales } from "@/i18n/config";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata, siteName, siteUrl } from "@/lib/seo";

const pillars = ["adventure", "culture", "comfort", "safety"] as const;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/destinations">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "dest.hub.meta" });

  return buildMetadata({
    locale,
    path: "/destinations",
    title: t("title"),
    description: t("description"),
  });
}

export default async function DestinationsPage({ params }: PageProps<"/[locale]/destinations">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "dest.hub" });
  const td = await getTranslations({ locale, namespace: "destinations" });
  const ts = await getTranslations({ locale, namespace: "dest.shared" });

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("meta.title"),
    description: t("meta.description"),
    url: `${siteUrl}/${locale}/destinations`,
    isPartOf: { "@type": "WebSite", name: siteName, url: siteUrl },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: countryPages.map((page, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: td(page.destination.key),
        url: `${siteUrl}/${locale}/destinations/${page.slug}`,
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
        image={hubHero}
        imageAlt={t("heroAlt")}
        crumbs={[{ label: ts("home"), href: "/" }, { label: ts("destinations") }]}
        seed={18.3}
      />

      {/* Positioning: what we run, and where we are honest about not running yet. */}
      <section className="relative overflow-hidden bg-cream-50 py-18 sm:py-24">
        <Topo className="text-brand-800/12" rings={11} seed={19.4} />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div data-anim="up" className="grid gap-8 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <h2 className="font-display text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance text-brand-900">
                {t("intro.title")}
              </h2>
            </div>
            <div className="space-y-4 lg:col-span-6 lg:pt-2">
              <p className="text-[15px] leading-[1.85] text-pretty text-brand-800/65 sm:text-[16px]">
                {t("intro.body")}
              </p>
              <p className="text-[15px] leading-[1.85] text-pretty text-brand-800/65 sm:text-[16px]">
                {t("intro.focus")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The five countries */}
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

          <ul data-anim-group className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {countryPages.map((page) => {
              const live = page.status === "live";

              return (
                <li key={page.slug}>
                  <PlaceCard
                    href={`/destinations/${page.slug}`}
                    name={td(page.destination.key)}
                    image={page.destination.image}
                    imageAlt={page.heroAlt}
                    flag={page.destination.flag}
                    badge={live ? ts("running") : ts("planned")}
                    meta={
                      live
                        ? ts("expeditions", { count: page.destination.tours })
                        : ts("openForEnquiries")
                    }
                    sizes="(max-width: 639px) 92vw, (max-width: 1023px) 46vw, 360px"
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* How we build a trip */}
      <section className="relative overflow-hidden bg-brand-950 py-18 text-cream-100 sm:py-24">
        <Topo className="text-cream-100/10" rings={14} seed={20.7} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_50%_at_50%_0%,rgba(180,95,43,0.2),transparent_70%)]"
        />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div data-anim="up" className="max-w-2xl">
            <span className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase">
              <span aria-hidden className="h-px w-8 bg-ember-500/60" />
              {t("approach.eyebrow")}
            </span>
            <h2 className="font-display mt-5 text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance">
              {t("approach.title")}
            </h2>
            <p className="mt-4 text-[15px] leading-[1.8] text-cream-100/55">{t("approach.body")}</p>
          </div>

          <ul
            data-anim-group
            className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-cream-100/12 sm:grid-cols-2 lg:grid-cols-4"
          >
            {pillars.map((pillar, index) => (
              <li key={pillar} className="bg-brand-950 p-7">
                <span className="font-display block text-[13px] font-extrabold tracking-[0.14em] text-ember-500 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display mt-5 text-[17px] leading-tight font-bold tracking-[-0.015em]">
                  {t(`approach.pillars.${pillar}.title`)}
                </h3>
                <p className="mt-2.5 text-[13.5px] leading-[1.75] text-pretty text-cream-100/50">
                  {t(`approach.pillars.${pillar}.body`)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Riders />
    </>
  );
}
