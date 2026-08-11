import { getTranslations } from "next-intl/server";

import { PARTNER_REPEATS, partners } from "@/config/partners";
import { FOUNDED_YEAR } from "@/config/facts";

/**
 * Partner frieze.
 *
 * The heading sits in the container, then the logos run in a full-bleed band
 * ruled top and bottom. Edge to edge with hairline rules is what separates
 * this from a boxed widget: it reads as a frieze across the page rather than
 * a component dropped onto it.
 *
 * Motion is CSS only. The set repeats PARTNER_REPEATS times and the track
 * slides exactly one set width, so the loop is seamless with no JavaScript.
 * It pauses on hover and on keyboard focus, and holds still for reduced
 * motion.
 */
export async function Partners() {
  const t = await getTranslations("home.partners");

  return (
    <section className="bg-cream-100 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div
          data-anim="up"
          className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <span className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-600 uppercase">
              <span aria-hidden className="h-px w-8 bg-ember-600/50" />
              {t("eyebrow")}
            </span>
            <h2 className="font-display mt-4 max-w-lg text-[clamp(1.4rem,2.8vw,2rem)] leading-[1.12] font-extrabold tracking-[-0.03em] text-balance text-brand-900">
              {t("title")}
            </h2>
          </div>

          <div className="sm:text-right">
            <p className="max-w-xs text-[13.5px] leading-relaxed text-brand-800/55">{t("note")}</p>
            <p className="mt-3 text-[10px] font-bold tracking-[0.18em] text-brand-500 uppercase tabular-nums">
              {t("since", { year: FOUNDED_YEAR })}
            </p>
          </div>
        </div>
      </div>

      {/* Full bleed: the band runs to both edges of the viewport. */}
      <div className="mt-11 border-y border-brand-900/12 sm:mt-14">
        <div className="pm-marquee">
          <ul className="pm-track">
            {Array.from({ length: PARTNER_REPEATS }).flatMap((_, pass) =>
              partners.map((partner) => (
                <li
                  key={`${pass}-${partner.slug}`}
                  // Only the first pass is real content; the rest is filler.
                  aria-hidden={pass > 0}
                  className="pm-slot group"
                >
                  <span className="relative block h-full w-full">
                    {/* eslint-disable @next/next/no-img-element */}
                    <img
                      src={`/partners/${partner.slug}-mono.png`}
                      alt={pass === 0 ? partner.name : ""}
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
                </li>
              )),
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
