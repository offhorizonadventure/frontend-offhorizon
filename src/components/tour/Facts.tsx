import { getTranslations } from "next-intl/server";

import { Topo } from "@/components/ui/Topo";
import type { FactKey } from "@/config/tour-pages";
import type { Locale } from "@/i18n/config";

/**
 * Expedition facts.
 *
 * A ruled grid rather than cards, so eight short values read as one table a
 * visitor can scan in a couple of seconds. Labels are translated; the values
 * come from the tour and are not, yet.
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
    <section className="relative overflow-hidden bg-brand-950 py-16 text-cream-100 sm:py-20">
      <Topo className="text-cream-100/10" rings={13} seed={41.6} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_50%_at_50%_0%,rgba(180,95,43,0.2),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <h2
          data-anim="up"
          className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase"
        >
          <span aria-hidden className="h-px w-8 bg-ember-500/60" />
          {t("facts.title")}
        </h2>

        {/* Hairlines come from the grid gap showing through, which avoids a
            pile of nth-child rules for the edges of a wrapping grid. */}
        <dl
          data-anim-group
          className="mt-9 grid gap-px overflow-hidden rounded-2xl bg-cream-100/12 sm:grid-cols-2 lg:grid-cols-4"
        >
          {facts.map((fact) => (
            <div key={fact.key} className="bg-brand-950 p-6">
              <dt className="text-[10px] font-bold tracking-[0.18em] text-cream-100/40 uppercase">
                {t(`facts.${fact.key}`)}
              </dt>
              <dd className="font-display mt-2.5 text-[16px] leading-snug font-bold tracking-[-0.015em] text-balance text-cream-100">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
