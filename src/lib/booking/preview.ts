import "server-only";

import type { Locale } from "@/i18n/config";
import { currencyForVisitor, formatMoney, getRate } from "@/lib/currency";
import { createClient } from "@/lib/supabase/server";


import { chargeCurrencyFor } from "./currency";
import { quoteBooking, type PricedDeparture } from "./quote";
import { BALANCE_DUE_DAYS, DEPOSIT_SHARE, type Party } from "./types";

const COLUMNS = `
  id, tour_id, start_date, end_date, status, sold_out, kind, currency,
  visibility, assigned_user_id,
  rider_price, pillion_price, damage_protection_price, single_room_price,
  seats, seats_taken,
  tour:tours(title, slug),
  vehicles:departure_vehicles(vehicle:vehicles(id, name, per_day_price, seats))
`;

const whole = (value: unknown, max: number) => {
  const parsed = Number(String(value ?? "0"));
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= max ? parsed : 0;
};

const money = (value: number) => Math.round(value * 100) / 100;

/** The same sum the checkout will charge, for the screen the rider reads first. */
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

  // A departure that has already left cannot be booked. Being close to the
  // start no longer takes it off sale: what stops a booking is having no
  // places left, and that is decided per departure.
  const sale = data as { start_date: string; visibility?: string };

  if (sale.visibility !== "private" && sale.start_date < new Date().toISOString().slice(0, 10)) {
    return null;
  }

  type Named = { id: string; name: string; per_day_price: number | null; seats: number | null };

  const row = data as unknown as Omit<PricedDeparture, "vehicles"> & {
    tour: { title: string; slug: string };
    vehicles: { vehicle: Named }[];
  };

  const cars = (row.vehicles ?? []).map((entry) => entry.vehicle).filter(Boolean);
  const departure: PricedDeparture & { vehicles: Named[] } = { ...row, vehicles: cars };

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
  const deposit = money(total * DEPOSIT_SHARE);
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
    /** Inside the balance window there is nothing to spread, so it is pay in full. */
    depositAllowed: startsIn > BALANCE_DUE_DAYS,
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
    /** Passed straight back to the action, which prices it again from the row. */
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
