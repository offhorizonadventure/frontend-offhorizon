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

/**
 * Rider benefits, philosophy and terms.
 *
 * The discount is the headline of each card, because that is the thing a
 * returning rider is actually scanning for. Conditions follow in plain sight
 * rather than being buried, which is the point the philosophy line makes.
 */
export async function Rewards() {
  const t = await getTranslations("about.rewards");

  return (
    <section className="relative overflow-hidden bg-brand-950 py-20 text-cream-100 sm:py-28">
      <Topo className="text-cream-100/10" rings={15} seed={10.6} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_50%_at_50%_0%,rgba(180,95,43,0.2),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div data-anim="up" className="max-w-2xl">
          <span className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase">
            <span aria-hidden className="h-px w-8 bg-ember-500/60" />
            {t("eyebrow")}
          </span>
          <h2 className="font-display mt-5 text-[clamp(1.85rem,3.6vw,2.9rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance">
            {t("title")}
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-cream-100/55">{t("body")}</p>
        </div>

        <ul
          data-anim-group
          className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-cream-100/12 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4"
        >
          {rewards.map((reward) => (
            <li
              key={reward.key}
              className="group bg-brand-950 p-7 transition-colors duration-500 hover:bg-brand-900"
            >
              <span className="font-display block text-[34px] leading-none font-extrabold text-ember-500 tabular-nums">
                {reward.value}
              </span>
              <h3 className="font-display mt-5 text-[16px] leading-tight font-bold tracking-[-0.015em]">
                {t(`items.${reward.key}.title`)}
              </h3>
              <p className="mt-2.5 text-[13.5px] leading-[1.75] text-pretty text-cream-100/50">
                {t(`items.${reward.key}.body`)}
              </p>
            </li>
          ))}
        </ul>

        {/* Philosophy, set as a statement rather than another card */}
        <blockquote
          data-anim="up"
          className="mt-16 border-l-2 border-ember-500 pl-6 sm:mt-20 sm:pl-8"
        >
          <p className="font-display max-w-3xl text-[clamp(1.25rem,2.6vw,1.9rem)] leading-[1.35] font-bold tracking-[-0.025em] text-balance text-cream-100">
            {t("philosophy")}
          </p>
        </blockquote>

        <div data-anim="up" className="mt-14 border-t border-cream-100/12 pt-7 sm:mt-16">
          <h3 className="text-[10.5px] font-bold tracking-[0.18em] text-cream-100/40 uppercase">
            {t("conditionsTitle")}
          </h3>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 sm:gap-x-10">
            {conditions.map((condition) => (
              <li
                key={condition}
                className="flex gap-2.5 text-[12.5px] leading-relaxed text-cream-100/40"
              >
                <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-cream-100/30" />
                {t(`conditions.${condition}`)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
