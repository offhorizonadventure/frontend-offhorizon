import type { MetadataRoute } from "next";

import { defaultLocale, locales } from "@/i18n/config";
import { destinationRoutes } from "@/config/destination-pages";
import { listPosts } from "@/lib/blog";
import { listTours } from "@/lib/catalogue";
import { siteUrl } from "@/lib/seo";

/** Add every public route here, without the locale prefix. */
const routes = [
  "/",
  "/about-us",
  "/adventure-tours",
  "/contact-us",
  "/custom-expeditions",
  "/blog",
  // Given to Meta as the data deletion instructions URL, so it has to stay
  // reachable and indexed.
  "/account-deletion",
];

/**
 * Rebuilt on the same schedule as the journal, so publishing a post puts it in
 * the sitemap without a redeploy.
 */
export const revalidate = 600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Both lists come from the database, so publishing either puts it in the
  // sitemap without a redeploy.
  const [posts, tours] = await Promise.all([listPosts(), listTours()]);

  const postRoutes = posts.map((post) => `/blog/${post.slug}`);
  const tourRoutes = tours.map((tour) => `/tours/${tour.slug}`);

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
