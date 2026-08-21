import { getTranslations } from "next-intl/server";

import { Topo } from "@/components/ui/Topo";

/** Discount figures are commercial terms, so they live here, not in the copy. */
const rewards = [
  { key: "returning", value: "5%" },
  { key: "group", value: "5-7%" },
  { key: "early", value: "3-5%" },
  { key: "full", value: "5%" },
] as const;

const conditions = ["availability", "atBooking", "noStacking", "changes"] as const;

/** Rider benefits, philosophy and terms. */
export async function Rewards() {
  const t = await getTranslations("about.rewards");

  return (
    <section className="bg-brand-950 text-cream-100 relative overflow-hidden py-20 sm:py-28">
      <Topo className="text-cream-100/10" rings={15} seed={10.6} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_50%_at_50%_0%,rgba(180,95,43,0.2),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div data-anim="up" className="max-w-2xl">
          <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
            <span aria-hidden className="bg-ember-500/60 h-px w-8" />
            {t("eyebrow")}
          </span>
          <h2 className="font-display mt-5 text-[clamp(1.85rem,3.6vw,2.9rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance">
            {t("title")}
          </h2>
          <p className="text-cream-100/55 mt-4 text-[15px] leading-[1.8]">{t("body")}</p>
        </div>

        <ul
          data-anim-group
          className="bg-cream-100/12 mt-12 grid gap-px overflow-hidden rounded-3xl sm:mt-14 sm:grid-cols-2 lg:grid-cols-4"
        >
          {rewards.map((reward) => (
            <li
              key={reward.key}
              className="group bg-brand-950 hover:bg-brand-900 p-7 transition-colors duration-500"
            >
              <span className="font-display text-ember-500 block text-[34px] leading-none font-extrabold tabular-nums">
                {reward.value}
              </span>
              <h3 className="font-display mt-5 text-[16px] leading-tight font-bold tracking-[-0.015em]">
                {t(`items.${reward.key}.title`)}
              </h3>
              <p className="text-cream-100/50 mt-2.5 text-[13.5px] leading-[1.75] text-pretty">
                {t(`items.${reward.key}.body`)}
              </p>
            </li>
          ))}
        </ul>

        {/* Philosophy, set as a statement rather than another card */}
        <blockquote
          data-anim="up"
          className="border-ember-500 mt-16 border-l-2 pl-6 sm:mt-20 sm:pl-8"
        >
          <p className="font-display text-cream-100 max-w-3xl text-[clamp(1.25rem,2.6vw,1.9rem)] leading-[1.35] font-bold tracking-[-0.025em] text-balance">
            {t("philosophy")}
          </p>
        </blockquote>

        <div data-anim="up" className="border-cream-100/12 mt-14 border-t pt-7 sm:mt-16">
          <h3 className="text-cream-100/40 text-[10.5px] font-bold tracking-[0.18em] uppercase">
            {t("conditionsTitle")}
          </h3>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 sm:gap-x-10">
            {conditions.map((condition) => (
              <li
                key={condition}
                className="text-cream-100/40 flex gap-2.5 text-[12.5px] leading-relaxed"
              >
                <span aria-hidden className="bg-cream-100/30 mt-2 size-1 shrink-0 rounded-full" />
                {t(`conditions.${condition}`)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
