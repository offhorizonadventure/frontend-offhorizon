import { countryCodes, dialCodes } from "@/config/dial-codes";

/**
 * Splits a stored `+<code><number>` back into a country and a national number.
 *
 * The number is kept as one string in the database, which is what a person
 * dials and what any telephony service wants. The picker needs the two halves
 * apart, and there is no separator to split on, so the dial code is matched by
 * prefix.
 *
 * Longest match wins, and that matters: +1 covers the United States, but +1 268
 * is Antigua. Sorting by length means the more specific code is tried first.
 * Several countries genuinely share a code (+1 for the US and Canada, +7 for
 * Russia and Kazakhstan), so this returns the first of them and lets the person
 * change it; there is nothing in the number itself to tell them apart.
 */
const BY_LENGTH = [...countryCodes].sort(
  (a, b) => (dialCodes[b]?.length ?? 0) - (dialCodes[a]?.length ?? 0),
);

export function splitPhone(value: string | null | undefined): {
  country?: string;
  number: string;
} {
  const trimmed = (value ?? "").trim();
  if (!trimmed.startsWith("+")) return { number: trimmed };

  const digits = trimmed.slice(1).replace(/\D/g, "");
  const country = BY_LENGTH.find((code) => digits.startsWith(dialCodes[code] ?? "\u0000"));

  return country
    ? { country, number: digits.slice(dialCodes[country].length) }
    : { number: digits };
}
