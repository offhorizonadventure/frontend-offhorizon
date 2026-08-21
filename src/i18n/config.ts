export const locales = ["en", "fr", "de", "it", "es"] as const;
export const defaultLocale = "en";
export const defaultCurrency = "USD";

export type Locale = (typeof locales)[number];

/** The currencies prices can be shown in. */
export const currencies = [
  "USD",
  "EUR",
  "GBP",
  "CHF",
  "SEK",
  "NOK",
  "DKK",
  "ISK",
  "PLN",
  "CZK",
  "HUF",
  "RON",
  "BGN",
  "TRY",
  "RUB",
  "UAH",
  "INR",
  "NPR",
  "LKR",
  "BTN",
  "BDT",
  "PKR",
  "MNT",
  "CNY",
  "HKD",
  "TWD",
  "JPY",
  "KRW",
  "SGD",
  "MYR",
  "THB",
  "IDR",
  "PHP",
  "VND",
  "AUD",
  "NZD",
  "CAD",
  "MXN",
  "BRL",
  "ARS",
  "CLP",
  "COP",
  "PEN",
  "ZAR",
  "KES",
  "NGN",
  "EGP",
  "MAD",
  "ILS",
  "AED",
  "SAR",
  "QAR",
  "KWD",
  "BHD",
  "OMR",
  "JOD",
] as const;

export type Currency = (typeof currencies)[number];

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

/** What a country pays in. */
const COUNTRY_CURRENCY: Record<string, Currency> = {
  // The countries this company rides in come first, because they are the ones most likely to be reading.
  IN: "INR",
  NP: "NPR",
  LK: "LKR",
  BT: "BTN",
  MN: "MNT",
  GB: "GBP",
  IM: "GBP",
  JE: "GBP",
  GG: "GBP",
  AU: "AUD",
  CX: "AUD",
  NF: "AUD",
  CA: "CAD",
  CH: "CHF",
  LI: "CHF",
  JP: "JPY",
  SG: "SGD",
  NZ: "NZD",
  SE: "SEK",
  NO: "NOK",
  SJ: "NOK",
  DK: "DKK",
  GL: "DKK",
  FO: "DKK",
  PL: "PLN",
  CZ: "CZK",
  HU: "HUF",
  RO: "RON",
  BG: "BGN",
  TR: "TRY",
  IL: "ILS",
  ZA: "ZAR",
  BR: "BRL",
  MX: "MXN",
  KR: "KRW",
  CN: "CNY",
  HK: "HKD",
  MY: "MYR",
  TH: "THB",
  ID: "IDR",
  PH: "PHP",
  IS: "ISK",
  BD: "BDT",
  PK: "PKR",
  TW: "TWD",
  VN: "VND",
  AE: "AED",
  SA: "SAR",
  QA: "QAR",
  KW: "KWD",
  BH: "BHD",
  OM: "OMR",
  JO: "JOD",
  KE: "KES",
  NG: "NGN",
  EG: "EGP",
  MA: "MAD",
  RU: "RUB",
  UA: "UAH",
  AR: "ARS",
  CL: "CLP",
  CO: "COP",
  PE: "PEN",
  // The euro area.
  AT: "EUR",
  BE: "EUR",
  CY: "EUR",
  DE: "EUR",
  EE: "EUR",
  ES: "EUR",
  FI: "EUR",
  FR: "EUR",
  GR: "EUR",
  HR: "EUR",
  IE: "EUR",
  IT: "EUR",
  LT: "EUR",
  LU: "EUR",
  LV: "EUR",
  MT: "EUR",
  NL: "EUR",
  PT: "EUR",
  SI: "EUR",
  SK: "EUR",
  MC: "EUR",
  SM: "EUR",
  VA: "EUR",
  AD: "EUR",
  ME: "EUR",
  XK: "EUR",
};

export const currencyForCountry = (country: string | null | undefined): Currency =>
  (country && COUNTRY_CURRENCY[country.toUpperCase()]) || defaultCurrency;

export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Where the visitor appears to be, as a two letter code. */
export const COUNTRY_COOKIE = "oh_country";
