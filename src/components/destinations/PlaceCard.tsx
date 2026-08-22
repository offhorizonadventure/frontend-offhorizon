import Image, { type StaticImageData } from "next/image";

import { ArrowRight } from "@/components/ui/icons";
import { Flag } from "@/components/ui/Flag";
import { Link } from "@/i18n/navigation";

/** Country and region card. */
export function PlaceCard({
  href,
  name,
  image,
  imageAlt,
  badge,
  meta,
  body,
  flag,
  frame = "portrait",
  sizes,
}: {
  href: string;
  name: string;
  image: StaticImageData;
  imageAlt: string;
  /** Running or planned, shown top right. */
  badge: string;
  /** Expedition count, or the invitation to enquire. */
  meta: string;
  /** Regions carry a line of description; countries do not. */
  body?: string;
  flag?: string;
  frame?: "portrait" | "landscape";
  sizes: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-brand-100 ring-brand-900/10 ease-out-expo @container block h-full overflow-hidden rounded-[28px] ring-1 transition-transform duration-500 hover:-translate-y-1"
    >
      {/* The frame stands up as the card narrows, or a 16:10 picture ends up
          shorter than its own caption. Container queries: the width comes from
          the grid, not the window. */}
      <article
        className={`relative ${
          frame === "portrait" ? "aspect-[3/4]" : "aspect-[4/5] @lg:aspect-[16/10]"
        }`}
      >
        <Image
          src={image}
          alt={imageAlt}
          fill
          placeholder="blur"
          sizes={sizes}
          quality={90}
          className="ease-out-expo object-cover transition-transform duration-[1400ms] group-hover:scale-[1.06]"
        />

        <span
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-brand-950)_0%,color-mix(in_srgb,var(--color-brand-950)_45%,transparent)_38%,transparent_72%)]"
        />

        <span className="bg-brand-950/60 text-cream-100/85 absolute top-4 right-4 rounded-full px-3 py-1 text-[9.5px] font-bold tracking-[0.14em] uppercase backdrop-blur-sm">
          {badge}
        </span>

        <div className="absolute inset-x-0 bottom-0 p-5 @sm:p-6">
          <div className="flex items-center gap-2.5">
            {flag && <Flag country={flag} />}
            <h3 className="font-display text-[19px] leading-tight font-bold tracking-[-0.02em] text-white @sm:text-[20px]">
              {name}
            </h3>
          </div>

          {body && (
            <p className="mt-2.5 line-clamp-2 max-w-md text-[13.5px] leading-relaxed text-white/65">
              {body}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="text-[10.5px] font-semibold tracking-[0.16em] text-white/70 uppercase">
              {meta}
            </span>
            <span className="group-hover:text-brand-900 flex size-9 shrink-0 items-center justify-center rounded-full bg-white/12 text-white ring-1 ring-white/25 backdrop-blur-sm transition-colors duration-300 group-hover:bg-white">
              <ArrowRight />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
