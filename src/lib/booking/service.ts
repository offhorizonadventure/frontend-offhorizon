import "server-only";

import { randomBytes } from "node:crypto";

import type { Currency } from "@/i18n/config";
import { getRate } from "@/lib/currency";
import { resolvePrices, TOUR_PRICE_COLUMNS, type TourPrices } from "@/lib/departure-prices";
import { createAdminClient } from "@/lib/supabase/admin";

import { chargeCurrencyFor } from "./currency";
import { startPayment, type PaymentFailure, type PaymentStarted } from "./payment";
import { quoteBooking, type PricedDeparture } from "./quote";

import { allowsLateDeposit, balanceDueOn } from "./deadline";
import { BALANCE_DUE_DAYS, depositShare, type BookingPlan, type Party } from "./types";

const DEPARTURE_COLUMNS = `
  id, tour_id, start_date, end_date, status, sold_out, kind, currency,
  visibility, assigned_user_id,
  rider_discount, pillion_discount, deposit_percent,
  rider_price, pillion_price, damage_protection_price, single_room_price,
  seats, seats_taken,
  tour:tours(country, ${TOUR_PRICE_COLUMNS}),
  vehicles:departure_vehicles(vehicle:vehicles(id, name, per_day_price, seats))
`;

const ALPHABET = "0123456789BCDFGHJKLMNPQRSTVWXZ";

const reference = () =>
  `OH-${Array.from(randomBytes(6), (byte) => ALPHABET[byte % ALPHABET.length]).join("")}`;

const money = (value: number) => Math.round(value * 100) / 100;

/**
 * What each line is called on the booking. The office panel writes the same
 * words for a booking taken over the phone, so the two read alike.
 */
function labelFor(key: string, departure: PricedDeparture, party: Party): string {
  if (key === "rider") return departure.kind === "4x4" ? "Person" : "Rider";
  if (key === "pillion") return "Pillion";
  if (key === "protection") return "Damage protection";
  if (key === "room") return "Single room";

  const vehicle = departure.vehicles.find((entry) => entry.id === party.vehicleId);

  return vehicle?.name ?? "Vehicle";
}

/**
 * Every column the site must fill in when it writes a booking.
 *
 * The client is not generated from the database, so an object literal handed to
 * insert() is checked against nothing: a field left out compiles happily and is
 * only found later, in the panel, as a booking that looks like it cost nothing.
 * That is how `lines` came to be missing. Naming the row here means dropping one
 * fails the build instead.
 */
type NewBooking = {
  reference: string;
  departure_id: string;
  tour_id: string;
  lead_user_id: string;
  lead_country: string;
  plan: BookingPlan;
  status: "pending";
  riders: number;
  pillions: number;
  single_rooms: number;
  damage_protection: number;
  vehicle_id: string | null;
  own_vehicle: boolean;
  currency: string;
  /** The priced breakdown, in the currency being charged. */
  lines: BookingLine[];
  fx_rate: number;
  base_currency: string;
  base_total: number;
  total_amount: number;
  deposit_amount: number;
  balance_due_on: string;
};

type BookingLine = {
  key: string;
  label: string;
  quantity: number;
  unit: number;
  amount: number;
};

