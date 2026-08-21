import { getTranslations } from "next-intl/server";

import { Topo } from "@/components/ui/Topo";

/** Keys resolve against `home.different.items`. */
const items = ["smallGroup", "support", "luxury", "execution"] as const;

/** Why Offhorizon is different. */
export async function WhyDifferent() {
  const t = await getTranslations("home.different");

  return (
    <section className="bg-cream-50 relative overflow-hidden py-20 sm:py-28">
      <Topo className="text-brand-800/12" rings={12} seed={4.7} />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div data-anim="up" className="max-w-2xl">
          <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
            <span aria-hidden className="bg-ember-500/60 h-px w-8" />
            {t("eyebrow")}
          </span>
          <h2 className="font-display text-brand-900 mt-5 text-[clamp(1.85rem,3.6vw,2.9rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance">
            {t("title")}
          </h2>
        </div>

        <div
          data-anim-group
          className="border-brand-900/12 mt-12 grid border-t border-l sm:mt-16 sm:grid-cols-2"
        >
          {items.map((item, index) => (
            <article
              key={item}
              className="group border-brand-900/12 relative border-r border-b p-7 transition-colors duration-500 hover:bg-white/60 sm:p-9"
            >
              <span className="font-display text-brand-300 group-hover:text-ember-500 block text-[13px] font-extrabold tracking-[0.14em] tabular-nums transition-colors duration-500">
                {String(index + 1).padStart(2, "0")}
              </span>

              <h3 className="font-display text-brand-900 mt-5 text-[19px] leading-tight font-bold tracking-[-0.02em] sm:text-[21px]">
                {t(`items.${item}.title`)}
              </h3>

              <p className="text-brand-800/60 mt-3 max-w-[42ch] text-[14px] leading-[1.8] text-pretty">
                {t(`items.${item}.body`)}
              </p>

              {/* Rule grows along the cell's foot on hover. */}
              <span
                aria-hidden
                className="bg-ember-500 ease-out-expo absolute bottom-0 left-0 h-px w-0 transition-all duration-700 group-hover:w-full"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
