import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const SCRIPT_HOSTS = [
  "https://*.googletagmanager.com",
  "https://*.google-analytics.com",
  "https://*.googleadservices.com",
  "https://*.doubleclick.net",
  "https://*.google.com",
  "https://*.gstatic.com",
  "https://connect.facebook.net",
  "https://*.clarity.ms",
  "https://*.bing.com",
  "https://*.brevo.com",
  "https://*.sendinblue.com",
  "https://sibautomation.com",
  "https://capi-automation.s3.us-east-2.amazonaws.com",
  "https://*.wonderpush.com",
  "https://*.trustindex.io",
  "https://*.razorpay.com",
  "https://app.termly.io",
  "https://*.termly.io",
].join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "upgrade-insecure-requests",
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

  output: process.env.VERCEL ? undefined : "standalone",

  experimental: {
    optimizePackageImports: ["lucide-react", "react-icons", "gsap"],

    /**
     * The stylesheet arrives with the page instead of after it.
     *
     * The critical path was: fetch the HTML, parse it, find two <link> tags,
     * go back out for them, and only then draw anything. Measured on a phone
     * that chain was 818 ms, and nothing at all was on screen for the whole of
     * it, because a stylesheet blocks rendering by definition.
     *
     * The trade this makes is that the CSS can no longer be cached on its own,
     * so a returning visitor downloads it again inside the HTML. Here that
     * costs nothing: the HTML is served no-store, so it was never being cached
     * either. And Tailwind only emits the classes actually used, so it is
     * twenty kilobytes before compression rather than a whole framework.
     */
    inlineCss: true,

    /**
     * One thread per picture, and read the source a piece at a time.
     *
     * Optimising an image decodes the whole thing into memory first. A tour
     * page carries sixty of them, and left alone the encoder takes a thread
     * per core and holds a full bitmap for each one it is working on. Twenty
     * five at once put the container past the memory it is allowed and the
     * kernel stopped it, which is why the page sometimes failed to load and
     * was fine on a refresh: by then it had come back up.
     *
     * Reproduced before changing anything: twenty five concurrent requests to
     * the optimiser, nine of them answered with a dropped connection.
     *
     * One thread makes each image slower and the machine never fall over,
     * which is the right way round. With the cache below, each one is paid for
     * once.
     */
    imgOptConcurrency: 1,
    imgOptSequentialRead: true,
  },

  async redirects() {
    return [
      {
        source: "/:locale/adventure-tours",
        destination: "/:locale/calendar",
        permanent: true,
      },
    ];
  },

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
        source: "/:path*.(jpg|jpeg|png|webp|avif|svg|ico|woff2)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
        ],
      },
      {
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
     * A month, against a default of four hours.
     *
     * The optimised copy is thrown away and made again when this expires, and
     * making it is the expensive thing: every four hours the site was re-
     * encoding every picture on it, for nobody. These are photographs of
     * mountains that have not changed since the tour was written, and an edited
     * one arrives under a new filename anyway, so there is nothing here that
     * going stale can get wrong.
     */
    minimumCacheTTL: 2678400,
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [64, 128, 256, 384],

    // 60 is for the decorative panels on the home page, which sit behind a
    // dark scrim with text over them. They are the largest thing on a phone
    // screen, so they are what the score measures, and nobody has ever looked
    // at one closely enough to tell 60 from 75.
    qualities: [60, 75, 90],
    remotePatterns: [
      { protocol: "https", hostname: "flagcdn.com" },
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
