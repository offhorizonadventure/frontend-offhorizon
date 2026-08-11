import { getTranslations } from "next-intl/server";

import { Topo } from "@/components/ui/Topo";
import { PARTNER_REPEATS, partners } from "@/config/partners";

/**
 * Partner logo strip.
 *
 * The row is a CSS-only marquee: the set repeats PARTNER_REPEATS times and the
 * track slides by exactly one set width, so the loop is seamless with no
 * JavaScript. It pauses on hover and on keyboard focus, and holds still for
 * reduced-motion users.
 *
 * The strip sits inside a bordered plate with the label breaking the top edge,
 * which gives the section a frame instead of leaving the logos floating in
 * open space.
 */
export async function Partners() {
  const t = await getTranslations("home.partners");

  return (
    <section className="relative overflow-hidden bg-cream-50 py-16 sm:py-24">
      <Topo className="text-brand-800/12" rings={10} seed={3.4} />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div
          data-anim="up"
          className="relative rounded-[32px] border border-brand-900/12 bg-paper/60 px-4 pt-11 pb-8 backdrop-blur-[2px] sm:px-8 sm:pt-12"
        >
          {/* Label breaks the border like a fieldset legend. */}
          <span className="absolute -top-[9px] left-1/2 -translate-x-1/2 bg-cream-50 px-4 text-[10.5px] font-bold tracking-[0.22em] whitespace-nowrap text-brand-600 uppercase">
            {t("eyebrow")}
          </span>

          <p className="mx-auto max-w-lg text-center text-[14.5px] leading-relaxed text-brand-800/55">
            {t("note")}
          </p>

          <div className="marquee mt-9 sm:mt-11">
            <ul className="marquee-track">
              {Array.from({ length: PARTNER_REPEATS }).flatMap((_, pass) =>
                partners.map((partner) => (
                  <li
                    key={`${pass}-${partner.slug}`}
                    // Only the first pass is real content; the rest are filler.
                    aria-hidden={pass > 0}
                    className="partner-slot group"
                  >
                    <span className="relative block h-16 w-full sm:h-[4.5rem]">
                      {/* eslint-disable @next/next/no-img-element */}
                      <img
                        src={`/partners/${partner.slug}-mono.png`}
                        alt={pass === 0 ? partner.name : ""}
                        width={600}
                        height={200}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-contain opacity-65 transition-opacity duration-500 group-hover:opacity-0"
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
    </section>
  );
}
