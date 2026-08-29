import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { FleetDrawer, type FleetCard } from "@/components/tour/FleetDrawer";
import { Rail } from "@/components/tour/Rail";
import { Topo } from "@/components/ui/Topo";
import type { Locale } from "@/i18n/config";
import { fleetImageUrl, type Vehicle } from "@/lib/catalogue";
import { getPrice } from "@/lib/currency";

export async function Fleet({
  locale,
  vehicles,
  currency,
  days,
  from,
}: {
  locale: Locale;
  vehicles: Vehicle[];
  currency: string;
  days: number;
  from?: string;
}) {
  const t = await getTranslations({ locale, namespace: "tour.fleet" });

  const bikes = vehicles.filter((vehicle) => vehicle.kind === "bike").length;
  const tone = bikes === vehicles.length ? "bikes" : bikes > 0 ? "mixed" : "cars";

  const cards: FleetCard[] = await Promise.all(
    vehicles.map(async (vehicle) => ({
      id: vehicle.id,
      name: vehicle.name,
      url: fleetImageUrl(vehicle.image_path),
      alt: vehicle.image_alt ?? vehicle.name,
      seats: vehicle.kind === "bike" ? null : t("seats", { count: vehicle.seats ?? 4 }),
      notes: vehicle.notes,
      perDay: vehicle.per_day_price
        ? await getPrice(vehicle.per_day_price, locale, from ?? currency)
        : null,
      total:
        vehicle.per_day_price && days
          ? t("forTrip", {
              total: await getPrice(vehicle.per_day_price * days, locale, from ?? currency),
              days,
            })
          : null,
    })),
  );

  return (
    <section className="bg-cream-50 relative overflow-hidden py-18 sm:py-24">
      <Topo className="text-brand-800/12" rings={12} seed={45.8} />

      <div className="relative">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div data-anim="up" className="max-w-2xl">
            <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
              <span aria-hidden className="bg-ember-500/60 h-px w-8" />
              {t("eyebrow")}
            </span>
            <h2 className="font-display text-brand-900 mt-5 text-[clamp(1.7rem,3.4vw,2.5rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance">
              {t(`${tone}.title`)}
            </h2>
            <p className="text-brand-800/65 mt-5 text-[15px] leading-[1.85] text-pretty">
              {t(`${tone}.lead`, { days })}
            </p>
          </div>
        </div>

        <Rail
          className="fleet-rail mt-10"
          tone="light"
          previousLabel={t("previous")}
          nextLabel={t("next")}
        >
          {cards.map((car) => (
            <li key={car.id} className="fleet-item">
              <article className="ring-brand-900/10 flex h-full flex-col overflow-hidden rounded-[20px] bg-white ring-1">
                <div className="bg-brand-100 relative aspect-[4/3]">
                  {car.url && (
                    <Image
                      src={car.url}
                      alt={car.alt}
                      fill
                      sizes="(max-width: 639px) 70vw, 300px"
                      quality={75}
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between gap-3 p-4">
                  <div>
                    <h3 className="font-display text-brand-900 text-[15px] leading-tight font-bold tracking-[-0.02em]">
                      {car.name}
                    </h3>
                    {car.seats && <p className="text-brand-800/50 mt-1 text-[12px]">{car.seats}</p>}
                  </div>

                  {car.perDay && (
                    <p className="text-brand-900">
                      <span className="font-display text-[17px] font-extrabold tracking-[-0.02em] tabular-nums">
                        {car.perDay}
                      </span>
                      <span className="text-brand-800/55 ml-1.5 text-[12px]">{t("perDay")}</span>
                    </p>
                  )}
                </div>
              </article>
            </li>
          ))}
        </Rail>

        <div className="mx-auto mt-10 flex max-w-6xl justify-center px-5 sm:px-8">
          <FleetDrawer
            label={t("seeAll")}
            title={t(`${tone}.title`)}
            cars={cards}
            perDayLabel={t("perDay")}
          />
        </div>
      </div>
    </section>
  );
}
