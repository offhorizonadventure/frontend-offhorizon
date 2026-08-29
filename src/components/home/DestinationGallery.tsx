import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { ArrowRight } from "@/components/ui/icons";
import { Flag } from "@/components/ui/Flag";
import { destinations } from "@/config/destinations";
import { runningByCountry } from "@/lib/catalogue-counts";
import { Link } from "@/i18n/navigation";

import { GalleryMotion } from "./GalleryMotion";

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
              {}
              <span data-dg-image data-parallax="7" className="absolute inset-[-7%]">
                <Image
                  src={destination.image}
                  alt={td(destination.key)}
                  fill
                  priority
                  sizes="(max-width: 767px) 78vw, (max-width: 1023px) 46vw, 40vw"
                  quality={90}
                  className="ease-out-expo object-cover transition-transform duration-[1400ms] group-hover:scale-[1.06]"
                />
              </span>

              <span className="dg-scrim" aria-hidden />

              {}
              <span className="dg-label-vertical" aria-hidden>
                {td(destination.key)}
              </span>

              {}
              <span className="dg-label-block">
                <span className="flex items-center gap-2.5">
                  <Flag country={destination.flag} />
                  <span className="font-display text-[20px] leading-none font-bold tracking-[-0.02em] text-white">
                    {td(destination.key)}
                  </span>
                </span>

                <span className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-[10.5px] font-semibold tracking-[0.16em] text-white/70 uppercase">
                    {}
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
