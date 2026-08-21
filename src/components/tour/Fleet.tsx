import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Topo } from "@/components/ui/Topo";
import type { Locale } from "@/i18n/config";
import { fleetImageUrl, type Vehicle } from "@/lib/catalogue";
import { getPrice } from "@/lib/currency";

/** The cars a 4x4 expedition runs. */
export async function Fleet({
  locale,
  vehicles,
  currency,
  days,
}: {
  locale: Locale;
  vehicles: Vehicle[];
  /** The currency the daily rates are quoted in. */
  currency: string;
  /** Length of the shortest departure, for the worked example. */
  days: number;
}) {
  const t = await getTranslations({ locale, namespace: "tour.fleet" });

  const cards = await Promise.all(
    vehicles.map(async (vehicle) => ({
      ...vehicle,
      url: fleetImageUrl(vehicle.image_path),
      perDay: vehicle.per_day_price
        ? await getPrice(vehicle.per_day_price, locale, currency)
        : null,
      total:
        vehicle.per_day_price && days
          ? await getPrice(vehicle.per_day_price * days, locale, currency)
          : null,
    })),
  );

  return (
    <section className="bg-cream-50 relative overflow-hidden py-18 sm:py-24">
      <Topo className="text-brand-800/12" rings={12} seed={45.8} />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div data-anim="up" className="max-w-2xl">
          <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
            <span aria-hidden className="bg-ember-500/60 h-px w-8" />
            {t("eyebrow")}
          </span>
          <h2 className="font-display text-brand-900 mt-5 text-[clamp(1.7rem,3.4vw,2.5rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance">
            {t("title")}
          </h2>
          <p className="text-brand-800/65 mt-5 text-[15px] leading-[1.85] text-pretty">
            {t("lead", { days })}
          </p>
        </div>

        <ul data-anim-group className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((vehicle) => (
            <li key={vehicle.id}>
              <article
                data-anim="up"
                className="ring-brand-900/10 h-full overflow-hidden rounded-[22px] bg-white ring-1"
              >
                <div className="bg-brand-100 relative aspect-[4/3]">
                  {vehicle.url && (
                    <Image
                      src={vehicle.url}
                      alt={vehicle.image_alt ?? vehicle.name}
                      fill
                      sizes="(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 360px"
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="p-5 sm:p-6">
                  <h3 className="font-display text-brand-900 text-[17px] leading-tight font-bold tracking-[-0.02em]">
                    {vehicle.name}
                  </h3>

                  <p className="text-brand-800/55 mt-1.5 text-[12.5px]">
                    {t("seats", { count: vehicle.seats ?? 4 })}
                  </p>

                  {vehicle.notes && (
                    <p className="text-brand-800/60 mt-3 text-[13.5px] leading-[1.7]">
                      {vehicle.notes}
                    </p>
                  )}

                  {vehicle.perDay && (
                    <p className="border-brand-900/10 mt-4 border-t pt-4">
                      <span className="font-display text-brand-900 text-[19px] font-extrabold tracking-[-0.02em] tabular-nums">
                        {vehicle.perDay}
                      </span>
                      <span className="text-brand-800/55 ml-1.5 text-[12.5px]">{t("perDay")}</span>

                      {vehicle.total && (
                        <span className="text-brand-800/45 mt-1 block text-[12.5px]">
                          {t("forTrip", { total: vehicle.total, days })}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
