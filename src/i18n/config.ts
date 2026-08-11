export const locales = ["en", "fr", "de", "it", "es"] as const;
export const defaultLocale = "en";
export const defaultCurrency = "USD";

export type Locale = (typeof locales)[number];
export type Currency = "USD" | "EUR";

type Market = { locale: Locale; currency: Currency; flag: string; ogLocale: string };

/** Countries with a dedicated language + currency. Everything else gets the default. */
export const markets: Record<string, Market> = {
  FR: { locale: "fr", currency: "EUR", flag: "fr", ogLocale: "fr_FR" },
  DE: { locale: "de", currency: "EUR", flag: "de", ogLocale: "de_DE" },
  IT: { locale: "it", currency: "EUR", flag: "it", ogLocale: "it_IT" },
  ES: { locale: "es", currency: "EUR", flag: "es", ogLocale: "es_ES" },
};

const byLocale = new Map<Locale, Market>(
  Object.values(markets).map((market) => [market.locale, market]),
);

const fallback: Market = {
  locale: defaultLocale,
  currency: defaultCurrency,
  flag: "us",
  ogLocale: "en_US",
};

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (locales as readonly string[]).includes(value);

export const marketFor = (locale: Locale): Market => byLocale.get(locale) ?? fallback;

export const localeFor = (country: string | null | undefined): Locale =>
  (country && markets[country.toUpperCase()]?.locale) || defaultLocale;

export const currencyFor = (locale: Locale): Currency => marketFor(locale).currency;

export const LOCALE_COOKIE = "NEXT_LOCALE";
