import type { MetadataRoute } from "next";

import { defaultLocale, locales } from "@/i18n/config";
import { destinationRoutes } from "@/config/destination-pages";
import { listPosts } from "@/lib/blog";
import { listTours, tourPath } from "@/lib/catalogue";
import { siteUrl } from "@/lib/seo";

const routes = [
  "/",
  "/about-us",
  "/calendar",
  "/contact-us",
  "/custom-expeditions",
  "/blog",
  "/how-booking-works",
  "/terms-of-service",
  "/privacy-policy",
  "/account-deletion",
];

export const dynamic = "force-dynamic";

/** A page to list, and the day it genuinely last changed if we know one. */
type Entry = { path: string; lastModified?: Date };

const date = (value: string | null | undefined) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, tours] = await Promise.all([listPosts(), listTours()]);

  // Both readers answer an unreachable database with an empty list, which here
  // would publish a shorter but perfectly valid sitemap. That is the worse
  // failure: a fetch that fails leaves Google using the sitemap it already has,
  // while a sitemap that has lost seventy pages tells it those pages are gone.
  // So refuse to answer at all rather than answer wrongly.
  if (!tours.length) {
    throw new Error("Sitemap not built: the tour list came back empty");
  }

  const entries: Entry[] = [
    ...routes.map((path) => ({ path })),
    ...destinationRoutes.map((path) => ({ path })),
    ...tours.map((tour) => ({ path: tourPath(tour), lastModified: date(tour.updated_at) })),
    ...posts.map((post) => ({
      path: `/blog/${post.slug}`,
      lastModified: date(post.updated_at),
    })),
  ];

  // No image entries here on purpose.
  //
  // Listing the pictures got them into Google Images, but a sitemap has to
  // give an absolute address for each one, and ours are served from the
  // storage bucket. So the sitemap became a public, machine readable list of
  // the project's storage host and the path of every file in it. The pictures
  // are still in the page for a crawler to find; they are not advertised.
  //
  // No made up dates either. This used to stamp every address with the moment
  // of the request, so all hundred and twenty five pages claimed to have
  // changed seconds ago on every single crawl. Google ignores a lastmod it
  // cannot believe, and the tours and posts carry a real edited date. The
  // hand written pages carry none, so they are sent without one.
  return entries.flatMap(({ path, lastModified }) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path === "/" ? "" : path}`,
      ...(lastModified ? { lastModified } : {}),
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
