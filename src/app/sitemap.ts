import type { MetadataRoute } from "next";

import { defaultLocale, locales } from "@/i18n/config";
import { siteUrl } from "@/lib/seo";

/** Add every public route here, without the locale prefix. */
const routes = ["/", "/about-us", "/contact-us"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.flatMap((path) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path === "/" ? "" : path}`,
      lastModified: new Date(),
      alternates: {
        languages: {
          ...Object.fromEntries(
            locales.map((alt) => [alt, `${siteUrl}/${alt}${path === "/" ? "" : path}`]),
          ),
          "x-default": `${siteUrl}/${defaultLocale}${path === "/" ? "" : path}`,
        },
      },
    })),
  );
}
