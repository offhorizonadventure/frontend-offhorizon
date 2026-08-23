import "server-only";

import type { Party, Quote, QuoteLine } from "./types";

/** A departure as the pricing needs it, read from the database. */
export type PricedDeparture = {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  sold_out: boolean;
  kind: "motorbike" | "4x4";
  currency: string;
  rider_price: number | null;
  pillion_price: number | null;
  damage_protection_price: number | null;
  single_room_price: number | null;
  seats: number | null;
  seats_taken: number;
  visibility?: "public" | "private";
  assigned_user_id?: string | null;
  vehicles: { id: string; per_day_price: number | null; seats: number | null }[];
};

const money = (value: number) => Math.round(value * 100) / 100;

/** Nights on the road, which is what a car is charged by. */
export const durationDays = (departure: PricedDeparture) => {
  const start = new Date(`${departure.start_date}T00:00:00Z`).getTime();
  const end = new Date(`${departure.end_date}T00:00:00Z`).getTime();

  return Math.max(1, Math.round((end - start) / 86_400_000) + 1);
};

/** What a party costs, computed from the departure row. */
export function quoteBooking(departure: PricedDeparture, party: Party): Quote {
  const lines: QuoteLine[] = [];

  const add = (key: QuoteLine["key"], quantity: number, unit: number | null) => {
    if (!quantity || !unit || unit <= 0) return;
    lines.push({ key, quantity, unit, amount: money(quantity * unit) });
  };

  add("rider", party.riders, departure.rider_price);
  add("pillion", party.pillions, departure.pillion_price);
  add("protection", party.damageProtection, departure.damage_protection_price);
  add("room", party.singleRooms, departure.single_room_price);

  // A car is priced per day and is only charged when it is ours.
  if (departure.kind === "4x4" && party.vehicleId && !party.ownVehicle) {
    const vehicle = departure.vehicles.find((entry) => entry.id === party.vehicleId);
    const perDay = vehicle?.per_day_price ?? null;
    if (perDay) add("vehicle", durationDays(departure), perDay);
  }

  return {
    currency: departure.currency,
    lines,
    total: money(lines.reduce((sum, line) => sum + line.amount, 0)),
  };
}
