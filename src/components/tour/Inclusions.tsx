import { getTranslations } from "next-intl/server";

import { ChevronDown } from "@/components/ui/icons";
import { Topo } from "@/components/ui/Topo";
import type { Locale } from "@/i18n/config";
import type { Inclusion } from "@/lib/catalogue";

function Line({ item, tone }: { item: Inclusion; tone: "in" | "out" }) {
  const { title, body } = item;

  const mark =
    tone === "in" ? "bg-ember-500 text-brand-950" : "text-cream-100/50 ring-1 ring-cream-100/30";

  const text = tone === "in" ? "text-cream-100/85" : "text-cream-100/55";

  const row = (
    <>
      <span
        aria-hidden
        className={`mt-[0.15em] flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] leading-none font-bold ${mark}`}
      >
        {tone === "in" ? "+" : "−"}
      </span>
      <span className="flex-1 text-[14px] leading-[1.6]">{title}</span>
    </>
  );

  const frame = "rounded-xl border border-cream-100/10 bg-cream-100/[0.03] px-4 py-3.5";

  if (!body) {
    return <li className={`${frame} ${text} flex gap-3.5`}>{row}</li>;
  }

  return (
    <li className={`${frame} ${text} hover:border-cream-100/20 transition-colors`}>
      {}
      <details className="group/row">
        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
          <span className="flex flex-1 items-start gap-3.5">{row}</span>

          <span className="bg-cream-100/8 text-cream-100/60 group-open/row:bg-ember-500 group-open/row:text-brand-950 flex size-7 shrink-0 items-center justify-center rounded-full transition-colors duration-300">
            <ChevronDown className="transition-transform duration-300 group-open/row:rotate-180" />
          </span>
        </summary>

        <p className="border-cream-100/10 text-cream-100/55 mt-3 border-t pt-3 pr-10 pl-[1.9rem] text-[13.5px] leading-[1.75]">
          {body}
        </p>
      </details>
    </li>
  );
}

export async function Inclusions({
  locale,
  included,
  excluded,
}: {
  locale: Locale;
  included: Inclusion[];
  excluded: Inclusion[];
}) {
  const t = await getTranslations({ locale, namespace: "tour" });

  return (
    <section className="bg-brand-950 text-cream-100 relative overflow-hidden py-18 sm:py-24">
      <Topo className="text-cream-100/10" rings={15} seed={43.2} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_50%_at_50%_0%,rgba(180,95,43,0.2),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div data-anim="up" className="max-w-2xl">
          <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
            <span aria-hidden className="bg-ember-500/60 h-px w-8" />
            {t("inclusions.eyebrow")}
          </span>
          <h2 className="font-display mt-5 text-[clamp(1.7rem,3.4vw,2.5rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance">
            {t("inclusions.title")}
          </h2>
        </div>

        <div
          data-anim-group
          className="bg-cream-100/12 mt-12 grid gap-px overflow-hidden rounded-3xl lg:grid-cols-2"
        >
          <div className="bg-brand-950 p-7 sm:p-9">
            <h3 className="flex items-baseline gap-3">
              <span className="font-display text-[18px] leading-none font-bold tracking-[-0.02em]">
                {t("inclusions.inTitle")}
              </span>
              <span className="font-display text-ember-500 text-[12px] font-extrabold tracking-[0.14em] tabular-nums">
                {String(included.length).padStart(2, "0")}
              </span>
            </h3>

            <ul className="mt-6 space-y-2.5">
              {included.map((item) => (
                <Line key={item.title} item={item} tone="in" />
              ))}
            </ul>
          </div>

          <div className="bg-brand-950 p-7 sm:p-9">
            <h3 className="flex items-baseline gap-3">
              <span className="font-display text-cream-100/70 text-[18px] leading-none font-bold tracking-[-0.02em]">
                {t("inclusions.outTitle")}
              </span>
              <span className="font-display text-cream-100/35 text-[12px] font-extrabold tracking-[0.14em] tabular-nums">
                {String(excluded.length).padStart(2, "0")}
              </span>
            </h3>

            <ul className="mt-6 space-y-2.5">
              {excluded.map((item) => (
                <Line key={item.title} item={item} tone="out" />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
