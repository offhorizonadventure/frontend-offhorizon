import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import { Star } from "@/components/ui/icons";
import { upcomingPackages } from "@/config/packages";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { getPrice } from "@/lib/currency";

/**
 * Upcoming departures.
 *
 * Prices run through `getPrice`, so a visitor in France sees euros and a
 * visitor in the US sees dollars from the single USD figure in the config.
 * Rating and review counts are formatted with Intl too, which keeps the
 * decimal separator and the compact "2.8K" suffix correct per language.
 */
export async function UpcomingTours() {
  const [t, tt, locale] = await Promise.all([
    getTranslations("home.upcoming"),
    getTranslations("tours"),
    getLocale() as Promise<Locale>,
  ]);

  const compact = new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  const decimal = new Intl.NumberFormat(locale, { minimumFractionDigits: 1 });

  const cards = await Promise.all(
    upcomingPackages.map(async (tour) => ({
      ...tour,
      price: await getPrice(tour.priceFrom, locale),
    })),
  );

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div data-anim="up">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase">
                <span aria-hidden className="h-px w-8 bg-ember-500/60" />
                {t("eyebrow")}
              </span>
              <h2 className="font-display mt-5 text-[clamp(1.8rem,3.4vw,2.75rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-brand-900">
                {t("title")}
              </h2>
            </div>

            <Link
              href="/adventure-tours"
              className="group hidden shrink-0 items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-brand-800 uppercase sm:inline-flex"
            >
              {t("viewAll")}
              <span
                aria-hidden
                className="h-px w-8 bg-brand-800 transition-all duration-500 ease-out-expo group-hover:w-14"
              />
            </Link>
          </div>
        </div>

        <ul data-anim-group className="mt-10 grid gap-6 md:grid-cols-2 sm:mt-12">
          {cards.map((tour) => (
            <li key={tour.key}>
              <div data-anim="up">
                <article className="group relative overflow-hidden rounded-[26px] ring-1 ring-brand-900/10">
                  {/* Steps down as the card widens: one column on phones needs the
                      tallest frame, two columns from md do not. */}
                  <div className="relative aspect-[4/5] sm:aspect-[3/2] md:aspect-[1/1]">
                    <Image
                      src={tour.image}
                      alt={tt(`${tour.key}.name`)}
                      fill
                      placeholder="blur"
                      sizes="(max-width: 767px) 92vw, 560px"
                      className="object-cover transition-transform duration-[1100ms] ease-out-expo group-hover:scale-[1.04]"
                    />
                  </div>

                  {/* Info plate floats over the foot of the photograph. */}
                  <div className="absolute inset-x-2.5 bottom-2.5 rounded-[18px] bg-white/97 p-4 backdrop-blur-sm sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2">
                          <span
                            aria-hidden
                            className="flex items-center gap-0.5 text-ember-500"
                          >
                            {Array.from({ length: 5 }).map((_, star) => (
                              <Star key={star} />
                            ))}
                          </span>
                          <span className="text-[12px] font-semibold text-brand-900">
                            {decimal.format(tour.rating)}
                          </span>
                          <span className="text-[12px] text-brand-800/50">
                            {t("reviews", {
                              count: compact.format(tour.reviews),
                            })}
                          </span>
                        </p>

                        <h3 className="font-display mt-2 truncate text-[18px] leading-tight font-bold tracking-[-0.02em] text-brand-900 sm:text-[19px]">
                          {tt(`${tour.key}.name`)}
                        </h3>

                        <p className="mt-1.5 text-[12.5px] text-brand-800/55">
                          {t("startingAt", { price: tour.price })}
                        </p>
                      </div>

                      <Link
                        href={tour.href}
                        className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-brand-900/20 px-5 text-[11px] font-bold tracking-[0.11em] text-brand-800 uppercase transition-colors duration-300 hover:border-brand-800 hover:bg-brand-800 hover:text-cream-100"
                      >
                        {t("cta")}
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
