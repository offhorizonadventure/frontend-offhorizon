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
        priority
        sizes={`${Math.round(height * RATIO)}px`}
        className="h-6 w-auto max-w-none min-[360px]:h-7 sm:h-8"
      />
    </Link>
  );
}
