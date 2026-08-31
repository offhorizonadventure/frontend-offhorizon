import { getTranslations } from "next-intl/server";

import { DbTourCard } from "@/components/tours/DbTourCard";
import { Link } from "@/i18n/navigation";
import { allCards } from "@/lib/catalogue-cards";

/**
 * What else somebody looking at this tour might want.
 *
 * Nearest first: the same region, then the same country, then anywhere. A
 * reader on the Ladakh page is more likely to be choosing between Himalayan
 * routes than between Ladakh and Mongolia, and the order says so. Nothing is
 * shown at all when this is the only tour there is.
 */
export async function RelatedTours({
  tourId,
  country,
  region,
}: {
  tourId: string;
  country: string | null;
  region: string | null;
}) {
  const t = await getTranslations("tour.related");
  const cards = (await allCards()).filter((card) => card.tour.id !== tourId);

  if (cards.length === 0) return null;

  const rank = (card: (typeof cards)[number]) => {
    if (country && card.tour.country === country) {
      return region && card.tour.region === region ? 0 : 1;
    }

    return 2;
  };

  const shown = [...cards].sort((a, b) => rank(a) - rank(b)).slice(0, 2);

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div data-anim="up">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
                <span aria-hidden className="bg-ember-500/60 h-px w-8" />
                {t("eyebrow")}
              </span>
              <h2 className="font-display text-brand-900 mt-5 text-[clamp(1.7rem,3.2vw,2.5rem)] leading-[1.08] font-extrabold tracking-[-0.03em]">
                {t("title")}
              </h2>
            </div>

            <Link
              href="/calendar"
              className="group text-brand-800 hidden shrink-0 items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase sm:inline-flex"
            >
              {t("viewAll")}
              <span
                aria-hidden
                className="bg-brand-800 ease-out-expo h-px w-8 transition-all duration-500 group-hover:w-14"
              />
            </Link>
          </div>
        </div>

        <ul data-anim-group className="mt-10 grid gap-6 sm:mt-12 md:grid-cols-2">
          {shown.map((card) => (
            <li key={card.tour.id}>
              <div data-anim="up">
                <DbTourCard {...card} sizes="(max-width: 767px) 92vw, 560px" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
