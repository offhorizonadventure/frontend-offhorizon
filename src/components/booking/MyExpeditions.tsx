import { getTranslations } from "next-intl/server";

import { Panel } from "@/components/account/parts";
import { ArrowRight } from "@/components/ui/icons";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { listMyExpeditions, listPrivateDepartures } from "@/lib/catalogue";

/** Custom expeditions built for this rider, which nobody else can see. */
export async function MyExpeditions({ locale }: { locale: Locale }) {
  const expeditions = await listMyExpeditions();
  if (!expeditions.length) return null;

  const t = await getTranslations({ locale, namespace: "bookings.custom" });

  const dated = await Promise.all(
    expeditions.map(async (tour) => ({
      tour,
      departures: await listPrivateDepartures(tour.id),
    })),
  );

  const dates = (start: string, end: string) =>
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).formatRange(new Date(`${start}T00:00:00Z`), new Date(`${end}T00:00:00Z`));

  return (
    <Panel title={t("title")} lead={t("lead")}>
      <ul className="space-y-4">
        {dated.map(({ tour, departures }) => (
          <li key={tour.id}>
            <Link
              href={`/adventure/${tour.slug}`}
              className="group ring-brand-900/8 hover:ring-brand-900/20 flex flex-wrap items-center justify-between gap-5 rounded-[20px] bg-white p-5 ring-1 transition-shadow"
            >
              <span className="min-w-0">
                <span className="font-display text-brand-900 block text-[17px] leading-tight font-bold tracking-[-0.02em]">
                  {tour.title}
                </span>
                <span className="text-brand-800/60 mt-1.5 block text-[13.5px]">
                  {departures.length
                    ? departures
                        .map((departure) => dates(departure.start_date, departure.end_date))
                        .join(" · ")
                    : t("noDates")}
                </span>
              </span>

              <span className="border-brand-900/20 text-brand-800 group-hover:border-brand-800 group-hover:bg-brand-800 group-hover:text-cream-100 inline-flex h-11 items-center gap-2.5 rounded-full border px-5 text-[10.5px] font-bold tracking-[0.12em] uppercase transition-colors">
                {t("open")}
                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
