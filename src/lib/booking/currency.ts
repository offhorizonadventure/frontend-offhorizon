import "server-only";

/**
 * The currency a rider is actually charged in.
 *
 * Prices are shown in the visitor's own currency everywhere on the site. The
 * charge follows that where Razorpay can take it, and falls back to US dollars
 * where it cannot, which is also what the catalogue is priced in.
 *
 * Only two decimal currencies are listed. Razorpay wants the amount in the
 * smallest unit, and a currency with no minor unit (JPY) or three of them (KWD)
 * turns that arithmetic into a rounding bug on a six figure booking.
 */
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