async function readDeparture(departureId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("departures")
    .select(DEPARTURE_COLUMNS)
    .eq("id", departureId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as Omit<PricedDeparture, "vehicles" | "prices"> & {
    tour_id: string;
    tour: (TourPrices & { country: string | null }) | null;
    rider_discount: number | null;
    deposit_percent: number | null;
    pillion_discount: number | null;
    vehicles: {
      vehicle: {
        id: string;
        name: string | null;
        per_day_price: number | null;
        seats: number | null;
      };
    }[];
  };

  return {
    ...row,
    // The one place the money that is actually charged is decided, so it can
    // never disagree with what the wizard quoted.
    prices: resolvePrices(row.tour, row),
    // Read here so the deadline rule never has to reach back for the tour.
    tourCountry: row.tour?.country ?? null,
    vehicles: (row.vehicles ?? []).map((entry) => entry.vehicle).filter(Boolean),
  } as PricedDeparture & { tour_id: string; tourCountry: string | null };
}

export async function startBooking(input: {
  userId: string;
  departureId: string;
  plan: BookingPlan;
  party: Party;
  preferredCurrency: string;
  lead: { fullName: string; email: string; phone: string; country: string };
}): Promise<PaymentStarted | PaymentFailure> {
  const departure = await readDeparture(input.departureId);
  if (!departure) return { ok: false, error: "That departure could not be found." };

  if (departure.status !== "published" || departure.sold_out) {
    return { ok: false, error: "That departure is not open for booking." };
  }

  if (departure.visibility === "private" && departure.assigned_user_id !== input.userId) {
    return { ok: false, error: "That expedition was built for somebody else." };
  }

  const startsIn = Math.floor(
    (new Date(`${departure.start_date}T00:00:00Z`).getTime() - Date.now()) / 86_400_000,
  );

  if (startsIn < 0) {
    return { ok: false, error: "That departure has already left." };
  }

  const late = allowsLateDeposit(departure.tourCountry);

  // Checked here as well as in the checkout, because the checkout is a screen
  // and this is the thing that writes the row.
  if (input.plan === "deposit" && startsIn <= BALANCE_DUE_DAYS && !late) {
    return {
      ok: false,
      error: `This departure is inside ${BALANCE_DUE_DAYS} days, so it has to be paid in full.`,
    };
  }

  const seatsLeft =
    departure.seats === null ? null : Math.max(0, departure.seats - departure.seats_taken);

  if (seatsLeft !== null && input.party.riders > seatsLeft) {
    return {
      ok: false,
      error:
        seatsLeft === 0
          ? "That departure is full."
          : `Only ${seatsLeft} place${seatsLeft === 1 ? "" : "s"} left on that departure.`,
    };
  }

  const quote = quoteBooking(departure, input.party);
  if (quote.total <= 0) return { ok: false, error: "That departure has no price on it yet." };

  const vehicleId =
    departure.kind === "4x4" && !input.party.ownVehicle
      ? (departure.vehicles.find((entry) => entry.id === input.party.vehicleId)?.id ?? null)
      : null;

  if (departure.kind === "4x4" && !input.party.ownVehicle && input.party.vehicleId && !vehicleId) {
    return { ok: false, error: "That vehicle is not on this departure." };
  }

  const currency = chargeCurrencyFor(input.preferredCurrency);
  const rate = await getRate(quote.currency as Currency, currency as Currency);

  // The same priced lines the office would have written by hand, in the
  // currency being charged. Without these a booking made on the site reads as
  // worth nothing in the admin panel, which is a frightening thing to see next
  // to a payment that has already been taken.
  const lines = quote.lines.map((line) => ({
    key: line.key,
    label: labelFor(line.key, departure, input.party),
    quantity: line.quantity,
    unit: money(line.unit * rate),
    amount: money(line.quantity * money(line.unit * rate)),
  }));

  // Totalled from the lines rather than converted separately, so the sum shown
  // and the sum charged cannot drift apart by a rounded rupee.
  const total = money(lines.reduce((sum, line) => sum + line.amount, 0));
  const deposit =
    input.plan === "full" ? total : money(total * depositShare(departure.deposit_percent));

  const supabase = createAdminClient();

  const row: NewBooking = {
    reference: reference(),
    departure_id: departure.id,
    tour_id: departure.tour_id,
    lead_user_id: input.userId,
    // Where the money is coming from, which is the office's question to answer
    // and not the rider's home address. Two letters, ISO 3166-1.
    lead_country: input.lead.country,
    plan: input.plan,
    status: "pending",
    riders: input.party.riders,
    pillions: input.party.pillions,
    single_rooms: input.party.singleRooms,
    damage_protection: input.party.damageProtection,
    vehicle_id: vehicleId,
    own_vehicle: input.party.ownVehicle,
    currency,
    lines,
    fx_rate: rate,
    base_currency: quote.currency,
    base_total: quote.total,
    total_amount: total,
    deposit_amount: deposit,
    balance_due_on: balanceDueOn(departure.start_date, departure.tourCountry),
  };

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert(row)
    .select("id, reference")
    .single();

  if (error || !booking) {
    return { ok: false, error: "The booking could not be created. Nothing has been charged." };
  }

  const { error: seatError } = await supabase
    .from("booking_travellers")
    .insert(seats(booking.id, input, lines));

  if (seatError) {
    await supabase.from("bookings").delete().eq("id", booking.id);

    return { ok: false, error: "The booking could not be created. Nothing has been charged." };
  }

  return startPayment({
    bookingId: booking.id,
    reference: booking.reference,
    amount: input.plan === "full" ? total : deposit,
    currency,
    kind: input.plan === "full" ? "full" : "deposit",
  });
}

/**
 * One row per person, with the extras written against whoever gets them.
 *
 * The wizard asks how many single rooms and how much cover the party wants, not
 * which of them takes what, because at the time of booking half the names are
 * still blank. The counts are handed out here in a fixed order, riders first
 * and then pillions, so a booking always comes out the same way and the room a
 * booking is charged for always belongs to somebody.
 *
 * Protection covers a machine and a pillion does not ride one, which is the
 * same rule the wizard uses to cap the number.
 */
function seats(
  bookingId: string,
  input: {
    userId: string;
    party: Party;
    lead: { fullName: string; email: string; phone: string; country: string };
  },
  lines: { key: string; unit: number; amount: number }[],
) {
  const { riders, pillions, singleRooms, damageProtection } = input.party;

  // Riders take the first rooms, then pillions. Everybody who rides is eligible
  // for cover; nobody who does not, is.
  const roomsForRiders = Math.min(riders, singleRooms);
  const roomsForPillions = Math.max(0, Math.min(pillions, singleRooms - roomsForRiders));
  const covered = Math.min(riders, damageProtection);

  // What each of them owes, in the currency being charged.
  //
  // A custom expedition is settled by the people on it rather than by whoever
  // pressed the button, so everybody carries their own figure from the moment
  // the booking exists. On a scheduled tour nothing reads these yet and the
  // lead still pays the lot, but they are written all the same: a column that
  // is only filled in sometimes is a column nobody can trust.
  const unit = (key: string) => lines.find((line) => line.key === key)?.unit ?? 0;
  const heads = riders + pillions;

  // A car is one car. Split in whole paise so the parts add back to the whole,
  // with the odd unit going to the earliest place.
  const carPaise = Math.round(
    lines.filter((line) => line.key === "vehicle").reduce((sum, line) => sum + line.amount, 0) * 100,
  );
  const eachPaise = heads > 0 ? Math.floor(carPaise / heads) : 0;
  const overPaise = carPaise - eachPaise * heads;

  // Riders come first in this order, then pillions, which is the order the rows
  // are built in below.
  const carShare = (rank: number) => (eachPaise + (rank < overPaise ? 1 : 0)) / 100;

  const round = (value: number) => Math.round(value * 100) / 100;

  const rider = (position: number) => ({
    booking_id: bookingId,
    role: "rider",
    position,
    is_lead: false,
    wants_room: position < roomsForRiders,
    wants_protection: position < covered,
    amount: round(
      unit("rider") +
        (position < roomsForRiders ? unit("room") : 0) +
        (position < covered ? unit("protection") : 0) +
        carShare(position),
    ),
  });

  return [
    {
      ...rider(0),
      user_id: input.userId,
      is_lead: true,
      full_name: input.lead.fullName,
      email: input.lead.email,
      phone: input.lead.phone,
    },
    ...Array.from({ length: riders - 1 }, (_, index) => ({
      ...rider(index + 1),
      invite_token: randomBytes(24).toString("base64url"),
    })),
    ...Array.from({ length: pillions }, (_, index) => ({
      booking_id: bookingId,
      role: "pillion",
      position: index,
      is_lead: false,
      wants_room: index < roomsForPillions,
      wants_protection: false,
      amount: round(
        unit("pillion") +
          (index < roomsForPillions ? unit("room") : 0) +
          carShare(riders + index),
      ),
    })),
  ];
}
