import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

/**
 * What the browser is allowed to load.
 *
 * `script-src` used to end in a bare `https:`, which is to say any origin on
 * the internet that speaks TLS. It is now the list below: this site, and the
 * hosts the tag manager actually reaches for. Adding a vendor in GTM means
 * adding its host here, which is the point.
 *
 * `unsafe-inline` stays, and it is worth being straight about why. Removing it
 * needs a per-request nonce, and a nonce cannot be baked into a page that was
 * generated at build time. Fifteen of these pages carry structured data and
 * are statically generated; making them dynamic to tighten this one directive
 * would cost every visitor a round trip to save an attacker a step they cannot
 * currently take, since no user input is ever rendered as markup.
 *
 * Images, beacons and frames stay on `https:`. They cannot execute, the tag
 * vendors pull from a long tail of CDNs, and narrowing them is what broke the
 * reviews widget and the avatars last time.
 *
 * The directives that stop an attack outright are all shut:
 *
 *   default-src 'self'      anything not named below stays same origin
 *   object-src 'none'       no plugin injection
 *   base-uri 'self'         a stolen <base> cannot repoint every relative URL
 *   form-action 'self'      a stolen form cannot post card details elsewhere
 *   frame-ancestors 'none'   nothing may frame this site at all
 */
const SCRIPT_HOSTS = [
  // Tag manager, and Google's own analytics and advertising.
  "https://*.googletagmanager.com",
  "https://*.google-analytics.com",
  "https://*.googleadservices.com",
  "https://*.doubleclick.net",
  "https://*.google.com",
  "https://*.gstatic.com",
  // Meta.
  "https://connect.facebook.net",
  // Microsoft Clarity and Bing.
  "https://*.clarity.ms",
  "https://*.bing.com",
  // Brevo, which serves its tracker from sibautomation.com rather than from
  // either of its own brand domains.
  "https://*.brevo.com",
  "https://*.sendinblue.com",
  "https://sibautomation.com",
  // Meta's conversions API parameter builder, which GTM pulls from S3.
  "https://capi-automation.s3.us-east-2.amazonaws.com",
  "https://*.wonderpush.com",
  "https://*.trustindex.io",
  // Razorpay checkout.
  "https://*.razorpay.com",
].join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  // Nothing frames this site. Razorpay is framed by us, which is the other
  // direction and unaffected.
  "frame-ancestors 'none'",
  "form-action 'self'",
  "upgrade-insecure-requests",
  // React rebuilds stack traces with eval while developing, never in a built site.
  `script-src 'self' 'unsafe-inline' ${SCRIPT_HOSTS}${
    process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""
  }`,
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

  /**
   * Builds a self-contained server for the VPS.
   *
   * `.next/standalone` carries only the files actually reached, so the thing
   * copied to the server is tens of megabytes rather than a node_modules tree,
   * and nothing has to be installed there. `public` and `.next/static` are not
   * included and have to be copied alongside it; docs/hosting.md says where.
   */
  output: "standalone",

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
          { key: "X-Frame-Options", value: "DENY" },
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
