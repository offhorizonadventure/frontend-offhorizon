import Image from "next/image";

import { blurOf, type ImageSource } from "@/lib/image-source";

import { Breadcrumbs, type Crumb } from "@/components/destinations/Breadcrumbs";
import { Topo } from "@/components/ui/Topo";
import type { Locale } from "@/i18n/config";

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
  image: ImageSource;
  imageAlt: string;
  crumbs: Crumb[];
  locale: Locale;
  seed?: number;
}) {
  return (
    <section className="bg-brand-950 text-cream-100 relative min-h-[24rem] overflow-hidden lg:min-h-[30rem]">
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        {...blurOf(image)}
        sizes="100vw"
        quality={75}
        className="object-cover"
      />
      <span
        aria-hidden
        className="from-brand-950 via-brand-950/70 to-brand-950/45 absolute inset-0 bg-gradient-to-t"
      />
      <span
        aria-hidden
        className="from-brand-950/85 via-brand-950/45 to-brand-950/20 absolute inset-0 bg-gradient-to-r"
      />
      <span aria-hidden className="bg-brand-950/15 absolute inset-0 mix-blend-multiply" />

      <Topo className="text-cream-100/10" rings={15} seed={seed} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_0%,rgba(180,95,43,0.22),transparent_72%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 pt-28 pb-24 sm:px-8 sm:pt-32 sm:pb-50 lg:pb-36">
        <div className="hero-rise">
          <Breadcrumbs crumbs={crumbs} locale={locale} />
        </div>

        <div className="mt-8">
          <span
            className="hero-rise text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase"
            style={{ animationDelay: "60ms" }}
          >
            <span aria-hidden className="bg-ember-500/60 h-px w-8" />
            {eyebrow}
          </span>

          <h1
            className="hero-rise font-display mt-5 text-[clamp(2.1rem,4.6vw,3.5rem)] leading-[1.04] font-extrabold tracking-[-0.04em] text-balance"
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
      </div>
    </section>
  );
}
