import Image from "next/image";

import { Link } from "@/i18n/navigation";
import { siteName } from "@/lib/seo";

const RATIO = 2589 / 546;

type LogoProps = {
  /** Rendered height in px; width follows the logo's aspect ratio. */
  height?: number;
  variant?: "brand" | "cream";
  className?: string;
};

export function Logo({ height = 40, variant = "brand", className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={siteName}
      // `shrink-0`: the bar is a flex row, and in French and Spanish the
      // navigation is wide enough that the browser starts taking the space
      // back from the first item. `w-auto` gives it no width to defend, so the
      // logo was squashed from a 4.7 ratio to 2.7 rather than the row wrapping.
      className={`inline-flex shrink-0 items-center ${className}`}
    >
      <Image
        src={variant === "cream" ? "/logo/logo-horizontal-cream.png" : "/logo/logo-horizontal.png"}
        alt={siteName}
        width={Math.round(height * RATIO)}
        height={height}
        priority
        sizes={`${Math.round(height * RATIO)}px`}
        className="h-7 w-auto max-w-none sm:h-8"
      />
    </Link>
  );
}
