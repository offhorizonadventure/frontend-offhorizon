import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import type { Locale } from "./config";
import { routing } from "./routing";

type Catalogue = Record<string, unknown>;

/** Bundled at build time - one chunk per locale, no runtime file access. */
const bundled: Record<Locale, () => Promise<{ default: Catalogue }>> = {
  en: () => import("../../messages/en.json"),
  fr: () => import("../../messages/fr.json"),
  de: () => import("../../messages/de.json"),
  it: () => import("../../messages/it.json"),
  es: () => import("../../messages/es.json"),
};

/**
 * In dev, read the catalogue off disk instead of importing it. The bundler
 * caches JSON modules and does not reliably invalidate them when the file
 * changes, which otherwise leaves you staring at raw message keys until you
 * restart the dev server. Production always uses the bundled imports.
 */
async function loadMessages(locale: Locale): Promise<Catalogue> {
  if (process.env.NODE_ENV === "development") {
    const [{ readFile }, { join }] = await Promise.all([
      import("node:fs/promises"),
      import("node:path"),
    ]);
    const file = join(process.cwd(), "messages", `${locale}.json`);
    return JSON.parse(await readFile(file, "utf8")) as Catalogue;
  }

  return (await bundled[locale]()).default;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
    timeZone: "Asia/Kolkata",
  };
});
