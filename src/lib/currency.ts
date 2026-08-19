import { currencyFor, defaultCurrency, type Currency, type Locale } from "@/i18n/config";

const ENDPOINT = "https://api.frankfurter.dev/v1/latest";
const REVALIDATE = 60 * 60 * 12; // ECB publishes once per working day.

/** Currency prices are authored in. */
export const baseCurrency = defaultCurrency;

export async function getRate(from: Currency, to: Currency): Promise<number> {
  if (from === to) return 1;

  const response = await fetch(`${ENDPOINT}?base=${from}&symbols=${to}`, {
    next: { revalidate: REVALIDATE, tags: ["fx"] },
  });

  if (!response.ok) throw new Error(`Frankfurter ${from}->${to}: ${response.status}`);

  const { rates } = (await response.json()) as { rates: Record<string, number> };
  const rate = rates?.[to];

  if (!Number.isFinite(rate)) throw new Error(`Frankfurter ${from}->${to}: missing rate`);
  return rate;
}

export function formatMoney(amount: number, currency: Currency, locale: Locale) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Converts a base-currency amount into the visitor's currency and formats it.
 * Falls back to the base currency if the rate lookup fails, so a price is
 * never rendered wrong or missing.
 */
export async function getPrice(amount: number, locale: Locale, from?: string) {
  // `from` is the currency the price was authored in, which a departure carries
  // on its row: an expedition quoted in euros must not be read as dollars.
  const source = (from?.toUpperCase() as Currency) ?? baseCurrency;
  const target = currencyFor(locale);

  try {
    const rate = await getRate(source, target);
    return formatMoney(Math.round(amount * rate), target, locale);
  } catch {
    return formatMoney(amount, source, locale);
  }
}

/**
 * Currency and rate for totals that have to be recalculated in the browser.
 * Falls back to the base currency so a running total is never wrong or blank.
 */
export async function getConversion(locale: Locale): Promise<{ currency: Currency; rate: number }> {
  const target = currencyFor(locale);

  try {
    return { currency: target, rate: await getRate(baseCurrency, target) };
  } catch {
    return { currency: baseCurrency, rate: 1 };
  }
}
