import Image, { type StaticImageData } from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import { Star } from "@/components/ui/icons";
import type { TourPackage } from "@/config/packages";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { getPrice } from "@/lib/currency";

/**
 * Package card. Used by the home page departures and by the destination
 * pages, so the two cannot drift apart.
 *
 * Rating and review counts go through Intl, which keeps the decimal separator
 * and the compact "2.8K" suffix correct per language. The price is converted
 * from the single USD figure in the config to whatever suits the market.
 */
export async function TourCard({
  tour,
  sizes,
  image,
}: {
  tour: TourPackage;
  sizes: string;
  /** Overrides the package photo where a page needs a different crop. */
  image?: StaticImageData;
}) {
  const [t, tt, locale] = await Promise.all([
    getTranslations("home.upcoming"),
    getTranslations("tours"),
    getLocale() as Promise<Locale>,
  ]);

  const compact = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
  const decimal = new Intl.NumberFormat(locale, { minimumFractionDigits: 1 });
  const price = await getPrice(tour.priceFrom, locale);
  const name = tt(`${tour.key}.name`);

  return (
    <article className="group relative overflow-hidden rounded-[26px] ring-1 ring-brand-900/10">
      {/* Steps down as the card widens: one column on phones needs the
          tallest frame, two columns from md do not. */}
      <div className="relative aspect-[4/5] sm:aspect-[3/2] md:aspect-[1/1]">
        <Image
          src={image ?? tour.image}
          alt={name}
          fill
          placeholder="blur"
          sizes={sizes}
          className="object-cover transition-transform duration-[1100ms] ease-out-expo group-hover:scale-[1.04]"
        />
      </div>

      {/* Info plate floats over the foot of the photograph. */}
      <div className="absolute inset-x-2.5 bottom-2.5 rounded-[18px] bg-white/97 p-4 backdrop-blur-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2">
              <span aria-hidden className="flex items-center gap-0.5 text-ember-500">
                {Array.from({ length: 5 }).map((_, star) => (
                  <Star key={star} />
                ))}
              </span>
              <span className="text-[12px] font-semibold text-brand-900">
                {decimal.format(tour.rating)}
              </span>
              <span className="text-[12px] text-brand-800/50">
                {t("reviews", { count: compact.format(tour.reviews) })}
              </span>
            </p>

            <h3 className="font-display mt-2 truncate text-[18px] leading-tight font-bold tracking-[-0.02em] text-brand-900 sm:text-[19px]">
              {name}
            </h3>

            <p className="mt-1.5 text-[12.5px] text-brand-800/55">
              {t("startingAt", { price })}
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
  );
}
