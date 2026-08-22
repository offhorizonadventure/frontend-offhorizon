import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,

  /**
   * `X-Robots-Tag` repeats the robots meta tag in the response itself, which is
   * the only copy a crawler fetching a PDF or a sitemap sees. The rest are the
   * ordinary protections and do not affect indexing.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        // The account area is per visitor and has nothing to index. This is the
        // one place the header disagrees with the default above.
        source: "/:locale/account{/:path}*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/:locale/reset-password",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
    // Next re-encodes at 75 unless the quality is listed here, which was
    // compressing the photography a second time. 90 for photographs.

    qualities: [75, 90],
    remotePatterns: [
      { protocol: "https", hostname: "flagcdn.com" },
      // Journal images from Supabase Storage, narrowed to the project host.
      {
        protocol: "https",
        hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co")
          .hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default createNextIntlPlugin("./src/i18n/request.ts")(nextConfig);
