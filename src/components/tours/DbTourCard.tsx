import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import { Star } from "@/components/ui/icons";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { imageUrl, tourPath, type Tour } from "@/lib/catalogue";
import { getPrice } from "@/lib/currency";

export type CardTour = {
  tour: Tour;
  priceFrom: number | null;
  currency: string;
};

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
    <article className="group ring-brand-900/10 @container relative overflow-hidden rounded-[26px] ring-1">
      <div className="bg-brand-100 relative aspect-[3/4] @xs:aspect-[4/5] @sm:aspect-[1/1]">
        {hero && (
          <Image
            src={hero}
            alt={tour.hero_alt ?? tour.title}
            fill
            sizes={sizes}
            quality={90}
            className="ease-out-expo object-cover transition-transform duration-[1100ms] group-hover:scale-[1.04]"
          />
        )}
      </div>

      <div className="absolute inset-x-2.5 bottom-2.5 rounded-[18px] bg-white/97 p-4 backdrop-blur-sm @sm:p-5">
        {tour.rating !== null && (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span aria-hidden className="text-ember-500 flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, star) => (
                <Star key={star} />
              ))}
            </span>
            <span className="text-brand-900 text-[12px] font-semibold">
              {decimal.format(tour.rating)}
            </span>
            {tour.reviews !== null && (
              <span className="text-brand-800/50 text-[12px] whitespace-nowrap">
                {t("reviews", { count: compact.format(tour.reviews) })}
              </span>
            )}
          </p>
        )}

        <Heading className="font-display text-brand-900 mt-2 line-clamp-2 text-[17px] leading-tight font-bold tracking-[-0.02em] text-balance @sm:text-[19px]">
          {tour.title}
        </Heading>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <p className="text-brand-800/55 text-[12.5px]">
            {price ? t("startingAt", { price }) : ts("planned")}
          </p>

          <Link
            href={tourPath(tour)}
            className="border-brand-900/20 text-brand-800 hover:border-brand-800 hover:bg-brand-800 hover:text-cream-100 inline-flex h-11 shrink-0 items-center justify-center rounded-full border px-5 text-center text-[11px] font-bold tracking-[0.11em] uppercase transition-colors duration-300"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </article>
  );
}
