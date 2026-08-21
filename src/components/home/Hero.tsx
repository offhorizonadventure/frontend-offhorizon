import { getFormatter, getTranslations } from "next-intl/server";

import { ArrowRight, Compass } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";

import { Topo } from "@/components/ui/Topo";
import { COUNTRY_COUNT, crewCount, HIGHEST_PASS_METRES, yearsRunning } from "@/config/facts";

import { DestinationGallery } from "./DestinationGallery";

export async function Hero() {
  const t = await getTranslations("home.hero");
  const ts = await getTranslations("home.stats");
  const format = await getFormatter();

  /** Every figure is derived from something stated elsewhere on the site, so none of them can be contradicted by the About page. */
  const stats = [
    { value: format.number(yearsRunning), key: "years" },
    { value: format.number(COUNTRY_COUNT), key: "countries" },
    { value: `${format.number(HIGHEST_PASS_METRES)} m`, key: "highestPass" },
    { value: format.number(crewCount), key: "crew" },
  ] as const;

  return (
    <section className="bg-cream-50 relative overflow-hidden">
      {/* Warm light from the top, cool cream floor underneath. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-48 h-[40rem] bg-[radial-gradient(58%_50%_at_50%_0%,rgba(180,95,43,0.16),transparent_72%)]"
      />
      <Topo className="text-brand-800/25" rings={14} seed={1.1} />

      <div className="relative mx-auto max-w-6xl px-5 pt-26 text-center sm:px-8 sm:pt-30">
        <span className="hero-rise border-brand-900/12 text-brand-700 inline-flex items-center gap-2 rounded-full border bg-white/70 px-4 py-1.5 text-[10.5px] font-semibold tracking-[0.18em] uppercase backdrop-blur">
          <Compass className="text-ember-500 size-3.5" />
          {t("eyebrow")}
        </span>

        <h1
          className="hero-rise font-display text-brand-900 mx-auto mt-6 max-w-[18ch] text-[clamp(2.75rem,7vw,5.25rem)] leading-[0.98] font-extrabold tracking-[-0.035em] text-balance"
          style={{ animationDelay: "80ms" }}
        >
          {t.rich("title", {
            accent: (chunks) => <em className="text-ember-500 not-italic">{chunks}</em>,
          })}
        </h1>

        <p
          className="hero-rise text-brand-800/60 mx-auto mt-5 max-w-[46ch] text-[15.5px] leading-[1.7] text-pretty sm:text-[17px]"
          style={{ animationDelay: "160ms" }}
        >
          {t("subtitle")}
        </p>

        <div
          className="hero-rise mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animationDelay: "240ms" }}
        >
          <Link
            href="/destinations"
            className="group bg-brand-800 text-cream-100 hover:bg-brand-900 inline-flex h-13 w-full items-center justify-center gap-2.5 rounded-full px-8 text-[12px] font-bold tracking-[0.13em] uppercase transition-colors duration-200 sm:w-auto"
          >
            {t("primaryCta")}
            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <Link
            href="/adventure-tours"
            className="border-brand-900/15 text-brand-800 hover:border-brand-900/25 inline-flex h-13 w-full items-center justify-center rounded-full border px-8 text-[12px] font-bold tracking-[0.13em] uppercase transition-colors duration-200 hover:bg-white sm:w-auto"
          >
            {t("secondaryCta")}
          </Link>
        </div>
      </div>

      <div className="relative mt-10 sm:mt-14">
        <DestinationGallery />
      </div>

      <div className="relative mx-auto max-w-5xl px-5 pb-16 sm:px-8 sm:pb-24">
        <dl className="grid grid-cols-2 gap-y-8 pt-12 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.key} className="text-center">
              <dt className="font-display text-brand-800 text-[28px] leading-none font-extrabold sm:text-[34px]">
                {stat.value}
              </dt>
              <dd className="text-brand-700/55 mt-2.5 text-[10.5px] font-semibold tracking-[0.16em] uppercase">
                {ts(stat.key)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
