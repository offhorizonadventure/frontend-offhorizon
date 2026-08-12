import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Riders } from "@/components/about/Riders";
import { CtaBand } from "@/components/destinations/CtaBand";
import { Faq } from "@/components/destinations/Faq";
import { PageHero } from "@/components/destinations/PageHero";
import { ArrowRight } from "@/components/ui/icons";
import { Topo } from "@/components/ui/Topo";
import { countryPages, getCountry } from "@/config/destination-pages";
import { FOUNDED_YEAR } from "@/config/facts";
import { locales } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata, siteUrl } from "@/lib/seo";

const reasons = ["experience", "based", "team", "planning", "support"] as const;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    countryPages.map((page) => ({ locale, country: page.slug })),
  );
}

export async function generateMetadata({ params }: PageProps<"/[locale]/destinations/[country]">) {
  const locale = await resolveLocale(params);
  const { country: slug } = await params;
  const page = getCountry(slug);
  if (!page) return {};

  const td = await getTranslations({ locale, namespace: "destinations" });
  const t = await getTranslations({
    locale,
    namespace: page.status === "live" ? "dest.india.meta" : "dest.planned.meta",
  });

  return buildMetadata({
    locale,
    path: `/destinations/${page.slug}`,
    title: t("title", { country: td(page.destination.key) }),
    description: t("description", { country: td(page.destination.key) }),
  });
}

