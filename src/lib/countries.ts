/**
 * Every country a rider can be paying from.
 *
 * India's rules on money arriving from abroad mean the office has to be able
 * to say where each payment came from, so the checkout asks and the booking
 * records it. Two letters, ISO 3166-1, which is what a bank or an auditor
 * expects to see and what will still mean the same thing in ten years.
 *
 * Only the codes are kept here. The names come from the browser and the server
 * through `Intl.DisplayNames`, so a French rider reads "Royaume-Uni" without
 * anyone maintaining five lists of two hundred and forty nine names between
 * them. A runtime without the data falls back to the code, which is ugly but
 * never wrong.
 *
 * Pure and client safe: no server-only, no Supabase.
 */

export const COUNTRY_CODES = [
  "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ",
  "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS",
  "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN",
  "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE",
  "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF",
  "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM",
  "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM",
  "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC",
  "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK",
  "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA",
  "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG",
  "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW",
  "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS",
  "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO",
  "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI",
  "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW",
] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];

export type CountryOption = { code: string; name: string };

const CODES = new Set<string>(COUNTRY_CODES);

/** Anything else is not a country, whatever the form said. */
export const isCountryCode = (value: unknown): value is CountryCode =>
  typeof value === "string" && CODES.has(value.toUpperCase());

/** Uppercase and checked, or null. Use before writing one to the database. */
export const toCountryCode = (value: unknown): CountryCode | null => {
  if (typeof value !== "string") return null;
  const code = value.trim().toUpperCase();

  return CODES.has(code) ? (code as CountryCode) : null;
};

const namers = new Map<string, Intl.DisplayNames | null>();

const namer = (locale: string) => {
  if (!namers.has(locale)) {
    try {
      namers.set(locale, new Intl.DisplayNames([locale], { type: "region" }));
    } catch {
      namers.set(locale, null);
    }
  }

  return namers.get(locale) ?? null;
};

export const countryName = (code: string, locale = "en"): string => {
  const upper = code.toUpperCase();

  try {
    return namer(locale)?.of(upper) ?? upper;
  } catch {
    return upper;
  }
};

/**
 * The list to show, in the reader's own language and their own alphabet's
 * order, so "Österreich" sorts where a German speaker looks for it.
 */
export function countryOptions(locale = "en"): CountryOption[] {
  const collator = new Intl.Collator(locale);

  return COUNTRY_CODES.map((code) => ({ code, name: countryName(code, locale) })).sort((a, b) =>
    collator.compare(a.name, b.name),
  );
}

/**
 * Folded for searching: lower case, accents dropped. A rider typing "Nepal"
 * on an English keyboard should find "Népal" without knowing where the accent
 * goes, and somebody typing "cote" should find "Côte d'Ivoire".
 */
export const fold = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
