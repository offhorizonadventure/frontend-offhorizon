import { cookies } from "next/headers";

import {
  COUNTRY_COOKIE,
  currencyFor,
  currencyForCountry,
  defaultCurrency,
  defaultLocale,
  type Currency,
  type Locale,
} from "@/i18n/config";

/** Exchange rates, from a feed with more than Europe in it. */
const ENDPOINT = "https://open.er-api.com/v6/latest";
const REVALIDATE = 60 * 60 * 12;

/**
 * The currency prices are written in.
 *
 * Not the same thing as `defaultCurrency`, which is what a visitor is quoted
 * when we cannot tell where they are. The office prices in rupees; an American
 * still sees dollars. Tying the two together is what made a 45,000 rupee
 * expedition convert as though it were 45,000 dollars.
 */
export const baseCurrency: Currency = "INR";

/** The currency to quote a visitor in. */
export async function currencyForVisitor(locale: Locale): Promise<Currency> {
  if (locale !== defaultLocale) return currencyFor(locale);

  try {
    const country = (await cookies()).get(COUNTRY_COOKIE)?.value;
    return currencyForCountry(country);
  } catch {
    // Called from somewhere with no request behind it, such as a statically generated page.
    return defaultCurrency;
  }
}

export async function getRate(from: Currency, to: Currency): Promise<number> {
  if (from === to) return 1;

  // Cached for half a day and shared, so twenty prices on a page cost one request.
  const response = await fetch(`${ENDPOINT}/${from}`, {
    next: { revalidate: REVALIDATE, tags: ["fx"] },
  });

  if (!response.ok) throw new Error(`Rates ${from}->${to}: ${response.status}`);

  const { rates } = (await response.json()) as { rates?: Record<string, number> };
  const rate = rates?.[to];

  if (!Number.isFinite(rate)) throw new Error(`Rates ${from}->${to}: missing rate`);
  return rate as number;
}

/**
 * How many decimal places an amount deserves.
 *
 * A tour costs thousands, and "$2,850.00" is noise, so whole units are right
 * almost always. But rounding to whole units turns anything under half a unit
 * into a zero, and a checkout that says the total is $0 is worse than one that
 * says nothing: it is wrong, and the visitor cannot tell whether the site is
 * broken or the trip is free.
 *
 * So below a hundred units the decimals come back. Real prices are unaffected.
 */
const placesFor = (amount: number) => (Math.abs(amount) < 100 ? 2 : 0);

export function formatMoney(amount: number, currency: Currency, locale: Locale) {
  const places = placesFor(amount);

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: places,
    maximumFractionDigits: places,
  }).format(amount);
}

/** Converts a base-currency amount into the visitor's currency and formats it. */
export async function getPrice(amount: number, locale: Locale, from?: string) {
  // `from` is the currency the price was authored in, carried on the departure row.
  const source = (from?.toUpperCase() as Currency) ?? baseCurrency;
  const target = await currencyForVisitor(locale);

  try {
    const rate = await getRate(source, target);
    return formatMoney(Math.round(amount * rate), target, locale);
  } catch {
    return formatMoney(amount, source, locale);
  }
}

/**
 * Currency and rate for totals that have to be recalculated in the browser.
 *
 * `from` is the currency the amounts were written in, which is carried on the
 * departure row. It used to be assumed, and an expedition priced in rupees was
 * multiplied by the dollar rate and quoted at ninety times its price.
 */
export async function getConversion(
  locale: Locale,
  from: string = baseCurrency,
): Promise<{ currency: Currency; rate: number }> {
  const source = (from.toUpperCase() as Currency) || baseCurrency;
  const target = await currencyForVisitor(locale);

  if (source === target) return { currency: target, rate: 1 };

  try {
    return { currency: target, rate: await getRate(source, target) };
  } catch {
    return { currency: source, rate: 1 };
  }
}
