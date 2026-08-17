import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Facts } from "@/components/tour/Facts";
import { Rail } from "@/components/tour/Rail";
import type { FactKey, Highlight } from "@/config/tour-pages";
import type { Locale } from "@/i18n/config";

/**
 * Expedition facts, then the highlights rail.
 *
 * The facts card is pulled up so it straddles the hero: most of it over the
 * photograph, the rest on the cream. Two things make that work, and both are
 * easy to undo by accident:
 *
 * 1. The section is `flow-root`. A negative top margin on the first child of a
 *    block container collapses through to the parent, dragging the whole cream
 *    section up over the hero instead of just the card. `flow-root` starts a
 *    new formatting context, which stops that. Do not reach for flex here: it
 *    also stops collapsing, but it turns every `mx-auto` child into a
 *    shrink-to-fit box, which centres the headings and the rail.
 * 2. Nothing here may set `overflow-hidden`, or the part of the card sitting
 *    above the section's top edge is clipped away.
 *
 * The rail scrolls because the number of highlights varies by tour and will
 * grow; a wrapping grid would leave ragged holes at most counts.
 */
export async function Highlights({
  locale,
  facts,
  highlights,
}: {
  locale: Locale;
  facts: { key: FactKey; value: string }[];
  highlights: Highlight[];
}) {
  const t = await getTranslations({ locale, namespace: "tour" });

  return (
    <section className="relative flow-root bg-cream-50 pb-18 sm:pb-24">
      {/* Half of this sits over the hero above. */}
      <div className="relative z-10 -mt-16 sm:-mt-44 lg:-mt-28">
        <Facts locale={locale} facts={facts} />
      </div>

      <div className="mx-auto mt-16 max-w-6xl px-5 sm:mt-20 sm:px-8">
        <div data-anim="up">
          <span className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase">
            <span aria-hidden className="h-px w-8 bg-ember-500/60" />
            {t("highlights.eyebrow")}
          </span>
          <h2 className="font-display mt-5 text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-brand-900">
            {t("highlights.title")}
          </h2>
        </div>
      </div>

      <Rail
        className="highlight-rail mt-10"
        tone="light"
        previousLabel={t("highlights.previous")}
        nextLabel={t("highlights.next")}
      >
        {highlights.map((highlight) => (
          <li key={highlight.label} className="highlight-item">
            <figure className="group relative h-full overflow-hidden rounded-[22px] bg-brand-100 ring-1 ring-brand-900/10">
              <Image
                src={highlight.image}
                alt={highlight.alt}
                fill
                placeholder="blur"
                sizes="(max-width: 639px) 62vw, 260px"
                className="object-cover transition-transform duration-[1100ms] ease-out-expo group-hover:scale-[1.06]"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/10 to-transparent"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-5">
                <span className="font-display text-[15.5px] leading-tight font-bold tracking-[-0.015em] text-balance text-white">
                  {highlight.label}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </Rail>
    </section>
  );
}
