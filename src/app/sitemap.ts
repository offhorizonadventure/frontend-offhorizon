import type { MetadataRoute } from "next";

import { defaultLocale, locales } from "@/i18n/config";
import { sortedPosts } from "@/config/posts";
import { siteUrl } from "@/lib/seo";

/** Add every public route here, without the locale prefix. */
const routes = ["/", "/about-us", "/contact-us", "/blog"];

/** Post URLs are derived, so publishing a post adds it to the sitemap. */
const postRoutes = sortedPosts.map((post) => `/blog/${post.slug}`);

export default function sitemap(): MetadataRoute.Sitemap {
  return [...routes, ...postRoutes].flatMap((path) =>
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
