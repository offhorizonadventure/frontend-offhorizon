import type { MetadataRoute } from "next";

import { defaultLocale, locales } from "@/i18n/config";
import { destinationRoutes } from "@/config/destination-pages";
import { sortedPosts } from "@/config/posts";
import { tourRoutes } from "@/config/tour-pages";
import { siteUrl } from "@/lib/seo";

/** Add every public route here, without the locale prefix. */
const routes = [
  "/",
  "/about-us",
  "/adventure-tours",
  "/contact-us",
  "/custom-expeditions",
  "/blog",
];

/** Post URLs are derived, so publishing a post adds it to the sitemap. */
const postRoutes = sortedPosts.map((post) => `/blog/${post.slug}`);

export default function sitemap(): MetadataRoute.Sitemap {
  return [...routes, ...destinationRoutes, ...tourRoutes, ...postRoutes].flatMap((path) =>
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
