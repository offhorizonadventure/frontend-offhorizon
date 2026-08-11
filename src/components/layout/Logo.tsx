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
    <Link href="/" aria-label={siteName} className={`inline-flex items-center ${className}`}>
      <Image
        src={variant === "cream" ? "/logo/logo-horizontal-cream.png" : "/logo/logo-horizontal.png"}
        alt={siteName}
        width={Math.round(height * RATIO)}
        height={height}
        priority
        sizes={`${Math.round(height * RATIO)}px`}
        className="h-7 w-auto sm:h-8"
      />
    </Link>
  );
}
