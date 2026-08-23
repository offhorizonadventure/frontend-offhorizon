import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { ArrowRight } from "@/components/ui/icons";
import { Flag } from "@/components/ui/Flag";
import { destinations } from "@/config/destinations";
import { runningByCountry } from "@/lib/catalogue-counts";
import { Link } from "@/i18n/navigation";

import { GalleryMotion } from "./GalleryMotion";

/** Destination gallery. */
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
                  // Above the fold, and the entrance clips panels to zero area, which defers a lazy load.
                  priority
                  sizes="(max-width: 767px) 78vw, (max-width: 1023px) 46vw, 40vw"
                  quality={90}
                  className="ease-out-expo object-cover transition-transform duration-[1400ms] group-hover:scale-[1.06]"
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
                  <span className="group-hover:text-brand-900 flex size-9 items-center justify-center rounded-full bg-white/12 text-white ring-1 ring-white/25 backdrop-blur-sm transition-colors duration-300 group-hover:bg-white">
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
