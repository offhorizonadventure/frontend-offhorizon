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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
