import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

/** A CMS/API field carrying one value per language: `{ en: "...", fr: "..." }`. */
export type Localized<T> = Partial<Record<Locale, T>> | T;

const isLocalizedMap = <T,>(value: unknown): value is Partial<Record<Locale, T>> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.keys(value).every(isLocale);

/** Resolves a localized field, falling back to the default language. */
export function localize<T>(field: Localized<T>, locale: Locale): T | undefined {
  if (!isLocalizedMap<T>(field)) return field as T;
  return field[locale] ?? field[defaultLocale];
}

/** Same as `localize`, but always returns a string. */
export const localizeText = (field: Localized<string>, locale: Locale): string =>
  localize(field, locale) ?? "";
