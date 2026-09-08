export type BookingPlan = "full" | "deposit";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

/**
 * What holds a place when an expedition does not say otherwise.
 *
 * A departure may carry its own `deposit_percent`, set by the office. This is
 * the house rule for every one that does not, which is most of them.
 */
export const DEPOSIT_SHARE = 0.2;

/**
 * The share of the total this expedition asks for to hold a place.
 *
 * Anything outside one and a hundred is somebody's typo or a stale row, and a
 * deposit of nothing would hold places for free.
 */
export const depositShare = (percent: number | null | undefined) =>
  typeof percent === "number" && percent >= 1 && percent <= 100 ? percent / 100 : DEPOSIT_SHARE;

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
  currency: string;
  lines: QuoteLine[];
  total: number;
};
