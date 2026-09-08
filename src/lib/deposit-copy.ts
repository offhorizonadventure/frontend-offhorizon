import { DEPOSIT_SHARE } from "@/lib/booking/types";

/**
 * The house deposit, as a whole number, for the pages that explain it.
 *
 * Written once here and read by the copy, so the page and the checkout cannot
 * disagree. An expedition may ask for its own share; these pages describe the
 * rule, not any one date, and say as much.
 */
export const DEPOSIT_PERCENT = Math.round(DEPOSIT_SHARE * 100);

/**
 * Fills `{percent}` into text read with `t.raw`.
 *
 * `t.raw` hands back the message untouched, which is the point when the
 * message is an array of clauses rather than a sentence, but it also means
 * nothing is substituted. Rather than flattening those arrays into numbered
 * keys, the placeholder is filled here, on the way out.
 */
export function fillPercent<T>(value: T): T {
  if (typeof value === "string") {
    return value.replaceAll("{percent}", String(DEPOSIT_PERCENT)) as T;
  }

  if (Array.isArray(value)) return value.map(fillPercent) as T;

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, fillPercent(entry)]),
    ) as T;
  }

  return value;
}
