import Image from "next/image";

import { Link } from "@/i18n/navigation";
import { siteName } from "@/lib/seo";

const RATIO = 2589 / 546;

type LogoProps = {
  height?: number;
  variant?: "brand" | "cream";
  className?: string;
};

export function Logo({ height = 40, variant = "brand", className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={siteName}
      className={`inline-flex shrink-0 items-center ${className}`}
    >
      <Image
        src={variant === "cream" ? "/logo/logo-horizontal-cream.png" : "/logo/logo-horizontal.png"}
        alt={siteName}
        width={Math.round(height * RATIO)}
        height={height}
        // No `priority`, and no `loading` either.
        //
        // Both write a <link rel="preload"> into the head, and the head already
        // holds one for the picture that is the largest thing on the screen.
        // Two image preloads race for one connection on a phone, and the logo
        // is a small mark in the bar while the other one is the score.
        //
        // Left to the default it is fetched with the rest of the page. A
        // browser does not defer an image that is already in the viewport, and
        // this one always is, so it still arrives with the bar around it.
        sizes={`${Math.round(height * RATIO)}px`}
        className="h-6 w-auto max-w-none min-[360px]:h-7 sm:h-8"
      />
    </Link>
  );
}
