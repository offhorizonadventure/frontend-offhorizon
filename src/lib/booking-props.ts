import { getMessages } from "next-intl/server";

import type { BookingLabels, BookingProps } from "@/components/tour/BookingWizard";
import type { Locale } from "@/i18n/config";
import { getConversion } from "@/lib/currency";
import type { Departure, FactKey, PriceGroup } from "@/lib/tour-types";

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
  from?: string;
}): Promise<BookingProps> {
  const { currency, rate } = await getConversion(locale, from);

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
    maxRiders: Number(groupSize.match(/\d+/)?.[0]) || 12,
    // `prices` above is the cheapest departure's, which is what the card
    // headline means by "from". Each departure carries its own as well, and
    // the wizard switches to those the moment a date is picked: the rider who
    // chooses June must be quoted June, not whatever date happens to be
    // cheapest that season.
    departures: departures.map(
      ({ id, start, end, soldOut, seats, kind, prices, list, vehicles }) => ({
        id,
        start,
        end,
        soldOut,
        seats,
        kind,
        prices,
        list,
        vehicles,
      }),
    ),
    labels: messages.tour.booking,
  };
}
