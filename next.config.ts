import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
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
        hostname: new URL(
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
        ).hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default createNextIntlPlugin("./src/i18n/request.ts")(nextConfig);
