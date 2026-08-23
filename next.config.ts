import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

/**
 * What the browser is allowed to load.
 *
 * The tag manager container loads code chosen after this file was written:
 * Google Ads, the Meta pixel, Clarity, Brevo, WonderPush, and several of those
 * load further scripts of their own. Listing each host broke a tag every time
 * marketing added one, and gave only the appearance of control.
 *
 * So scripts, styles, images, beacons and frames may come from any https
 * origin, and the directives that actually stop an attack stay shut:
 *
 *   default-src 'self'      anything not named below stays same origin
 *   object-src 'none'       no plugin injection
 *   base-uri 'self'         a stolen <base> cannot repoint every relative URL
 *   form-action 'self'      a stolen form cannot post card details elsewhere
 *   frame-ancestors 'self'  the payment pages cannot be framed by anyone
 *
 * The strict version is a per-request nonce with 'strict-dynamic', which keeps
 * host control over scripts while letting the tag manager load its own. Worth
 * doing once the tag list settles.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
  // React rebuilds stack traces with eval while developing, never in a built site.
  `script-src 'self' 'unsafe-inline' https: ${process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""}`.trim(),
  "style-src 'self' 'unsafe-inline' https:",
  "font-src 'self' data: https:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https:",
  "frame-src 'self' https:",
  "media-src 'self' blob: https:",
  "worker-src 'self' blob:",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,

  // Only the icons a page actually uses are bundled, rather than the whole set.
  experimental: {
    optimizePackageImports: ["lucide-react", "react-icons", "gsap"],
  },

  /**
   * `X-Robots-Tag` repeats the robots meta tag in the response itself, which is
   * the only copy a crawler fetching a PDF or a sitemap sees.
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
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
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
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // Photographs and logos change with a deploy, not within one.
        source: "/:path*.(jpg|jpeg|png|webp|avif|svg|ico|woff2)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
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
    // Four widths rather than eight. Every one of them is written into the
    // srcSet of every picture on the page, twice, and the extra steps buy
    // almost nothing at these sizes.
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [64, 128, 256, 384],
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
