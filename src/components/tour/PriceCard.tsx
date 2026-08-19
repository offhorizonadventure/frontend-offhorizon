import { getMessages, getTranslations } from "next-intl/server";

import type { BookingLabels } from "@/components/tour/BookingWizard";
import { DatesDrawer } from "@/components/tour/DatesDrawer";
import { ArrowRight, priceIcons } from "@/components/ui/icons";
import type { Departure, FactKey, PriceGroup } from "@/config/tour-pages";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { getConversion, getPrice } from "@/lib/currency";

/**
 * Price card in the hero.
 *
 * The headline figure is the only number set large; everything below it is a
 * supplement, marked with a plus so it reads as "on top of that" rather than
 * as a competing total. Anything costing nothing says so in words, because a
 * column of "$0" makes a page look broken rather than generous.
 *
 * The dates button opens a slide-over rather than expanding in place, so the
 * card keeps its height and the list has room of its own.
 */
export async function PriceCard({
  locale,
  pricing,
  tourName,
  facts,
  departures,
}: {
  locale: Locale;
  pricing: PriceGroup[];
  tourName: string;
  facts: { key: FactKey; value: string }[];
  departures: Departure[];
}) {
  const t = await getTranslations({ locale, namespace: "tour" });
  const { currency, rate } = await getConversion(locale);

  // `t.raw` is typed for leaf keys, and the wizard wants a whole subtree.
  const messages = (await getMessages({ locale })) as unknown as {
    tour: { booking: BookingLabels };
  };

  const groups = await Promise.all(
    pricing.map(async (group) => ({
      title: group.title,
      lines: await Promise.all(
        group.lines.map(async (line) => ({
          ...line,
          price: line.amount > 0 ? await getPrice(line.amount, locale) : null,
          Icon: priceIcons[line.icon],
        })),
      ),
    })),
  );

  const headline = groups[0]?.lines[0];

  // The wizard needs the unit prices as numbers so it can total them live.
  const unit = (icon: string) =>
    pricing.flatMap((group) => group.lines).find((line) => line.icon === icon)?.amount ?? 0;
  const fact = (key: FactKey) => facts.find((entry) => entry.key === key)?.value ?? "";
  const groupSize = fact("groupSize");

  const booking = {
    tourName,
    duration: fact("duration"),
    groupSize,
    prices: {
      rider: unit("rider"),
      pillion: unit("pillion"),
      insurance: unit("shield"),
      room: unit("singleRoom"),
    },
    currency,
    rate,
    locale,
    // "12 riders" and the like; fall back to a sane cap when it does not parse.
    maxRiders: Number(groupSize.match(/\d+/)?.[0]) || 12,
    departures: departures.map(({ start, end, soldOut, seats }) => ({ start, end, soldOut, seats })),
    labels: messages.tour.booking,
  };

  return (
    <div className="rounded-[26px] bg-cream-50/97 p-6 shadow-2xl shadow-brand-950/30 ring-1 ring-cream-100/20 backdrop-blur-md sm:p-7">
      {/* Headline price */}
      <p className="text-[9.5px] font-bold tracking-[0.18em] text-brand-800/50 uppercase">
        {t("price.from")}
      </p>
      <p className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="font-display text-[clamp(1.9rem,4vw,2.4rem)] leading-none font-extrabold tracking-[-0.035em] text-brand-900 tabular-nums">
          {headline?.price}
        </span>
        <span className="text-[12px] font-semibold text-brand-800/55">
          {t("price.perRider")}
        </span>
      </p>

      <div className="mt-6 space-y-6 border-t border-brand-900/12 pt-6">
        {groups.map((group) => (
          <div key={group.title}>
            <h3 className="text-[9.5px] font-bold tracking-[0.18em] text-brand-800/45 uppercase">
              {group.title}
            </h3>

            <ul className="mt-3 space-y-2.5">
              {group.lines.map((line) => (
                <li key={line.label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-900/6 text-brand-700">
                    <line.Icon />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                      <span className="font-display text-[14px] leading-snug font-bold tracking-[-0.01em] text-brand-900">
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
                      <span className="mt-0.5 block text-[11.5px] leading-snug text-brand-800/50">
                        {line.note}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-2.5 border-t border-brand-900/12 pt-6">
        <DatesDrawer
          label={t("price.seeDates")}
          title={t("price.datesTitle")}
          booking={booking}
        />

        <Link
          href="/custom-expeditions"
          className="group flex h-12 items-center justify-center gap-2.5 rounded-full border border-brand-900/20 text-[11px] font-bold tracking-[0.12em] text-brand-800 uppercase transition-colors duration-300 hover:border-brand-800 hover:bg-brand-800 hover:text-cream-100"
        >
          {t("price.custom")}
          <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>

      <p className="mt-4 text-[10.5px] leading-[1.6] text-brand-800/40">{t("price.note")}</p>
    </div>
  );
}
