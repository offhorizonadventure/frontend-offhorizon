import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Riders } from "@/components/about/Riders";
import { CtaBand } from "@/components/destinations/CtaBand";
import { Faq } from "@/components/destinations/Faq";
import { PageHero } from "@/components/destinations/PageHero";
import { ArrowRight } from "@/components/ui/icons";
import { Topo } from "@/components/ui/Topo";
import { countryPages, getCountry, getRegion } from "@/config/destination-pages";
import { locales } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata, siteUrl } from "@/lib/seo";

const strengths = ["altitude", "planning", "crew", "itineraries", "safety"] as const;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    countryPages.flatMap((page) =>
      page.regions.map((region) => ({ locale, country: page.slug, region: region.slug })),
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
  const tt = await getTranslations({ locale, namespace: "tours" });
  const ts = await getTranslations({ locale, namespace: "dest.shared" });
  const t = await getTranslations({ locale, namespace: `dest.${region.content}` });

  const schema = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: t("title"),
    description: t("meta.description"),
    url: `${siteUrl}/${locale}/destinations/${countrySlug}/${regionSlug}`,
    containedInPlace: { "@type": "Country", name: td(page.destination.key) },
  };

  const faqItems = [
    {
      question: t("faq.what.q"),
      answer: [t("faq.what.a1"), t("faq.what.a2"), t("faq.what.a3")],
      list: [t("faq.what.l1"), t("faq.what.l2"), t("faq.what.l3"), t("faq.what.l4")],
      after: [t("faq.what.a4")],
    },
    {
      question: t("faq.why.q"),
      answer: [t("faq.why.a1"), t("faq.why.a2")],
      list: [t("faq.why.l1"), t("faq.why.l2"), t("faq.why.l3"), t("faq.why.l4")],
      after: [t("faq.why.a3")],
    },
    {
      question: t("faq.safe.q"),
      answer: [t("faq.safe.a1"), t("faq.safe.a2")],
      list: [t("faq.safe.l1"), t("faq.safe.l2"), t("faq.safe.l3"), t("faq.safe.l4")],
      after: [t("faq.safe.a3")],
    },
    {
      question: t("faq.difficulty.q"),
      answer: [t("faq.difficulty.a1"), t("faq.difficulty.a2")],
      list: [
        t("faq.difficulty.l1"),
        t("faq.difficulty.l2"),
        t("faq.difficulty.l3"),
        t("faq.difficulty.l4"),
      ],
      after: [t("faq.difficulty.a3")],
    },
    {
      question: t("faq.permits.q"),
      answer: [t("faq.permits.a1"), t("faq.permits.a2")],
      list: [t("faq.permits.l1"), t("faq.permits.l2"), t("faq.permits.l3")],
      after: [t("faq.permits.a3"), t("faq.permits.a4")],
    },
  ];

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
        imageAlt={region.heroAlt}
        crumbs={[
          { label: ts("home"), href: "/" },
          { label: ts("destinations"), href: "/destinations" },
          { label: td(page.destination.key), href: `/destinations/${page.slug}` },
          { label: t("shortName") },
        ]}
        seed={24.5}
      />

      {/* Tours available in this region */}
      <section className="relative overflow-hidden bg-cream-50 py-18 sm:py-24">
        <Topo className="text-brand-800/12" rings={11} seed={25.3} />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div data-anim="up">
            <span className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase">
              <span aria-hidden className="h-px w-8 bg-ember-500/60" />
              {t("tours.eyebrow")}
            </span>
            <h2 className="font-display mt-5 max-w-2xl text-[clamp(1.7rem,3.4vw,2.5rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance text-brand-900">
              {t("tours.title")}
            </h2>
          </div>

          <ul data-anim-group className="mt-10 grid gap-6 lg:grid-cols-2">
            {region.tours.map((tour) => (
              <li key={tour.key}>
                <Link
                  href={tour.href}
                  className="group block overflow-hidden rounded-[26px] bg-brand-950 ring-1 ring-brand-900/10 transition-transform duration-500 ease-out-expo hover:-translate-y-1"
                >
                  <article className="relative aspect-[16/11]">
                    <Image
                      src={tour.image}
                      alt={tour.alt}
                      fill
                      placeholder="blur"
                      sizes="(max-width: 1023px) 92vw, 560px"
                      className="object-cover transition-transform duration-[1100ms] ease-out-expo group-hover:scale-[1.05]"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/25 to-transparent"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <h3 className="font-display text-[20px] leading-tight font-bold tracking-[-0.02em] text-white">
                        {tt(`${tour.key}.name`)}
                      </h3>
                      <p className="mt-2 text-[13px] text-white/60">{tt(`${tour.key}.summary`)}</p>
                      <span className="mt-4 flex items-center gap-2 text-[10.5px] font-bold tracking-[0.14em] text-white uppercase">
                        {ts("viewTour")}
                        <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why ride the region with us */}
      <section className="relative overflow-hidden bg-brand-950 py-18 text-cream-100 sm:py-24">
        <Topo className="text-cream-100/10" rings={15} seed={26.1} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_50%_at_50%_0%,rgba(180,95,43,0.2),transparent_70%)]"
        />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div data-anim="up" className="max-w-2xl">
            <span className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase">
              <span aria-hidden className="h-px w-8 bg-ember-500/60" />
              {t("why.eyebrow")}
            </span>
            <h2 className="font-display mt-5 text-[clamp(1.7rem,3.4vw,2.5rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance">
              {t("why.title")}
            </h2>
            <p className="mt-4 text-[15px] leading-[1.8] text-cream-100/55">{t("why.body")}</p>
          </div>

          <ul data-anim-group className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-cream-100/12 sm:grid-cols-2 lg:grid-cols-3">
            {strengths.map((strength, index) => (
              <li key={strength} className="bg-brand-950 p-7">
                <span className="font-display block text-[12px] font-extrabold tracking-[0.14em] text-ember-500 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display mt-4 text-[16.5px] leading-tight font-bold tracking-[-0.015em]">
                  {t(`why.items.${strength}.title`)}
                </h3>
                <p className="mt-2.5 text-[13.5px] leading-[1.75] text-pretty text-cream-100/50">
                  {t(`why.items.${strength}.body`)}
                </p>
              </li>
            ))}
            <li className="bg-brand-900 p-7">
              <p className="font-display text-[15px] leading-snug font-bold tracking-[-0.015em] text-cream-100/90">
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
        imageAlt={region.heroAlt}
        primary={{ label: ts("viewTours"), href: "/adventure-tours" }}
        secondary={{ label: ts("sendEnquiry"), href: "/custom-expeditions" }}
      />

      <Faq items={faqItems} eyebrow={ts("faqEyebrow")} title={t("faq.title")} />

      <Riders />
    </>
  );
}
