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

const ENDPOINT = "https://open.er-api.com/v6/latest";
const REVALIDATE = 60 * 60 * 12;

export const baseCurrency: Currency = "INR";

export async function currencyForVisitor(locale: Locale): Promise<Currency> {
  if (locale !== defaultLocale) return currencyFor(locale);

  try {
    const country = (await cookies()).get(COUNTRY_COOKIE)?.value;
    return currencyForCountry(country);
  } catch {
    return defaultCurrency;
  }
}

export async function getRate(from: Currency, to: Currency): Promise<number> {
  if (from === to) return 1;

  const response = await fetch(`${ENDPOINT}/${from}`, {
    next: { revalidate: REVALIDATE, tags: ["fx"] },
  });

  if (!response.ok) throw new Error(`Rates ${from}->${to}: ${response.status}`);

  const { rates } = (await response.json()) as { rates?: Record<string, number> };
  const rate = rates?.[to];

  if (!Number.isFinite(rate)) throw new Error(`Rates ${from}->${to}: missing rate`);
  return rate as number;
}

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

export async function getPrice(amount: number, locale: Locale, from?: string) {
  const source = (from?.toUpperCase() as Currency) ?? baseCurrency;
  const target = await currencyForVisitor(locale);

  try {
    const rate = await getRate(source, target);
    return formatMoney(Math.round(amount * rate), target, locale);
  } catch {
    return formatMoney(amount, source, locale);
  }
}

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
