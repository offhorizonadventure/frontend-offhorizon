import Image from "next/image";

import { blurOf } from "@/lib/image-source";
import { getTranslations } from "next-intl/server";

import { Facts } from "@/components/tour/Facts";
import { Rail } from "@/components/tour/Rail";
import type { FactKey, Highlight } from "@/lib/tour-types";
import type { Locale } from "@/i18n/config";

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
    <section className="bg-cream-50 relative flow-root pb-18 sm:pb-24">
      {}
      <div className="relative z-10 -mt-16 sm:-mt-44 lg:-mt-28">
        <Facts locale={locale} facts={facts} />
      </div>

      {highlights.length > 0 && (
        <>
          <div className="mx-auto mt-16 max-w-6xl px-5 sm:mt-20 sm:px-8">
            <div data-anim="up">
              <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
                <span aria-hidden className="bg-ember-500/60 h-px w-8" />
                {t("highlights.eyebrow")}
              </span>
              <h2 className="font-display text-brand-900 mt-5 text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.1] font-extrabold tracking-[-0.03em]">
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
                <figure className="group bg-brand-100 ring-brand-900/10 relative h-full overflow-hidden rounded-[22px] ring-1">
                  <Image
                    src={highlight.image}
                    alt={highlight.alt}
                    fill
                    {...blurOf(highlight.image)}
                    sizes="(max-width: 639px) 62vw, 260px"
                    quality={90}
                    className="ease-out-expo object-cover transition-transform duration-[1100ms] group-hover:scale-[1.06]"
                  />
                  <span
                    aria-hidden
                    className="from-brand-950/90 via-brand-950/10 absolute inset-0 bg-gradient-to-t to-transparent"
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
        </>
      )}
    </section>
  );
}
