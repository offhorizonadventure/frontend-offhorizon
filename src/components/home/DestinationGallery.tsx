import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { ArrowRight } from "@/components/ui/icons";
import { Flag } from "@/components/ui/Flag";
import { destinations } from "@/config/destinations";
import { runningByCountry } from "@/lib/catalogue-counts";
import { Link } from "@/i18n/navigation";

import { GalleryMotion } from "./GalleryMotion";

/**
 * Destination gallery.
 *
 * Desktop is an expanding accordion: every panel shares the width until one is
 * hovered or focused, which grows it and compresses the rest. That is pure CSS
 * (`flex-grow` is animatable), so it works before hydration and needs no JS.
 * Below lg it falls back to a snap-scrolling rail, since an accordion has no
 * room to breathe on a phone.
 *
 * GSAP only adds the entrance wipe and the parallax drift inside each frame.
 */
/** `/destinations/india` carries the same slug the tours are filed under. */
const slugOf = (href: string) => href.split("/").pop() ?? "";

export async function DestinationGallery() {
  const [t, td, { counts }] = await Promise.all([
    getTranslations("home.gallery"),
    getTranslations("destinations"),
    runningByCountry(),
  ]);

  return (
    <GalleryMotion>
      <ul className="dg-rail">
        {destinations.map((destination) => (
          <li key={destination.key} data-dg-item className="dg-item">
            <Link href={destination.href} className="dg-panel group">
              {/* Inset so the parallax drift never exposes an edge. */}
              <span data-dg-image data-parallax="7" className="absolute inset-[-7%]">
                <Image
                  src={destination.image}
                  alt={td(destination.key)}
                  fill
                  placeholder="blur"
                  // The gallery sits above the fold, and the GSAP entrance clips
                  // each panel to zero area, which would defer a lazy load until
                  // after the wipe. Eager keeps them ready and helps LCP.
                  priority
                  sizes="(max-width: 767px) 78vw, (max-width: 1023px) 46vw, 40vw"
                  quality={90}
                  className="object-cover transition-transform duration-[1400ms] ease-out-expo group-hover:scale-[1.06]"
                />
              </span>

              <span className="dg-scrim" aria-hidden />

              {/* Collapsed state: name runs up the panel. */}
              <span className="dg-label-vertical" aria-hidden>
                {td(destination.key)}
              </span>

              {/* Expanded state, and the only version shown below lg. */}
              <span className="dg-label-block">
                <span className="flex items-center gap-2.5">
                  <Flag country={destination.flag} />
                  <span className="font-display text-[20px] leading-none font-bold tracking-[-0.02em] text-white">
                    {td(destination.key)}
                  </span>
                </span>

                <span className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-[10.5px] font-semibold tracking-[0.16em] text-white/70 uppercase">
                    {/* The real count, from the catalogue. A country with none
                        says so rather than quoting a number nobody can book. */}
                    {counts.get(slugOf(destination.href)) ? (
                      t("expeditions", { count: counts.get(slugOf(destination.href))! })
                    ) : (
                      <>{td("plannedShort")}</>
                    )}
                  </span>
                  <span className="flex size-9 items-center justify-center rounded-full bg-white/12 text-white ring-1 ring-white/25 backdrop-blur-sm transition-colors duration-300 group-hover:bg-white group-hover:text-brand-900">
                    <ArrowRight />
                  </span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </GalleryMotion>
  );
}
