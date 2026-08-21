import { getTranslations } from "next-intl/server";

import { Topo } from "@/components/ui/Topo";
import { COUNTRY_COUNT, crewCount, FOUNDED_YEAR } from "@/config/facts";

/** Figures are facts about the business, so only the labels are translated. */
const facts = [
  { value: String(FOUNDED_YEAR), key: "since" },
  { value: String(COUNTRY_COUNT), key: "countries" },
  { value: String(crewCount), key: "crew" },
] as const;

export async function AboutHero() {
  const t = await getTranslations("about.hero");

  return (
    <section className="bg-brand-950 text-cream-100 relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <Topo className="text-cream-100/12" rings={16} seed={8.4} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_0%,rgba(180,95,43,0.24),transparent_72%)]"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <span className="hero-rise text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
              <span aria-hidden className="bg-ember-500/60 h-px w-8" />
              {t("eyebrow")}
            </span>

            <h1
              className="hero-rise font-display mt-6 text-[clamp(2.3rem,5.6vw,4.2rem)] leading-[1.02] font-extrabold tracking-[-0.04em] text-balance"
              style={{ animationDelay: "80ms" }}
            >
              {t.rich("title", {
                accent: (chunks) => <em className="text-ember-500 not-italic">{chunks}</em>,
              })}
            </h1>
          </div>

          <div className="hero-rise lg:col-span-5 lg:pt-24" style={{ animationDelay: "160ms" }}>
            <p className="text-cream-100/60 text-[15px] leading-[1.85] text-pretty sm:text-[16px]">
              {t("lead")}
            </p>
          </div>
        </div>

        <dl
          className="hero-rise border-cream-100/12 mt-14 grid grid-cols-3 gap-6 border-t pt-8 sm:mt-20"
          style={{ animationDelay: "240ms" }}
        >
          {facts.map((fact) => (
            <div key={fact.key}>
              <dt className="font-display text-[26px] leading-none font-extrabold tabular-nums sm:text-[34px]">
                {fact.value}
              </dt>
              <dd className="text-cream-100/45 mt-2.5 text-[10.5px] font-semibold tracking-[0.16em] uppercase">
                {t(`facts.${fact.key}`)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
