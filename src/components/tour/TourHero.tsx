import Image, { type StaticImageData } from "next/image";

import { Breadcrumbs, type Crumb } from "@/components/destinations/Breadcrumbs";
import { Topo } from "@/components/ui/Topo";
import type { Locale } from "@/i18n/config";

/**
 * Tour page header.
 *
 * Same photograph-behind-the-type treatment as the destination hero. The
 * pricing used to sit beside it; it now has its own section further down,
 * because a booking panel competing with the headline made the top of the page
 * feel like a checkout rather than an invitation.
 */
export function TourHero({
  eyebrow,
  title,
  lead,
  image,
  imageAlt,
  crumbs,
  locale,
  seed = 40,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  image: StaticImageData;
  imageAlt: string;
  crumbs: Crumb[];
  locale: Locale;
  seed?: number;
}) {
  return (
    <section className="relative min-h-[24rem] overflow-hidden bg-brand-950 text-cream-100 lg:min-h-[30rem]">
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="object-cover"
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/70 to-brand-950/45"
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-brand-950/85 via-brand-950/45 to-brand-950/20"
      />
      <span aria-hidden className="absolute inset-0 bg-brand-950/15 mix-blend-multiply" />

      <Topo className="text-cream-100/10" rings={15} seed={seed} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_0%,rgba(180,95,43,0.22),transparent_72%)]"
      />

      <div className="relative mx-auto max-w-6xl w-full px-5 pt-28 pb-24 sm:px-8 sm:pt-32 sm:pb-50 lg:pb-36">
        <div className="hero-rise">
          <Breadcrumbs crumbs={crumbs} locale={locale} />
        </div>

        <div className="mt-8">
            <span
              className="hero-rise flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase"
              style={{ animationDelay: "60ms" }}
            >
              <span aria-hidden className="h-px w-8 bg-ember-500/60" />
              {eyebrow}
            </span>

            <h1
              className="hero-rise font-display mt-5 text-[clamp(2.1rem,4.6vw,3.5rem)] leading-[1.04] font-extrabold tracking-[-0.04em] text-balance"
              style={{ animationDelay: "120ms" }}
            >
              {title}
            </h1>

            <p
              className="hero-rise mt-6 text-[15px] leading-[1.85] text-pretty text-cream-100/65 sm:text-[16.5px]"
              style={{ animationDelay: "200ms" }}
            >
              {lead}
            </p>
        </div>
      </div>
    </section>
  );
}
