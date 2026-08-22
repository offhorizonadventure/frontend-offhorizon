/** What a booking is worth, and who is on it. */

export type BookingPlan = "full" | "deposit";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

/** The share of the total that confirms a seat. */
export const DEPOSIT_SHARE = 0.2;

/** Nothing may be outstanding inside this many days of the start. */
export const BALANCE_DUE_DAYS = 14;

export type Party = {
  riders: number;
  pillions: number;
  singleRooms: number;
  damageProtection: number;
  vehicleId: string | null;
  ownVehicle: boolean;
};

export type QuoteLine = {
  key: "rider" | "pillion" | "protection" | "room" | "vehicle";
  quantity: number;
  unit: number;
  amount: number;
};

export type Quote = {
  /** The currency the departure was priced in, before conversion. */
  currency: string;
  lines: QuoteLine[];
  total: number;
};
