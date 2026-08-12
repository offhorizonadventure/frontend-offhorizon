import { getFormatter, getTranslations } from "next-intl/server";

import { ArrowRight } from "@/components/ui/icons";
import type { Departure } from "@/config/tour-pages";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { getPrice } from "@/lib/currency";

/**
 * Dates and prices.
 *
 * A card per departure with everything on show. An accordion looked tidy on a
 * wide screen and was useless on a phone, where the row had to wrap anyway and
 * the detail was hidden behind a tap. Comparing four departures is the whole
 * job of this section, so nothing is folded away.
 *
 * Sold out departures stay in the list rather than being dropped: a full
 * calendar is information, and the waiting list is a real route in.
 */
export async function Departures({
  locale,
  departures,
}: {
  locale: Locale;
  departures: Departure[];
}) {
  const t = await getTranslations({ locale, namespace: "tour" });
  const format = await getFormatter({ locale });

  const rows = await Promise.all(
    departures.map(async (departure) => ({
      ...departure,
      soloPrice: await getPrice(departure.solo, locale),
      twinPrice: await getPrice(departure.twin, locale),
    })),
  );

  return (
    <section className="bg-white py-18 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div data-anim="up">
          <span className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase">
            <span aria-hidden className="h-px w-8 bg-ember-500/60" />
            {t("dates.eyebrow")}
          </span>
          <h2 className="font-display mt-5 text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-brand-900">
            {t("dates.title")}
          </h2>
        </div>

        <ul data-anim-group className="mt-10 grid gap-5 md:grid-cols-2">
          {rows.map((row) => {
            const start = new Date(row.start);
            const end = new Date(row.end);

            return (
              <li key={row.start}>
                <article
                  className={`@container flex h-full flex-col rounded-[24px] p-6 ring-1 transition-colors duration-300 sm:p-7 ${
                    row.soldOut
                      ? "bg-cream-50 ring-brand-900/10"
                      : "bg-white ring-brand-900/15 hover:ring-brand-800/40"
                  }`}
                >
                  <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
                    <h3 className="font-display text-[clamp(1.15rem,2.2vw,1.45rem)] leading-none font-extrabold tracking-[-0.03em] text-brand-900 tabular-nums">
                      {format.dateTimeRange(start, end, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-[9.5px] font-bold tracking-[0.14em] whitespace-nowrap uppercase ${
                        row.soldOut
                          ? "bg-brand-900/8 text-brand-800/55"
                          : "bg-ember-500/15 text-ember-600"
                      }`}
                    >
                      {row.soldOut ? t("dates.soldOut") : t("dates.available")}
                    </span>
                  </header>

                  <dl className="mt-6 grid gap-x-6 gap-y-5 border-t border-brand-900/10 pt-6 @sm:grid-cols-2">
                    <div className="@sm:col-span-2">
                      <dt className="text-[9.5px] font-bold tracking-[0.16em] text-brand-800/45 uppercase">
                        {t("dates.perPerson")}
                      </dt>
                      <dd className="font-display mt-2.5 flex flex-wrap items-baseline gap-x-6 gap-y-2 text-brand-900 tabular-nums">
                        <span className="flex items-baseline gap-2">
                          <span className="text-[10px] font-bold tracking-[0.14em] text-brand-800/50 uppercase">
                            {t("dates.twin")}
                          </span>
                          <span className="text-[21px] leading-none font-extrabold tracking-[-0.025em]">
                            {row.twinPrice}
                          </span>
                        </span>
                        <span className="flex items-baseline gap-2">
                          <span className="text-[10px] font-bold tracking-[0.14em] text-brand-800/50 uppercase">
                            {t("dates.solo")}
                          </span>
                          <span className="text-[17px] leading-none font-bold tracking-[-0.02em] text-brand-800/75">
                            {row.soloPrice}
                          </span>
                        </span>
                      </dd>
                    </div>

                    <div>
                      <dt className="text-[9.5px] font-bold tracking-[0.16em] text-brand-800/45 uppercase">
                        {t("dates.edition")}
                      </dt>
                      <dd className="font-display mt-2 text-[15px] leading-snug font-bold tracking-[-0.015em] text-brand-900">
                        {row.edition}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-[9.5px] font-bold tracking-[0.16em] text-brand-800/45 uppercase">
                        {t("dates.ledBy")}
                      </dt>
                      <dd className="font-display mt-2 text-[15px] leading-snug font-bold tracking-[-0.015em] text-brand-900">
                        {row.leader}
                      </dd>
                    </div>

                    <div className="@sm:col-span-2">
                      <dt className="text-[9.5px] font-bold tracking-[0.16em] text-brand-800/45 uppercase">
                        {t("dates.direction")}
                      </dt>
                      <dd className="font-display mt-2 text-[15px] leading-snug font-bold tracking-[-0.015em] text-brand-900">
                        {row.direction}
                      </dd>
                    </div>
                  </dl>

                  {/* The spacer owns the gap and the push to the foot, so the
                      buttons line up across a row of cards whatever length the
                      values above happen to be. Putting mt-auto and a margin
                      on the link itself would be two margin-top utilities
                      fighting over which one wins. */}
                  <div className="mt-auto pt-9">
                    <Link
                      href="/custom-expeditions"
                      className={`group flex h-13 items-center justify-center gap-2.5 rounded-full px-5 text-center text-[11px] font-bold tracking-[0.12em] uppercase transition-colors duration-300 ${
                        row.soldOut
                          ? "border border-brand-900/20 text-brand-800 hover:border-brand-800 hover:bg-brand-800 hover:text-cream-100"
                          : "bg-brand-800 text-cream-100 hover:bg-brand-900"
                      }`}
                    >
                      {row.soldOut ? t("dates.joinWaitlist") : t("dates.enquire")}
                      <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        <p
          data-anim="up"
          className="mt-8 border-t border-brand-900/10 pt-6 text-[12px] leading-[1.75] text-brand-800/45"
        >
          {t("dates.disclaimer")}
        </p>
      </div>
    </section>
  );
}
