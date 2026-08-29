import Image from "next/image";

import { ArrowRight } from "@/components/ui/icons";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { blurOf } from "@/lib/image-source";

export type DepartureCardProps = {
  locale: Locale;
  href: string;
  title: string;
  image: string | null;
  imageAlt: string;
  dates: string;
  nights: string;
  kind: string;
  country: string | null;
  price: string | null;
  priceLabel: string;
  places: string | null;
  soldOut: boolean;
  soldOutLabel: string;
  cta: string;
};

export function DepartureCard({
  href,
  title,
  image,
  imageAlt,
  dates,
  nights,
  kind,
  country,
  price,
  priceLabel,
  places,
  soldOut,
  soldOutLabel,
  cta,
}: DepartureCardProps) {
  return (
    <article className="group ring-brand-900/10 hover:shadow-brand-950/5 flex h-full flex-col overflow-hidden rounded-[22px] bg-white ring-1 transition-shadow duration-300 hover:shadow-xl">
      <div className="bg-brand-100 relative aspect-[16/10] overflow-hidden">
        {image && (
          <Image
            src={image}
            alt={imageAlt}
            fill
            {...blurOf(image)}
            sizes="(max-width: 639px) 92vw, (max-width: 1023px) 46vw, 360px"
            className="ease-out-expo object-cover transition-transform duration-[900ms] group-hover:scale-[1.05]"
          />
        )}

        <span
          aria-hidden
          className="from-brand-950/60 absolute inset-0 bg-gradient-to-t via-transparent to-transparent"
        />

        <span className="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-1.5">
          <span className="text-brand-900 rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-bold tracking-[0.08em] uppercase">
            {kind}
          </span>
          {country && (
            <span className="text-cream-100 rounded-full bg-black/35 px-2.5 py-1 text-[10.5px] font-bold tracking-[0.08em] uppercase backdrop-blur-sm">
              {country}
            </span>
          )}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-ember-600 text-[11.5px] font-bold tracking-[0.1em] uppercase">{dates}</p>

        <h3 className="font-display text-brand-900 mt-2 line-clamp-2 text-[17px] leading-tight font-bold tracking-[-0.02em] text-balance">
          {title}
        </h3>

        <p className="text-brand-800/50 mt-1.5 text-[12.5px]">{nights}</p>

        <div className="border-brand-900/10 mt-auto flex flex-wrap items-end justify-between gap-3 border-t pt-4">
          <div className="min-w-0">
            {price ? (
              <>
                <p className="text-brand-800/45 text-[10.5px] font-bold tracking-[0.14em] uppercase">
                  {priceLabel}
                </p>
                <p className="font-display text-brand-900 text-[19px] leading-none font-extrabold tracking-[-0.02em] tabular-nums">
                  {price}
                </p>
              </>
            ) : (
              places && <p className="text-brand-800/55 text-[12.5px]">{places}</p>
            )}

            {price && places && <p className="text-brand-800/50 mt-1 text-[12px]">{places}</p>}
          </div>

          {soldOut ? (
            <span className="text-brand-800/45 ring-brand-900/12 inline-flex h-10 shrink-0 items-center rounded-full px-4 text-[10.5px] font-bold tracking-[0.11em] uppercase ring-1">
              {soldOutLabel}
            </span>
          ) : (
            <Link
              href={href}
              className="border-brand-900/20 text-brand-800 hover:border-brand-800 hover:bg-brand-800 hover:text-cream-100 inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-[10.5px] font-bold tracking-[0.11em] uppercase transition-colors duration-300"
            >
              {cta}
              <ArrowRight />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
