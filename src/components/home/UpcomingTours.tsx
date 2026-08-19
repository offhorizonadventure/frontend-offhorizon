import { getTranslations } from "next-intl/server";

import { DbTourCard } from "@/components/tours/DbTourCard";
import { EmptyTours } from "@/components/tours/EmptyTours";
import { Link } from "@/i18n/navigation";
import { featuredCards } from "@/lib/catalogue-cards";

/**
 * Upcoming departures. The card itself lives in `DbTourCard`, because the
 * destination pages show the same thing.
 *
 * Which two appear is decided in the admin by the featured switch. With nothing
 * featured it falls back to the newest two rather than showing an empty band,
 * and with nothing published at all it says so and offers a custom expedition.
 */
export async function UpcomingTours() {
  const t = await getTranslations("home.upcoming");
  const cards = await featuredCards(2);

  if (cards.length === 0) {
    return (
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <EmptyTours />
        </div>
      </section>
    );
  }

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

        <ul data-anim-group className="mt-10 grid gap-6 sm:mt-12 md:grid-cols-2">
          {cards.map((card) => (
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
