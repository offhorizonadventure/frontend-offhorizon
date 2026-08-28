import { getMessages } from "next-intl/server";

import type { BookingLabels, BookingProps } from "@/components/tour/BookingWizard";
import type { Locale } from "@/i18n/config";
import { getConversion } from "@/lib/currency";
import type { Departure, FactKey, PriceGroup } from "@/lib/tour-types";

/** What the booking wizard needs. The price card and the tour bar both open it. */
export async function buildBooking({
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
  /** The currency the prices were written in, from the departure row. */
  from?: string;
}): Promise<BookingProps> {
  const { currency, rate } = await getConversion(locale, from);

  // `t.raw` is typed for leaf keys; the wizard wants a subtree.
  const messages = (await getMessages({ locale })) as unknown as {
    tour: { booking: BookingLabels };
  };

  const unit = (icon: string) =>
    pricing.flatMap((group) => group.lines).find((line) => line.icon === icon)?.amount ?? 0;
  const fact = (key: FactKey) => facts.find((entry) => entry.key === key)?.value ?? "";
  const groupSize = fact("groupSize");

  return {
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
    departures: departures.map(({ id, start, end, soldOut, seats, kind, vehicles }) => ({
      id,
      start,
      end,
      soldOut,
      seats,
      kind,
      vehicles,
    })),
    labels: messages.tour.booking,
  };
}
