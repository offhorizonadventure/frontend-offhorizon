import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The account area and the auth callback are per-visitor pages with nothing to index, and a crawler following a reset link would spend the token on itself.
        disallow: ["/api/", "/auth/", "/*/account", "/*/account/", "/*/reset-password"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
