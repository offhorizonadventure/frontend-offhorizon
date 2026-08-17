import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Rail } from "@/components/tour/Rail";
import { ChevronDown } from "@/components/ui/icons";
import type { ProgramDay } from "@/config/tour-pages";
import type { Locale } from "@/i18n/config";

/**
 * Day by day itinerary.
 *
 * A snap-scrolling rail of tall photographs, one per day, that open in place
 * to reveal the detail. Native <details>, so the whole itinerary is in the
 * HTML for crawlers and works before hydration; the open panel is drawn over
 * the photograph rather than replacing the card, which keeps the rail from
 * jumping about as days are opened and closed.
 */
export async function Program({ locale, days }: { locale: Locale; days: ProgramDay[] }) {
  const t = await getTranslations({ locale, namespace: "tour" });

  return (
    <section className="relative overflow-hidden bg-brand-950 py-18 text-cream-100 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(180,95,43,0.18),transparent_72%)]"
      />

      <div className="relative">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div data-anim="up" className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase">
                <span aria-hidden className="h-px w-8 bg-ember-500/60" />
                {t("program.eyebrow")}
              </span>
              <h2 className="font-display mt-5 text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.1] font-extrabold tracking-[-0.03em]">
                {t("program.title")}
              </h2>
            </div>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-cream-100/40 uppercase">
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
              <details className="group/day relative block h-full overflow-hidden rounded-[24px] bg-brand-950">
                {/* Everything lives inside the summary. A closed <details>
                    hides every child that is not the summary, so a photograph
                    left outside it would only appear once the card was opened,
                    and the summary is the only thing that can close a
                    <details> without JavaScript. */}
                <summary className="relative flex h-full cursor-pointer list-none flex-col justify-between p-6 [&::-webkit-details-marker]:hidden">
                  <Image
                    src={day.image}
                    alt=""
                    fill
                    placeholder="blur"
                    sizes="(max-width: 639px) 84vw, 320px"
                    className="z-0 object-cover transition-transform duration-[1200ms] ease-out-expo group-open/day:scale-[1.06]"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 z-0 bg-gradient-to-t from-brand-950/95 via-brand-950/20 to-brand-950/30"
                  />

                  <span className="relative z-30 flex items-center justify-between gap-3">
                    <span className="font-display text-[19px] leading-none font-extrabold tracking-[-0.02em] text-cream-100 group-open/day:text-ember-500">
                      {t("program.day", { day: day.day })}
                    </span>
                    <span className="hidden items-center gap-2 text-[10px] font-bold tracking-[0.14em] text-cream-100/70 uppercase group-open/day:flex">
                      <ChevronDown className="rotate-180" />
                      {t("program.close")}
                    </span>
                  </span>

                  {/* Closed state */}
                  <span className="relative z-10 group-open/day:hidden">
                    <span className="font-display block text-[21px] leading-tight font-bold tracking-[-0.025em] text-balance text-white">
                      {day.title}
                    </span>
                    <span className="mt-4 flex items-center gap-2 text-[10px] font-bold tracking-[0.14em] text-cream-100/70 uppercase">
                      {t("program.more")}
                      <ChevronDown className="-rotate-90" />
                    </span>
                  </span>

                  {/* Open state, drawn over the photograph so the rail does
                      not resize as cards are opened and closed. */}
                  <span className="absolute inset-0 z-20 hidden flex-col overflow-y-auto bg-brand-950/55 p-6 pt-16 backdrop-blur-[2px] group-open/day:flex">
                    <span className="font-display text-[20px] leading-tight font-bold tracking-[-0.025em] text-balance text-white">
                      {day.title}
                    </span>

                    {day.stay && (
                      <span className="mt-4 block text-[10px] font-bold tracking-[0.14em] text-cream-100/45 uppercase">
                        {t("program.stay")}
                        <span className="mt-1 block text-[12.5px] font-semibold tracking-normal text-cream-100/85 normal-case">
                          {day.stay}
                        </span>
                      </span>
                    )}

                    <span className="mt-4 block text-[13.5px] leading-[1.75] text-pretty text-cream-100/70">
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
