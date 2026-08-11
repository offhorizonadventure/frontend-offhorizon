import { getTranslations } from "next-intl/server";

import { Topo } from "@/components/ui/Topo";

import { TrustIndex } from "./TrustIndex";

/**
 * Social proof, pulled live from Trustindex.
 *
 * Real reviews rather than anything written here, so nothing on this page
 * claims praise that cannot be traced back to a rider.
 */
export async function Riders() {
  const t = await getTranslations("about.riders");

  return (
    <section className="relative overflow-hidden bg-cream-50 py-20 sm:py-28">
      <Topo className="text-brand-800/12" rings={10} seed={11.8} />

      <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
        <div data-anim="up">
          <span className="inline-flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase">
            <span aria-hidden className="h-px w-8 bg-ember-500/60" />
            {t("eyebrow")}
            <span aria-hidden className="h-px w-8 bg-ember-500/60" />
          </span>

          <h2 className="font-display mt-6 text-[clamp(1.85rem,3.8vw,2.9rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance text-brand-900">
            {t("title")}
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-[1.85] text-pretty text-brand-800/60 sm:text-[16px]">
            {t("body")}
          </p>
        </div>

        <TrustIndex />

        <p
          data-anim="up"
          className="mx-auto mt-12 max-w-xl text-[14px] leading-[1.8] text-pretty text-brand-800/45"
        >
          {t("thanks")}
        </p>
      </div>
    </section>
  );
}
