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
  vehicles:departure_vehicles(vehicle:vehicles(id, per_day_price, seats))
`;

/** No vowels, so a reference cannot spell anything. */
const ALPHABET = "0123456789BCDFGHJKLMNPQRSTVWXZ";

const reference = () =>
  `OH-${Array.from(randomBytes(6), (byte) => ALPHABET[byte % ALPHABET.length]).join("")}`;

const money = (value: number) => Math.round(value * 100) / 100;

const daysBefore = (date: string, days: number) => {
  const at = new Date(`${date}T00:00:00Z`);
  at.setUTCDate(at.getUTCDate() - days);

  return at.toISOString().slice(0, 10);
};

/** The departure with its cars flattened onto it. */
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
    vehicles: { vehicle: { id: string; per_day_price: number | null; seats: number | null } }[];
  };

  return {
    ...row,
    vehicles: (row.vehicles ?? []).map((entry) => entry.vehicle).filter(Boolean),
  } as PricedDeparture & { tour_id: string };
}

/** Creates a booking and its first payment. Prices come from the departure row, never the caller. */
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

  // A custom expedition is sold to one rider. Everyone else on their booking
  // joins through the invite link, which does not go through here.
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

  // The quote silently ignores a car that is not on this departure. Storing
  // the id anyway would put a machine on the booking that nobody paid for, so
  // only a car that was actually priced is kept.
  const vehicleId =
    departure.kind === "4x4" && !input.party.ownVehicle
      ? (departure.vehicles.find((entry) => entry.id === input.party.vehicleId)?.id ?? null)
      : null;

  if (departure.kind === "4x4" && !input.party.ownVehicle && input.party.vehicleId && !vehicleId) {
    return { ok: false, error: "That vehicle is not on this departure." };
  }

  const currency = chargeCurrencyFor(input.preferredCurrency);
  const rate = await getRate(quote.currency as Currency, currency as Currency);

  const total = money(quote.total * rate);
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

  await supabase.from("booking_travellers").insert(seats(booking.id, input));

  return startPayment({
    bookingId: booking.id,
    reference: booking.reference,
    amount: input.plan === "full" ? total : deposit,
    currency,
    kind: input.plan === "full" ? "full" : "deposit",
  });
}

/** A row for everyone on the booking: the lead, the invited riders, the pillions. */
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
