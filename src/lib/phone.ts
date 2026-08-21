import { countryCodes, dialCodes } from "@/config/dial-codes";

/** Splits a stored `+<code><number>` back into a country and a national number. */
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
