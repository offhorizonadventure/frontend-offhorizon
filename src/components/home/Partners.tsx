import { getTranslations } from "next-intl/server";

import { Topo } from "@/components/ui/Topo";
import { PARTNER_REPEATS, partners } from "@/config/partners";

/**
 * Partner logo strip.
 *
 * Laid out asymmetrically: the label holds a fixed column on the left and the
 * strip runs off the right edge of the viewport. Bleeding past the container
 * implies the row continues rather than being a closed box of five, which is
 * what a centred plate made it look like.
 *
 * The marquee itself is CSS only. The set repeats PARTNER_REPEATS times and
 * the track slides by exactly one set width, so the loop is seamless with no
 * JavaScript. It pauses on hover and on keyboard focus, and holds still for
 * reduced-motion visitors.
 */
export async function Partners() {
  const t = await getTranslations("home.partners");

  return (
    <section className="relative overflow-hidden bg-cream-50 py-16 sm:py-20">
      <Topo className="text-brand-800/12" rings={10} seed={3.4} />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
          <div data-anim="up" className="lg:col-span-4">
            <span className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase">
              <span aria-hidden className="h-px w-8 bg-ember-500/60" />
              {t("eyebrow")}
            </span>
            <p className="mt-4 max-w-sm text-[14.5px] leading-[1.75] text-pretty text-brand-800/60">
              {t("note")}
            </p>
          </div>

          {/* Runs to the viewport edge on large screens. */}
          <div className="lg:col-span-8 lg:-mr-[calc(50vw-50%)]">
            <div className="marquee">
              <ul className="marquee-track">
                {Array.from({ length: PARTNER_REPEATS }).flatMap((_, pass) =>
                  partners.map((partner) => (
                    <li
                      key={`${pass}-${partner.slug}`}
                      // Only the first pass is real content; the rest is filler.
                      aria-hidden={pass > 0}
                      className="partner-slot group"
                    >
                      <span className="relative block h-14 w-full sm:h-16">
                        {/* eslint-disable @next/next/no-img-element */}
                        <img
                          src={`/partners/${partner.slug}-mono.png`}
                          alt={pass === 0 ? partner.name : ""}
                          width={600}
                          height={200}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-contain opacity-60 transition-opacity duration-500 group-hover:opacity-0"
                        />
                        <img
                          src={`/partners/${partner.slug}.png`}
                          alt=""
                          aria-hidden
                          width={600}
                          height={200}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 h-full w-full scale-[0.98] object-contain opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100"
                        />
                        {/* eslint-enable @next/next/no-img-element */}
                      </span>
                    </li>
                  )),
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
