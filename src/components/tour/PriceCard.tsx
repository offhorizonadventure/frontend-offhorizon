import { getTranslations } from "next-intl/server";

import { DatesDrawer } from "@/components/tour/DatesDrawer";
import { MoreLines } from "@/components/tour/MoreLines";
import { ArrowRight, priceIcons } from "@/components/ui/icons";
import type { Departure, FactKey, PriceGroup } from "@/lib/tour-types";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { buildBooking } from "@/lib/booking-props";
import { getPrice } from "@/lib/currency";

export async function PriceCard({
  locale,
  pricing,
  tourName,
  facts,
  departures,
  from,
}: {
  locale: Locale;
  pricing: PriceGroup[];
  tourName: string;
  facts: { key: FactKey; value: string }[];
  departures: Departure[];
  from?: string;
}) {
  const byPerson = departures.every((departure) => departure.kind === "4x4");
  const t = await getTranslations({ locale, namespace: "tour" });
  const ts = await getTranslations({ locale, namespace: "dest.shared" });

  const groups = await Promise.all(
    pricing.map(async (group) => ({
      title: group.title,
      lines: await Promise.all(
        group.lines.map(async (line) => ({
          ...line,
          price: line.amount > 0 ? await getPrice(line.amount, locale, from) : null,
          Icon: priceIcons[line.icon],
        })),
      ),
    })),
  );

  const headline = groups[0]?.lines[0];

  const booking = await buildBooking({ locale, pricing, tourName, facts, departures, from });

  return (
    <div className="bg-cream-50/97 shadow-brand-950/30 ring-cream-100/20 rounded-[26px] p-6 shadow-2xl ring-1 backdrop-blur-md sm:p-7">
      {}
      {headline?.price ? (
        <>
          <p className="text-brand-800/50 text-[9.5px] font-bold tracking-[0.18em] uppercase">
            {t("price.from")}
          </p>
          <p className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="font-display text-brand-900 text-[clamp(1.9rem,4vw,2.4rem)] leading-none font-extrabold tracking-[-0.035em] tabular-nums">
              {headline.price}
            </span>
            <span className="text-brand-800/55 text-[12px] font-semibold">
              {byPerson ? t("price.perPerson") : t("price.perRider")}
            </span>
          </p>
        </>
      ) : (
        <>
          <p className="text-brand-800/50 text-[9.5px] font-bold tracking-[0.18em] uppercase">
            {ts("planned")}
          </p>
          <p className="text-brand-800/65 mt-2 text-[14px] leading-relaxed">{t("price.noDates")}</p>
        </>
      )}

      {groups.length > 0 && (
        <div className="border-brand-900/12 mt-6 space-y-6 border-t pt-6">
          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-brand-800/45 text-[9.5px] font-bold tracking-[0.18em] uppercase">
                {group.title}
              </h3>

              <ul className="mt-3 space-y-2.5">
                <MoreLines
                  visible={2}
                  moreLabel={t.raw("price.more") as string}
                  lessLabel={t("price.less")}
                >
                  {group.lines.map((line) => (
                    <li key={line.label} className="flex items-start gap-3">
                      <span className="bg-brand-900/6 text-brand-700 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full">
                        <line.Icon />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                          <span className="font-display text-brand-900 text-[14px] leading-snug font-bold tracking-[-0.01em]">
                            {line.label}
                          </span>
                          <span
                            className={`text-[13px] leading-snug font-bold whitespace-nowrap tabular-nums ${
                              line.price ? "text-brand-900" : "text-brand-700/70"
                            }`}
                          >
                            {line.price ? (
                              <>
                                {line.addon && <span className="text-brand-800/40">+ </span>}
                                {line.price}
                              </>
                            ) : (
                              t("price.included")
                            )}
                          </span>
                        </span>

                        {line.note && (
                          <span className="text-brand-800/50 mt-0.5 block text-[11.5px] leading-snug">
                            {line.note}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </MoreLines>
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="border-brand-900/12 mt-6 flex flex-col gap-2.5 border-t pt-6">
        {departures.length > 0 && (
          <DatesDrawer
            label={t("price.seeDates")}
            title={t("price.datesTitle")}
            booking={booking}
          />
        )}

        <Link
          href="/custom-expeditions"
          className="group border-brand-900/20 text-brand-800 hover:border-brand-800 hover:bg-brand-800 hover:text-cream-100 flex h-12 items-center justify-center gap-2.5 rounded-full border text-[11px] font-bold tracking-[0.12em] uppercase transition-colors duration-300"
        >
          {t("price.custom")}
          <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      <p className="text-brand-800/40 mt-4 text-[10.5px] leading-[1.6]">{t("price.note")}</p>
    </div>
  );
}
