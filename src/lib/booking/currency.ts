import "server-only";

/** The currency a rider is actually charged in. */
const CHARGEABLE = [
  "INR",
  "USD",
  "EUR",
  "GBP",
  "AUD",
  "CAD",
  "SGD",
  "AED",
  "NZD",
  "CHF",
  "ZAR",
] as const;

export type ChargeCurrency = (typeof CHARGEABLE)[number];

export const FALLBACK_CURRENCY: ChargeCurrency = "USD";

export function chargeCurrencyFor(preferred: string): ChargeCurrency {
  const upper = preferred.toUpperCase() as ChargeCurrency;
  return CHARGEABLE.includes(upper) ? upper : FALLBACK_CURRENCY;
}

/** Razorpay counts in paise, cents and the like. */
export const toMinorUnits = (amount: number) => Math.round(amount * 100);

export const fromMinorUnits = (amount: number) => Math.round(amount) / 100;
