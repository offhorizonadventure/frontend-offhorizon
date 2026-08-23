import Image from "next/image";

import { blurOf } from "@/lib/image-source";
import { getTranslations } from "next-intl/server";

import { Rail } from "@/components/tour/Rail";
import { ChevronDown } from "@/components/ui/icons";
import type { ProgramDay } from "@/lib/tour-types";
import type { Locale } from "@/i18n/config";

/** Day by day itinerary. */
export async function Program({ locale, days }: { locale: Locale; days: ProgramDay[] }) {
  const t = await getTranslations({ locale, namespace: "tour" });

  return (
    <section className="bg-brand-950 text-cream-100 relative overflow-hidden py-18 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(180,95,43,0.18),transparent_72%)]"
      />

      <div className="relative">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div
            data-anim="up"
            className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
                <span aria-hidden className="bg-ember-500/60 h-px w-8" />
                {t("program.eyebrow")}
              </span>
              <h2 className="font-display mt-5 text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.1] font-extrabold tracking-[-0.03em]">
                {t("program.title")}
              </h2>
            </div>
            <p className="text-cream-100/40 text-[11px] font-semibold tracking-[0.14em] uppercase">
              {t("program.dayCount", { count: days.length })}
            </p>
          </div>
        </div>

        <Rail
          className="program-rail mt-10"
          previousLabel={t("program.previous")}
          nextLabel={t("program.next")}
        >
          {days.map((day) => (
            <li key={day.day} className="program-item">
              <details className="group/day bg-brand-950 relative block h-full overflow-hidden rounded-[24px]">
                {/**
                 * Everything lives inside the summary: a closed <details> hides anything else,
                 * and only the summary can close it without JavaScript.
                 */}
                <summary className="relative flex h-full cursor-pointer list-none flex-col justify-between p-6 [&::-webkit-details-marker]:hidden">
                  <Image
                    src={day.image}
                    alt={day.title}
                    fill
                    {...blurOf(day.image)}
                    sizes="(max-width: 639px) 84vw, 320px"
                    quality={90}
                    className="ease-out-expo z-0 object-cover transition-transform duration-[1200ms] group-open/day:scale-[1.06]"
                  />
                  <span
                    aria-hidden
                    className="from-brand-950/95 via-brand-950/20 to-brand-950/30 absolute inset-0 z-0 bg-gradient-to-t"
                  />

                  <span className="relative z-30 flex items-center justify-between gap-3">
                    <span className="font-display text-cream-100 group-open/day:text-ember-500 text-[19px] leading-none font-extrabold tracking-[-0.02em]">
                      {t("program.day", { day: day.day })}
                    </span>
                    <span className="text-cream-100/70 hidden items-center gap-2 text-[10px] font-bold tracking-[0.14em] uppercase group-open/day:flex">
                      <ChevronDown className="rotate-180" />
                      {t("program.close")}
                    </span>
                  </span>

                  {/* Closed state */}
                  <span className="relative z-10 group-open/day:hidden">
                    <span className="font-display block text-[21px] leading-tight font-bold tracking-[-0.025em] text-balance text-white">
                      {day.title}
                    </span>
                    <span className="text-cream-100/70 mt-4 flex items-center gap-2 text-[10px] font-bold tracking-[0.14em] uppercase">
                      {t("program.more")}
                      <ChevronDown className="-rotate-90" />
                    </span>
                  </span>

                  {/**
                   * Open state, drawn over the photograph so the rail does not resize as cards
                   * are opened and closed.
                   */}
                  <span className="bg-brand-950/55 absolute inset-0 z-20 hidden flex-col overflow-y-auto p-6 pt-16 backdrop-blur-[2px] group-open/day:flex">
                    <span className="font-display text-[20px] leading-tight font-bold tracking-[-0.025em] text-balance text-white">
                      {day.title}
                    </span>

                    {day.stay && (
                      <span className="text-cream-100/45 mt-4 block text-[10px] font-bold tracking-[0.14em] uppercase">
                        {t("program.stay")}
                        <span className="text-cream-100/85 mt-1 block text-[12.5px] font-semibold tracking-normal normal-case">
                          {day.stay}
                        </span>
                      </span>
                    )}

                    <span className="text-cream-100/70 mt-4 block text-[13.5px] leading-[1.75] text-pretty">
                      {day.body}
                    </span>
                  </span>
                </summary>
              </details>
            </li>
          ))}
        </Rail>
      </div>
    </section>
  );
}
