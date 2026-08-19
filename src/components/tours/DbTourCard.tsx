import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import { Star } from "@/components/ui/icons";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { imageUrl, type Tour } from "@/lib/catalogue";
import { getPrice } from "@/lib/currency";

export type CardTour = {
  tour: Tour;
  /** Cheapest rider price on a published departure, or null when none is dated. */
  priceFrom: number | null;
  currency: string;
};

/**
 * Tour card, from the database.
 *
 * Same card as before, with two differences that come from the data rather than
 * from a redesign:
 *
 * * The rating row is only drawn when a rating has been entered. Five stars
 *   nobody has given is worse than no stars.
 * * A tour with no dated departure says so instead of quoting a price. The
 *   admin decides which it is by whether anyone has scheduled it, and the card
 *   reads "Planned" until someone does.
 */
export async function DbTourCard({
  tour,
  priceFrom,
  currency,
  sizes,
  headingLevel = 3,
}: CardTour & {
  sizes: string;
  headingLevel?: 3 | 4;
}) {
  const Heading = `h${headingLevel}` as const;
  const [t, ts, locale] = await Promise.all([
    getTranslations("home.upcoming"),
    getTranslations("dest.shared"),
    getLocale() as Promise<Locale>,
  ]);

  const compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
  const decimal = new Intl.NumberFormat(locale, { minimumFractionDigits: 1 });

  const price = priceFrom === null ? null : await getPrice(priceFrom, locale, currency);
  const hero = imageUrl(tour.hero_path);

  return (
    <article className="group @container relative overflow-hidden rounded-[26px] ring-1 ring-brand-900/10">
      <div className="relative aspect-[3/4] bg-brand-100 @xs:aspect-[4/5] @sm:aspect-[1/1]">
        {hero && (
          <Image
            src={hero}
            alt={tour.hero_alt ?? tour.title}
            fill
            sizes={sizes}
            quality={90}
            className="object-cover transition-transform duration-[1100ms] ease-out-expo group-hover:scale-[1.04]"
          />
        )}
      </div>

      <div className="absolute inset-x-2.5 bottom-2.5 rounded-[18px] bg-white/97 p-4 backdrop-blur-sm @sm:p-5">
        {tour.rating !== null && (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span aria-hidden className="flex items-center gap-0.5 text-ember-500">
              {Array.from({ length: 5 }).map((_, star) => (
                <Star key={star} />
              ))}
            </span>
            <span className="text-[12px] font-semibold text-brand-900">
              {decimal.format(tour.rating)}
            </span>
            {tour.reviews !== null && (
              <span className="text-[12px] whitespace-nowrap text-brand-800/50">
                {t("reviews", { count: compact.format(tour.reviews) })}
              </span>
            )}
          </p>
        )}

        <Heading className="font-display mt-2 line-clamp-2 text-[17px] leading-tight font-bold tracking-[-0.02em] text-balance text-brand-900 @sm:text-[19px]">
          {tour.title}
        </Heading>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <p className="text-[12.5px] text-brand-800/55">
            {price ? t("startingAt", { price }) : ts("planned")}
          </p>

          <Link
            href={`/tours/${tour.slug}`}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-brand-900/20 px-5 text-center text-[11px] font-bold tracking-[0.11em] text-brand-800 uppercase transition-colors duration-300 hover:border-brand-800 hover:bg-brand-800 hover:text-cream-100"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </article>
  );
}
