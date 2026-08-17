import { getTranslations } from "next-intl/server";

import { factIcons } from "@/components/ui/icons";
import type { FactKey } from "@/config/tour-pages";
import type { Locale } from "@/i18n/config";

/**
 * Expedition facts.
 *
 * Eight short values in a hairline grid a visitor can scan in a couple of
 * seconds. The hairlines are the grid gap showing through, which avoids a pile
 * of nth-child rules for the edges of a wrapping grid.
 *
 * Positioning is owned by the caller, not by this component.
 */
export async function Facts({
  locale,
  facts,
}: {
  locale: Locale;
  facts: { key: FactKey; value: string }[];
}) {
  const t = await getTranslations({ locale, namespace: "tour" });

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8">
      <div data-anim="up">
        {/* No visible heading: the card straddles the hero, so anything above
            the grid gets pulled up into the lead paragraph behind it. The
            values label themselves. */}
        <h2 className="sr-only">{t("facts.title")}</h2>

        {/* One card, with the dividers drawn as real borders inside it. See
            `.facts-grid` in globals.css. */}
        <dl className="facts-grid overflow-hidden rounded-[22px] bg-white shadow-lg shadow-brand-950/8 ring-1 ring-brand-900/10">
          {facts.map((fact) => {
            const Icon = factIcons[fact.key];

            // Centred, not top aligned: the values run to one or two lines, and
            // top alignment left twice as much slack under the short ones as
            // under the long ones.
            return (
              <div key={fact.key} className="flex items-center gap-3.5 p-6">
                <span className="text-ember-500">
                  <Icon />
                </span>

                <div className="min-w-0">
                  <dt className="font-display text-[14.5px] leading-snug font-bold tracking-[-0.015em] text-balance text-brand-900">
                    {fact.value}
                  </dt>
                  <dd className="mt-1 text-[11.5px] leading-snug text-brand-800/50">
                    {t(`facts.${fact.key}`)}
                  </dd>
                </div>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}
