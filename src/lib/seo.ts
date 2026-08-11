import type { Metadata } from "next";

import { defaultLocale, locales, marketFor, type Locale } from "@/i18n/config";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://offhorizon.com").replace(
  /\/$/,
  "",
);

export const siteName = "Offhorizon Adventures";

const defaultDescription =
  "Offhorizon Adventure delivers premium guided motorcycle and self-drive 4x4 expeditions across the Trans-Himalayan region. We operate in high-altitude terrain";

const defaultImage = {
  url: "https://offhorizon.com/wp-content/uploads/2026/03/OffHorizon_Adventures_Logo2.png",
  width: 1750,
  height: 1384,
  alt: "Offhorizon Adventure",
  type: "image/png",
};

const url = (locale: Locale, path: string) =>
  `${siteUrl}/${locale}${path === "/" ? "" : path}`;

type SeoInput = {
  locale: Locale;
  /** Path without the locale prefix, e.g. "/tours/ladakh". */
  path?: string;
  title?: string;
  description?: string;
  image?: typeof defaultImage;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  /** Surfaced as the Twitter "time to read" label on articles. */
  readingMinutes?: number;
  /**
   * Languages this page actually exists in. Defaults to all of them, which is
   * right for hand-translated pages. CMS content that is not translated yet
   * should pass the real list so hreflang does not advertise a translation
   * that is not there.
   */
  availableLocales?: readonly Locale[];
  noIndex?: boolean;
};

export function buildMetadata({
  locale,
  path = "/",
  title = siteName,
  description = defaultDescription,
  image = defaultImage,
  type = "website",
  publishedTime,
  modifiedTime,
  readingMinutes,
  availableLocales = locales,
  noIndex = false,
}: SeoInput): Metadata {
  const canonical = url(locale, path);

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ...Object.fromEntries(availableLocales.map((alt) => [alt, url(alt, path)])),
        "x-default": url(defaultLocale, path),
      },
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          "max-snippet": -1,
          "max-video-preview": -1,
          "max-image-preview": "large",
        },
    openGraph: {
      type,
      locale: marketFor(locale).ogLocale,
      alternateLocale: availableLocales
        .filter((l) => l !== locale)
        .map((l) => marketFor(l).ogLocale),
      title,
      description,
      url: canonical,
      siteName,
      images: [{ ...image, secureUrl: image.url }],
      ...(type === "article" && { publishedTime, modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
    ...(readingMinutes && {
      other: {
        "twitter:label1": "Time to read",
        "twitter:data1": `${readingMinutes} minute${readingMinutes === 1 ? "" : "s"}`,
      },
    }),
  };
}
