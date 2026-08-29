export type BookingPlan = "full" | "deposit";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export const DEPOSIT_SHARE = 0.2;

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
