import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,

  /**
   * Headers every response carries.
   *
   * `X-Robots-Tag` says the same thing the robots meta tag says, but in the
   * response itself: crawlers that fetch a PDF, an image or a sitemap never see
   * the HTML, so the meta tag cannot reach them. The two have to agree, and
   * both say index and follow with full snippets and large image previews.
   *
   * The rest are the ordinary protections. None of them affects indexing; they
   * are here because a site handling sign in and payment details should not
   * wait for a launch checklist to set them.
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
    /**
     * Next re-encodes every image it serves, and since 16 the only quality it
     * will use is 75 unless the value is listed here. A photograph stored at 92
     * was being compressed a second time at 75, which is where the softness on
     * the tour cards came from. 90 is the one the photography uses; 75 stays
     * for anything decorative.
     */
    qualities: [75, 90],
    remotePatterns: [
      { protocol: "https", hostname: "flagcdn.com" },
      // Journal covers and the pictures inside a post, served from Supabase
      // Storage. Narrowed to the project host in the environment file rather
      // than opening every https origin.
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
