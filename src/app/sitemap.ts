import type { MetadataRoute } from "next";

import { defaultLocale, locales } from "@/i18n/config";
import { destinationRoutes } from "@/config/destination-pages";
import { listPosts } from "@/lib/blog";
import { imageUrl, listTours, tourPath, type Tour } from "@/lib/catalogue";
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

  // Google finds pictures through the sitemap. Without this the gallery on a
  // tour page is only ever found by crawling, if at all.
  const picturesFor = (tour: Tour) =>
    [
      tour.hero_path,
      tour.og_path,
      ...tour.gallery.map((item) => item.path),
      ...tour.programme.map((day) => day.path),
      ...tour.highlights.map((item) => item.path),
    ]
      .map((path) => imageUrl(path))
      .filter((url): url is string => Boolean(url));

  const images = new Map<string, string[]>(
    tours.map((tour) => [tourPath(tour), picturesFor(tour)]),
  );

  const postImages = new Map<string, string[]>(
    posts.flatMap((post) => {
      const cover = imageUrl(post.cover_path);

      return cover ? [[`/blog/${post.slug}`, [cover]] as [string, string[]]] : [];
    }),
  );

  return [...routes, ...destinationRoutes, ...tourRoutes, ...postRoutes].flatMap((path) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path === "/" ? "" : path}`,
      lastModified: new Date(),
      images: images.get(path) ?? postImages.get(path),
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
