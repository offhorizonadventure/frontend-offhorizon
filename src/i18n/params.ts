import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import type { Locale } from "./config";
import { routing } from "./routing";

/**
 * Validates the `[locale]` segment and opts the render into static generation.
 * Unknown locales 404 rather than falling back, so no duplicate content is served.
 */
export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  return locale;
}