export default async function CountryPage({ params }: PageProps<"/[locale]/destinations/[country]">) {
  const locale = await resolveLocale(params);
  const { country: slug } = await params;
  const page = getCountry(slug);
  if (!page) notFound();

  const td = await getTranslations({ locale, namespace: "destinations" });
  const ts = await getTranslations({ locale, namespace: "dest.shared" });
  const name = td(page.destination.key);

  const crumbs = [
    { label: ts("home"), href: "/" },
    { label: ts("destinations"), href: "/destinations" },
    { label: name },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Place",
    name,
    description: page.heroAlt,
    url: `${siteUrl}/${locale}/destinations/${page.slug}`,
  };

  if (page.status === "planned") {
    const tp = await getTranslations({ locale, namespace: "dest.planned" });

    return (
      <>
        <PageHero
          locale={locale}
          eyebrow={tp("eyebrow")}
          title={tp("title", { country: name })}
          lead={tp("lead", { country: name })}
          image={page.hero}
          imageAlt={page.heroAlt}
          crumbs={crumbs}
          seed={21.6}
        />

        <section className="relative overflow-hidden bg-cream-50 py-18 sm:py-24">
          <Topo className="text-brand-800/12" rings={10} seed={22.4} />
          <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
            <div data-anim="up">
              <h2 className="font-display text-[clamp(1.6rem,3.2vw,2.3rem)] leading-[1.12] font-extrabold tracking-[-0.03em] text-balance text-brand-900">
                {tp("body.title")}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[15px] leading-[1.85] text-pretty text-brand-800/65">
                {tp("body.text", { country: name, year: String(FOUNDED_YEAR) })}
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/custom-expeditions"
                  className="group inline-flex h-13 items-center justify-center gap-2.5 rounded-full bg-brand-800 px-7 text-[11.5px] font-bold tracking-[0.12em] text-cream-100 uppercase transition-colors hover:bg-brand-900"
                >
                  {ts("planTrip")}
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/destinations/india"
                  className="inline-flex h-13 items-center justify-center rounded-full border border-brand-900/15 px-7 text-[11.5px] font-bold tracking-[0.12em] text-brand-800 uppercase transition-colors hover:bg-white"
                >
                  {tp("seeIndia")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Riders />
      </>
    );
  }

  const t = await getTranslations({ locale, namespace: "dest.india" });
  const faqItems = [
    {
      question: t("faq.permits.q"),
      answer: [t("faq.permits.a1"), t("faq.permits.a2")],
      list: [t("faq.permits.l1"), t("faq.permits.l2"), t("faq.permits.l3")],
      after: [t("faq.permits.a3"), t("faq.permits.a4")],
    },
    {
      question: t("faq.when.q"),
      answer: [t("faq.when.a1")],
      list: [t("faq.when.l1"), t("faq.when.l2"), t("faq.when.l3")],
      after: [t("faq.when.a2")],
    },
    {
      question: t("faq.licence.q"),
      answer: [t("faq.licence.a1"), t("faq.licence.a2")],
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
        image={page.hero}
        imageAlt={page.heroAlt}
        crumbs={crumbs}
        seed={21.6}
      />

      <section className="relative overflow-hidden bg-cream-50 py-18 sm:py-24">
        <Topo className="text-brand-800/12" rings={11} seed={22.9} />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div data-anim="up" className="grid gap-8 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <h2 className="font-display text-[clamp(1.7rem,3.4vw,2.5rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance text-brand-900">
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

      {/* Regions within the country */}
      <section className="bg-white py-18 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div data-anim="up">
            <span className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase">
              <span aria-hidden className="h-px w-8 bg-ember-500/60" />
              {t("regions.eyebrow")}
            </span>
            <h2 className="font-display mt-5 max-w-2xl text-[clamp(1.7rem,3.4vw,2.5rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance text-brand-900">
              {t("regions.title")}
            </h2>
          </div>

          <ul data-anim-group className="mt-10 grid gap-6 lg:grid-cols-2">
            {page.regions.map((region) => (
              <li key={region.slug}>
                <Link
                  href={`/destinations/${page.slug}/${region.slug}`}
                  className="group block overflow-hidden rounded-[26px] bg-brand-950 ring-1 ring-brand-900/10 transition-transform duration-500 ease-out-expo hover:-translate-y-1"
                >
                  <article className="relative aspect-[16/10]">
                    <Image
                      src={region.hero}
                      alt={region.heroAlt}
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
                      <span className="text-[10px] font-bold tracking-[0.16em] text-ember-500 uppercase">
                        {t("regions.label")}
                      </span>
                      <h3 className="font-display mt-2 text-[21px] leading-tight font-bold tracking-[-0.02em] text-white">
                        {t("regions.himalayas.name")}
                      </h3>
                      <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-white/65">
                        {t("regions.himalayas.body")}
                      </p>
                      <span className="mt-4 flex items-center gap-2 text-[10.5px] font-bold tracking-[0.14em] text-white uppercase">
                        {t("regions.explore")}
                        <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </article>
                </Link>
              </li>
            ))}

            <li className="flex flex-col justify-between rounded-[26px] border border-dashed border-brand-900/20 p-7">
              <div>
                <span className="text-[10px] font-bold tracking-[0.16em] text-brand-400 uppercase">
                  {ts("planned")}
                </span>
                <h3 className="font-display mt-2 text-[21px] leading-tight font-bold tracking-[-0.02em] text-brand-900">
                  {t("regions.south.name")}
                </h3>
                <p className="mt-2.5 max-w-md text-[13.5px] leading-relaxed text-brand-800/55">
                  {t("regions.south.body")}
                </p>
              </div>
              <Link
                href="/custom-expeditions"
                className="group mt-6 inline-flex items-center gap-2.5 text-[10.5px] font-bold tracking-[0.14em] text-brand-800 uppercase"
              >
                <span
                  aria-hidden
                  className="h-px w-8 bg-brand-800 transition-all duration-500 ease-out-expo group-hover:w-14"
                />
                {ts("registerInterest")}
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* Why ride here with us */}
      <section className="relative overflow-hidden bg-brand-950 py-18 text-cream-100 sm:py-24">
        <Topo className="text-cream-100/10" rings={14} seed={23.8} />
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
          </div>

          <ul data-anim-group className="mt-12 grid border-t border-l border-cream-100/12 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map((reason, index) => (
              <li
                key={reason}
                className="border-r border-b border-cream-100/12 p-7 transition-colors duration-500 hover:bg-cream-100/4"
              >
                <span className="font-display block text-[12px] font-extrabold tracking-[0.14em] text-ember-500 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display mt-4 text-[16.5px] leading-tight font-bold tracking-[-0.015em]">
                  {t(`why.reasons.${reason}.title`)}
                </h3>
                <p className="mt-2.5 text-[13.5px] leading-[1.75] text-pretty text-cream-100/50">
                  {t(`why.reasons.${reason}.body`)}
                </p>
              </li>
            ))}
            <li className="border-r border-b border-cream-100/12 bg-cream-100/6 p-7">
              <p className="font-display text-[15px] leading-snug font-bold tracking-[-0.015em] text-cream-100/90">
                {t("why.closing")}
              </p>
            </li>
          </ul>
        </div>
      </section>

      {page.ctaImage && (
        <CtaBand
          title={t("cta.title")}
          body={t("cta.body")}
          image={page.ctaImage}
          imageAlt={t("cta.imageAlt")}
          primary={{ label: ts("viewTours"), href: "/adventure-tours" }}
          secondary={{ label: ts("sendEnquiry"), href: "/custom-expeditions" }}
        />
      )}

      <Faq items={faqItems} eyebrow={ts("faqEyebrow")} title={t("faq.title")} />

      <Riders />
    </>
  );
}
