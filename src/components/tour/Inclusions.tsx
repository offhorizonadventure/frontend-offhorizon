import { getTranslations } from "next-intl/server";

import { Topo } from "@/components/ui/Topo";
import type { Locale } from "@/i18n/config";

/**
 * What the price covers, and what it does not.
 *
 * Two panels split by a single hairline, with the marks carrying the meaning
 * rather than the words: filled ember for what is in, hollow for what is out.
 * The counts sit in the headings so the balance between the two columns is
 * obvious before anything is read, which is the question people are actually
 * asking when they look at this.
 */
export async function Inclusions({
  locale,
  included,
  excluded,
}: {
  locale: Locale;
  included: string[];
  excluded: string[];
}) {
  const t = await getTranslations({ locale, namespace: "tour" });

  return (
    <section className="relative overflow-hidden bg-brand-950 py-18 text-cream-100 sm:py-24">
      <Topo className="text-cream-100/10" rings={15} seed={43.2} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_50%_at_50%_0%,rgba(180,95,43,0.2),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div data-anim="up" className="max-w-2xl">
          <span className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase">
            <span aria-hidden className="h-px w-8 bg-ember-500/60" />
            {t("inclusions.eyebrow")}
          </span>
          <h2 className="font-display mt-5 text-[clamp(1.7rem,3.4vw,2.5rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance">
            {t("inclusions.title")}
          </h2>
        </div>

        <div
          data-anim-group
          className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-cream-100/12 lg:grid-cols-2"
        >
          <div className="bg-brand-950 p-7 sm:p-9">
            <h3 className="flex items-baseline gap-3">
              <span className="font-display text-[18px] leading-none font-bold tracking-[-0.02em]">
                {t("inclusions.inTitle")}
              </span>
              <span className="font-display text-[12px] font-extrabold tracking-[0.14em] text-ember-500 tabular-nums">
                {String(included.length).padStart(2, "0")}
              </span>
            </h3>

            <ul className="mt-6 space-y-3.5">
              {included.map((item) => (
                <li key={item} className="flex gap-3.5 text-[14px] leading-[1.7] text-cream-100/75">
                  <span
                    aria-hidden
                    className="mt-[0.35em] flex size-4 shrink-0 items-center justify-center rounded-full bg-ember-500 text-[10px] leading-none font-bold text-brand-950"
                  >
                    +
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-brand-950 p-7 sm:p-9">
            <h3 className="flex items-baseline gap-3">
              <span className="font-display text-[18px] leading-none font-bold tracking-[-0.02em] text-cream-100/70">
                {t("inclusions.outTitle")}
              </span>
              <span className="font-display text-[12px] font-extrabold tracking-[0.14em] text-cream-100/35 tabular-nums">
                {String(excluded.length).padStart(2, "0")}
              </span>
            </h3>

            <ul className="mt-6 space-y-3.5">
              {excluded.map((item) => (
                <li key={item} className="flex gap-3.5 text-[14px] leading-[1.7] text-cream-100/45">
                  <span
                    aria-hidden
                    className="mt-[0.35em] flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] leading-none font-bold text-cream-100/50 ring-1 ring-cream-100/30"
                  >
                    &minus;
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
