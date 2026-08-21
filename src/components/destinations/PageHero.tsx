import Image from "next/image";

import { blurOf, type ImageSource } from "@/lib/image-source";

import { Breadcrumbs, type Crumb } from "@/components/destinations/Breadcrumbs";
import { Topo } from "@/components/ui/Topo";
import type { Locale } from "@/i18n/config";

/** Destination page header. */
export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  imageAlt,
  crumbs,
  locale,
  seed = 18,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  image?: ImageSource;
  imageAlt?: string;
  crumbs: Crumb[];
  locale: Locale;
  seed?: number;
}) {
  return (
    <section className="bg-brand-950 text-cream-100 relative overflow-hidden">
      {image && (
        <>
          <Image
            src={image}
            alt={imageAlt ?? ""}
            fill
            priority
            {...blurOf(image)}
            sizes="100vw"
            className="object-cover"
          />
          {/* Three layers. The vertical scrim seats the section into the page,
              the horizontal one darkens only the column the type sits in so the
              landscape stays readable on the right, and the tint pulls whatever
              the photograph is doing toward the palette. */}
          <span
            aria-hidden
            className="from-brand-950 via-brand-950/70 to-brand-950/45 absolute inset-0 bg-gradient-to-t"
          />
          <span
            aria-hidden
            className="from-brand-950/80 via-brand-950/35 absolute inset-0 bg-gradient-to-r to-transparent"
          />
          <span aria-hidden className="bg-brand-950/15 absolute inset-0 mix-blend-multiply" />
        </>
      )}

      <Topo className="text-cream-100/10" rings={15} seed={seed} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_0%,rgba(180,95,43,0.22),transparent_72%)]"
      />

      <div className="relative mx-auto max-w-6xl px-5 pt-30 pb-16 sm:px-8 sm:pt-38 sm:pb-20">
        <div className="hero-rise">
          <Breadcrumbs crumbs={crumbs} locale={locale} />
        </div>

        <span
          className="hero-rise text-ember-500 mt-8 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase"
          style={{ animationDelay: "60ms" }}
        >
          <span aria-hidden className="bg-ember-500/60 h-px w-8" />
          {eyebrow}
        </span>

        <h1
          className="hero-rise font-display mt-5 text-[clamp(2.1rem,5vw,3.8rem)] leading-[1.04] font-extrabold tracking-[-0.04em] text-balance"
          style={{ animationDelay: "120ms" }}
        >
          {title}
        </h1>

        <p
          className="hero-rise text-cream-100/65 mt-6 text-[15px] leading-[1.85] text-pretty sm:text-[16.5px]"
          style={{ animationDelay: "200ms" }}
        >
          {lead}
        </p>
      </div>
    </section>
  );
}
