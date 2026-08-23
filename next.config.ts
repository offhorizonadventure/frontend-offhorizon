import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";

/**
 * What the browser is allowed to load, and from where.
 *
 * Anything not listed here is refused by the browser, so a script injected into
 * a page has nowhere to send what it steals. The pages are statically rendered,
 * which rules out a per-request nonce, so inline scripts are allowed: the site
 * renders no user-written HTML, and every inline script on it is our own
 * structured data. External script hosts are named one by one, which is the
 * part that matters.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
  // Razorpay's checkout, the reviews widget, and our own structured data.
  "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://cdn.trustindex.io https://www.youtube.com https://s.ytimg.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.trustindex.io",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://flagcdn.com https://i.ytimg.com https://cdn.trustindex.io " +
    SUPABASE,
  // The database, the exchange rates, the country lookup and the payment API.
  "connect-src 'self' https://open.er-api.com https://ipapi.co https://api.razorpay.com https://lumberjack.razorpay.com https://checkout.razorpay.com https://cdn.trustindex.io " +
    SUPABASE,
  // The payment window and the films are iframes.
  "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://www.youtube-nocookie.com https://www.youtube.com https://cdn.trustindex.io",
  "media-src 'self' blob:",
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
