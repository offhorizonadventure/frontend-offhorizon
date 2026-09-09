import "server-only";

import type { Locale } from "@/i18n/config";
import { currencyForVisitor, formatMoney, getRate } from "@/lib/currency";
import { resolvePrices, TOUR_PRICE_COLUMNS, type TourPrices } from "@/lib/departure-prices";
import { createClient } from "@/lib/supabase/server";

import { chargeCurrencyFor } from "./currency";
import { quoteBooking, type PricedDeparture } from "./quote";
import { allowsLateDeposit, balanceDueOn, cancelsAutomatically } from "./deadline";
import { BALANCE_DUE_DAYS, depositShare, type Party } from "./types";

const COLUMNS = `
  id, tour_id, start_date, end_date, status, sold_out, kind, currency,
  visibility, assigned_user_id,
  rider_discount, pillion_discount, deposit_percent,
  rider_price, pillion_price, damage_protection_price, single_room_price,
  seats, seats_taken,
  tour:tours(title, slug, country, ${TOUR_PRICE_COLUMNS}),
  vehicles:departure_vehicles(vehicle:vehicles(id, name, per_day_price, seats))
`;

const whole = (value: unknown, max: number) => {
  const parsed = Number(String(value ?? "0"));
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= max ? parsed : 0;
};

const money = (value: number) => Math.round(value * 100) / 100;

export async function priceBooking(
  locale: Locale,
  departureId: string,
  query: Record<string, string | string[] | undefined>,
) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("departures")
    .select(COLUMNS)
    .eq("id", departureId)
    .eq("status", "published")
    .maybeSingle();

  if (!data) return null;

  const sale = data as { start_date: string; visibility?: string };

  if (sale.visibility !== "private" && sale.start_date < new Date().toISOString().slice(0, 10)) {
    return null;
  }

  type Named = { id: string; name: string; per_day_price: number | null; seats: number | null };

  const row = data as unknown as Omit<PricedDeparture, "vehicles" | "prices"> & {
    tour: { title: string; slug: string; country: string | null } & TourPrices;
    rider_discount: number | null;
    deposit_percent: number | null;
    pillion_discount: number | null;
    vehicles: { vehicle: Named }[];
  };

  const cars = (row.vehicles ?? []).map((entry) => entry.vehicle).filter(Boolean);

  const departure: PricedDeparture & { vehicles: Named[] } = {
    ...row,
    // The same resolution the wizard used, so the summary on this page shows
    // the total the rider was quoted rather than a second opinion.
    prices: resolvePrices(row.tour, row),
    vehicles: cars,
  };

  const party: Party = {
    riders: Math.max(1, whole(query.riders, 20)),
    pillions: whole(query.pillions, 20),
    singleRooms: whole(query.rooms, 40),
    damageProtection: whole(query.protection, 40),
    vehicleId: typeof query.vehicle === "string" ? query.vehicle : null,
    ownVehicle: query.own === "1",
  };

  const quote = quoteBooking(departure, party);
  if (quote.total <= 0) return null;

  const currency = chargeCurrencyFor(await currencyForVisitor(locale));
  const rate = await getRate(quote.currency as never, currency as never);

  const total = money(quote.total * rate);
  // The share this expedition asks for, not a constant. The office sets it per
  // date; a blank one falls back to the house rule.
  const share = depositShare(departure.deposit_percent);
  const deposit = money(total * share);

  const late = allowsLateDeposit(row.tour.country);
  // The country matters here as much as it does on the server. Without it the
  // page would quote a deadline that had already passed while the booking it
  // creates carries the right one.
  const due = balanceDueOn(departure.start_date, row.tour.country);
  const format = (amount: number) => formatMoney(amount, currency as never, locale);

  const dates = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatRange(
    new Date(`${departure.start_date}T00:00:00Z`),
    new Date(`${departure.end_date}T00:00:00Z`),
  );

  const vehicle = cars.find((entry) => entry.id === party.vehicleId);

  const startsIn = Math.floor(
    (new Date(`${departure.start_date}T00:00:00Z`).getTime() - Date.now()) / 86_400_000,
  );

  return {
    kind: departure.kind,
    // An Indian expedition takes a deposit however close the date is; anywhere
    // else the old fortnight still applies. Either way a hundred percent
    // expedition has no deposit to offer.
    depositAllowed: (late || startsIn > BALANCE_DUE_DAYS) && share < 1,
    /** The day the balance falls due on a booking made now. */
    balanceDueOn: due,
    /** False when nothing will be cancelled for missing it, so nobody says it will. */
    cancelled: cancelsAutomatically(due, departure.start_date),
    /** Set when the expedition itself asks for the whole amount, rather than
        when the departure is simply too close to take a deposit. The two want
        different sentences. */
    paidInFull: share >= 1,
    /** Whole percent, for the wording on the button. */
    depositPercent: Math.round(share * 100),
    tourTitle: row.tour.title,
    tourSlug: row.tour.slug,
    dates,
    party,
    vehicleName: party.ownVehicle ? null : (vehicle?.name ?? null),
    currency,
    lines: quote.lines.map((line) => ({ ...line, label: format(money(line.amount * rate)) })),
    total,
    deposit,
    totalLabel: format(total),
    depositLabel: format(deposit),
    hidden: {
      departureId: departure.id,
      riders: String(party.riders),
      pillions: String(party.pillions),
      singleRooms: String(party.singleRooms),
      damageProtection: String(party.damageProtection),
      vehicleId: party.vehicleId ?? "",
      ownVehicle: party.ownVehicle ? "on" : "",
    },
  };
}

export type PricedBooking = NonNullable<Awaited<ReturnType<typeof priceBooking>>>;
