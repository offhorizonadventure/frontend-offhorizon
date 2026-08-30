import "server-only";

import { randomBytes } from "node:crypto";

import type { Currency } from "@/i18n/config";
import { getRate } from "@/lib/currency";
import { createAdminClient } from "@/lib/supabase/admin";

import { chargeCurrencyFor } from "./currency";
import { startPayment, type PaymentFailure, type PaymentStarted } from "./payment";
import { quoteBooking, type PricedDeparture } from "./quote";

import { BALANCE_DUE_DAYS, DEPOSIT_SHARE, type BookingPlan, type Party } from "./types";

const DEPARTURE_COLUMNS = `
  id, tour_id, start_date, end_date, status, sold_out, kind, currency,
  visibility, assigned_user_id,
  rider_price, pillion_price, damage_protection_price, single_room_price,
  seats, seats_taken,
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

const daysBefore = (date: string, days: number) => {
  const at = new Date(`${date}T00:00:00Z`);
  at.setUTCDate(at.getUTCDate() - days);

  return at.toISOString().slice(0, 10);
};

async function readDeparture(departureId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("departures")
    .select(DEPARTURE_COLUMNS)
    .eq("id", departureId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as Omit<PricedDeparture, "vehicles"> & {
    tour_id: string;
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
    vehicles: (row.vehicles ?? []).map((entry) => entry.vehicle).filter(Boolean),
  } as PricedDeparture & { tour_id: string };
}

export async function startBooking(input: {
  userId: string;
  departureId: string;
  plan: BookingPlan;
  party: Party;
  preferredCurrency: string;
  lead: { fullName: string; email: string; phone: string };
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

  if (input.plan === "deposit" && startsIn <= BALANCE_DUE_DAYS) {
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
  const deposit = input.plan === "full" ? total : money(total * DEPOSIT_SHARE);

  const supabase = createAdminClient();

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      reference: reference(),
      departure_id: departure.id,
      tour_id: departure.tour_id,
      lead_user_id: input.userId,
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
      balance_due_on: daysBefore(departure.start_date, BALANCE_DUE_DAYS),
    })
    .select("id, reference")
    .single();

  if (error || !booking) {
    return { ok: false, error: "The booking could not be created. Nothing has been charged." };
  }

  const { error: seatError } = await supabase
    .from("booking_travellers")
    .insert(seats(booking.id, input));

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

function seats(
  bookingId: string,
  input: { userId: string; party: Party; lead: { fullName: string; email: string; phone: string } },
) {
  return [
    {
      booking_id: bookingId,
      role: "rider",
      position: 0,
      user_id: input.userId,
      is_lead: true,
      full_name: input.lead.fullName,
      email: input.lead.email,
      phone: input.lead.phone,
    },
    ...Array.from({ length: input.party.riders - 1 }, (_, index) => ({
      booking_id: bookingId,
      role: "rider",
      position: index + 1,
      is_lead: false,
      invite_token: randomBytes(24).toString("base64url"),
    })),
    ...Array.from({ length: input.party.pillions }, (_, index) => ({
      booking_id: bookingId,
      role: "pillion",
      position: index,
      is_lead: false,
    })),
  ];
}
