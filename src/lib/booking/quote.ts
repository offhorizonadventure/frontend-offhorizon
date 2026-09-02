import "server-only";

import type { ResolvedPrices } from "@/lib/departure-prices";

import type { Party, Quote, QuoteLine } from "./types";

export type PricedDeparture = {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  sold_out: boolean;
  kind: "motorbike" | "4x4";
  currency: string;
  /**
   * Filled by the query from the tour's list price and this date's discount.
   * The departure's own price columns are the old model and are not read here:
   * two answers to one question is how the wizard and the checkout came to
   * quote different totals.
   */
  prices: ResolvedPrices;
  seats: number | null;
  seats_taken: number;
  visibility?: "public" | "private";
  assigned_user_id?: string | null;
  vehicles: {
    id: string;
    name?: string | null;
    per_day_price: number | null;
    seats: number | null;
  }[];
};

const money = (value: number) => Math.round(value * 100) / 100;

export const durationDays = (departure: PricedDeparture) => {
  const start = new Date(`${departure.start_date}T00:00:00Z`).getTime();
  const end = new Date(`${departure.end_date}T00:00:00Z`).getTime();

  return Math.max(1, Math.round((end - start) / 86_400_000) + 1);
};

export function quoteBooking(departure: PricedDeparture, party: Party): Quote {
  const lines: QuoteLine[] = [];

  const add = (key: QuoteLine["key"], quantity: number, unit: number | null) => {
    if (!quantity || !unit || unit <= 0) return;
    lines.push({ key, quantity, unit, amount: money(quantity * unit) });
  };

  add("rider", party.riders, departure.prices.rider);
  add("pillion", party.pillions, departure.prices.pillion);
  add("protection", party.damageProtection, departure.prices.protection);
  add("room", party.singleRooms, departure.prices.room);

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
