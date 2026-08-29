import { getTranslations } from "next-intl/server";

import { DbTourCard } from "@/components/tours/DbTourCard";
import { EmptyTours } from "@/components/tours/EmptyTours";
import { Link } from "@/i18n/navigation";
import { latestCards } from "@/lib/catalogue-cards";

export async function UpcomingTours() {
  const t = await getTranslations("home.upcoming");
  const cards = await latestCards(4);

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
              <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
                <span aria-hidden className="bg-ember-500/60 h-px w-8" />
                {t("eyebrow")}
              </span>
              <h2 className="font-display text-brand-900 mt-5 text-[clamp(1.8rem,3.4vw,2.75rem)] leading-[1.08] font-extrabold tracking-[-0.03em]">
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

        <ul data-anim-group className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <li key={card.tour.id}>
              <div data-anim="up">
                <DbTourCard
                  {...card}
                  sizes="(max-width: 639px) 92vw, (max-width: 1023px) 46vw, 360px"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
