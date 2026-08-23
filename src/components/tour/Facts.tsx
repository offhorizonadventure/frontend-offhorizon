import { getTranslations } from "next-intl/server";

import { factIcons } from "@/components/ui/icons";
import type { FactKey } from "@/lib/tour-types";
import type { Locale } from "@/i18n/config";

/** Expedition facts. */
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
        {/**
         * No visible heading: the card straddles the hero, so anything above the grid
         * gets pulled up into the lead paragraph behind it.
         */}
        <h2 className="sr-only">{t("facts.title")}</h2>

        {/** One card, with the dividers drawn as real borders inside it. */}
        <dl className="facts-grid shadow-brand-950/8 ring-brand-900/10 overflow-hidden rounded-[22px] bg-white shadow-lg ring-1">
          {facts.map((fact) => {
            const Icon = factIcons[fact.key];

            // Centred, not top aligned: the values run to one or two lines.
            return (
              <div key={fact.key} className="flex items-center gap-3.5 p-6">
                <span className="text-ember-500">
                  <Icon />
                </span>

                <div className="min-w-0">
                  <dt className="font-display text-brand-900 text-[14.5px] leading-snug font-bold tracking-[-0.015em] text-balance">
                    {fact.value}
                  </dt>
                  <dd className="text-brand-800/50 mt-1 text-[11.5px] leading-snug">
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
