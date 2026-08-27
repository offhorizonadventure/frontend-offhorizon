import type { Metadata } from "next";

import { defaultLocale, locales, marketFor, type Locale } from "@/i18n/config";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://offhorizon.com").replace(
  /\/$/,
  "",
);

export const siteName = "Offhorizon Adventures";

const defaultDescription =
  "Guided motorcycle and self-drive 4x4 expeditions across the Himalayas. Small groups, prepared machines, a mechanic on every departure.";

/** Search results cut a title around 60 characters and a description around 155. */
const TITLE_LIMIT = 60;

const withBrand = (title: string) =>
  title === siteName || title.includes(siteName) || `${title} | ${siteName}`.length > TITLE_LIMIT
    ? title
    : `${title} | ${siteName}`;

/** What the site is about, for the pages that do not name their own subject. */
const defaultKeywords = [
  "motorcycle expeditions",
  "Himalayan motorcycle tour",
  "Ladakh motorcycle tour",
  "4x4 self drive expedition",
  "guided adventure tours India",
  "Nepal motorcycle tour",
];

const defaultImage = {
  url: "https://offhorizon.com/wp-content/uploads/2026/03/OffHorizon_Adventures_Logo2.png",
  width: 1750,
  height: 1384,
  alt: "Offhorizon Adventure",
  type: "image/png",
};

const url = (locale: Locale, path: string) => `${siteUrl}/${locale}${path === "/" ? "" : path}`;

type SeoInput = {
  locale: Locale;
  /** Path without the locale prefix, e.g. "/india/ladakh-circuit". */
  path?: string;
  title?: string;
  description?: string;
  image?: typeof defaultImage;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  /** Surfaced as the Twitter "time to read" label on articles. */
  readingMinutes?: number;
  /** Languages this page actually exists in. */
  availableLocales?: readonly Locale[];
  noIndex?: boolean;
  /** Added to the defaults, not instead of them. */
  keywords?: string[];
  /** Off on the layout, which sits under every page. */
  alternates?: boolean;
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
  keywords = [],
  alternates = true,
}: SeoInput): Metadata {
  const canonical = url(locale, path);
  const fullTitle = withBrand(title);

  return {
    metadataBase: new URL(siteUrl),
    title: fullTitle,
    description,
    keywords: [...keywords, ...defaultKeywords],
    applicationName: siteName,
    publisher: siteName,
    authors: [{ name: siteName, url: siteUrl }],
    creator: siteName,
    ...(alternates && {
      alternates: {
        canonical,
        languages: {
          ...Object.fromEntries(availableLocales.map((alt) => [alt, url(alt, path)])),
          "x-default": url(defaultLocale, path),
        },
      },
    }),
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
      title: fullTitle,
      description,
      url: canonical,
      siteName,
      images: [{ ...image, secureUrl: image.url }],
      ...(type === "article" && { publishedTime, modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
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
