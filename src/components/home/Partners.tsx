import { getTranslations } from "next-intl/server";

import { ArrowRight } from "@/components/ui/icons";
import { partners } from "@/config/partners";
import { Link } from "@/i18n/navigation";

/**
 * Partner plate.
 *
 * A ruled grid rather than a scrolling strip. A marquee reads as decoration,
 * and these are credentials: a government ministry, a state tourism board and
 * a manufacturer. Setting them in a hairline grid, on the brand cream so the
 * band separates from the sections either side, treats them as a matter of
 * record.
 *
 * Six cells for five logos. The sixth is a solid brand tile, which fills what
 * would otherwise be a ragged gap and gives the block a weighted corner.
 */
export async function Partners() {
  const t = await getTranslations("home.partners");

  return (
    <section className="bg-cream-100 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div data-anim="up" className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-600 uppercase">
              <span aria-hidden className="h-px w-8 bg-ember-600/50" />
              {t("eyebrow")}
            </span>
            <h2 className="font-display mt-4 max-w-lg text-[clamp(1.4rem,2.8vw,2rem)] leading-[1.12] font-extrabold tracking-[-0.03em] text-balance text-brand-900">
              {t("title")}
            </h2>
          </div>

          <p className="max-w-xs text-[13.5px] leading-relaxed text-brand-800/55 sm:text-right">
            {t("note")}
          </p>
        </div>

        <ul
          data-anim-group
          className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[24px] bg-brand-900/12 sm:mt-12 sm:grid-cols-3"
        >
          {partners.map((partner) => (
            <li key={partner.slug} className="group relative bg-cream-100">
              <span className="flex aspect-[5/3] items-center justify-center px-6 transition-colors duration-500 group-hover:bg-cream-50 sm:px-10">
                <span className="relative block h-12 w-full sm:h-14">
                  {/* eslint-disable @next/next/no-img-element */}
                  <img
                    src={`/partners/${partner.slug}-mono.png`}
                    alt={partner.name}
                    width={600}
                    height={200}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-contain opacity-70 transition-opacity duration-500 group-hover:opacity-0"
                  />
                  <img
                    src={`/partners/${partner.slug}.png`}
                    alt=""
                    aria-hidden
                    width={600}
                    height={200}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full scale-[0.97] object-contain opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100"
                  />
                  {/* eslint-enable @next/next/no-img-element */}
                </span>
              </span>
            </li>
          ))}

          {/* Sixth cell squares the grid and anchors it. */}
          <li className="bg-brand-800 text-cream-100">
            <Link
              href="/about-us"
              className="group flex aspect-[5/3] flex-col justify-between p-6 transition-colors duration-500 hover:bg-brand-900 sm:p-7"
            >
              <span className="text-[10px] font-bold tracking-[0.18em] text-cream-100/50 uppercase">
                {t("tile.label")}
              </span>
              <span>
                <span className="font-display block text-[16px] leading-tight font-bold tracking-[-0.02em] sm:text-[17px]">
                  {t("tile.title")}
                </span>
                <span className="mt-3 flex items-center gap-2 text-[10.5px] font-bold tracking-[0.14em] text-cream-100/70 uppercase">
                  {t("tile.cta")}
                  <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
