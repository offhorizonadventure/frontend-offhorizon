import "server-only";

/**
 * The currencies Razorpay will actually take money in.
 *
 * Taken from the provider's own supported list rather than guessed. This used
 * to be eleven entries, which meant a visitor in Nepal browsed in rupees and
 * was then asked to pay in dollars, and the same for Sri Lanka, Mongolia and
 * forty-five other countries. Razorpay takes all of those.
 *
 * Every one of these is a hundred-subunit currency, so toMinorUnits holds
 * for all of them. That is not luck: the provider's list excludes the
 * zero-decimal currencies such as the yen and the won, where multiplying by a
 * hundred would charge a customer a hundred times the price. If this list is
 * ever extended by hand, check that first.
 *
 * Anything not here, such as the Bhutanese ngultrum, falls back to dollars.
 */
const CHARGEABLE = [
  "AED",
  "ALL",
  "AMD",
  "ARS",
  "AUD",
  "AWG",
  "BBD",
  "BDT",
  "BMD",
  "BND",
  "BOB",
  "BSD",
  "BWP",
  "BZD",
  "CAD",
  "CHF",
  "CNY",
  "COP",
  "CRC",
  "CUP",
  "CZK",
  "DKK",
  "DOP",
  "DZD",
  "EGP",
  "ETB",
  "EUR",
  "FJD",
  "GBP",
  "GHS",
  "GIP",
  "GMD",
  "GTQ",
  "GYD",
  "HKD",
  "HNL",
  "HRK",
  "HTG",
  "HUF",
  "IDR",
  "ILS",
  "INR",
  "JMD",
  "KES",
  "KGS",
  "KHR",
  "KYD",
  "KZT",
  "LAK",
  "LKR",
  "LRD",
  "LSL",
  "MAD",
  "MDL",
  "MKD",
  "MMK",
  "MNT",
  "MOP",
  "MUR",
  "MVR",
  "MWK",
  "MXN",
  "MYR",
  "NAD",
  "NGN",
  "NIO",
  "NOK",
  "NPR",
  "NZD",
  "PEN",
  "PGK",
  "PHP",
  "PKR",
  "QAR",
  "RUB",
  "SAR",
  "SCR",
  "SEK",
  "SGD",
  "SLL",
  "SOS",
  "SSP",
  "SVC",
  "SZL",
  "THB",
  "TRY",
  "TTD",
  "TZS",
  "USD",
  "UYU",
  "UZS",
  "YER",
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
