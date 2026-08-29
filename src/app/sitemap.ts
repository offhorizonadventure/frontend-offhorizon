import type { MetadataRoute } from "next";

import { defaultLocale, locales } from "@/i18n/config";
import { destinationRoutes } from "@/config/destination-pages";
import { listPosts } from "@/lib/blog";
import { listTours, tourPath } from "@/lib/catalogue";
import { siteUrl } from "@/lib/seo";

/** Add every public route here, without the locale prefix. */
const routes = [
  "/",
  "/about-us",
  "/adventure-tours",
  "/contact-us",
  "/custom-expeditions",
  "/blog",
  "/how-booking-works",
  "/terms-of-service",
  "/privacy-policy",
  // Given to Meta as the data deletion instructions URL, so it has to stay reachable and indexed.
  "/account-deletion",
];

/** Same schedule as the journal, so publishing adds to the sitemap. */
/**
 * Built per request rather than cached as a page.
 *
 * The lists underneath are cached and invalidated by tag when the office saves,
 * so this costs nothing in practice. Caching the rendered XML on top of them
 * added a second, slower layer: a tour whose address had been corrected went on
 * being advertised to Google at the old one, which is a 404 submitted on
 * purpose. A sitemap is fetched by crawlers, not by people, so freshness is
 * worth more here than a cache hit.
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Both lists come from the database, so publishing either puts it in the sitemap without a redeploy.
  const [posts, tours] = await Promise.all([listPosts(), listTours()]);

  const postRoutes = posts.map((post) => `/blog/${post.slug}`);
  const tourRoutes = tours.map(tourPath);

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
