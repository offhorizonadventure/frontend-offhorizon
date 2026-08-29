import { getTranslations } from "next-intl/server";

import { PARTNER_REPEATS, partners } from "@/config/partners";
import { FOUNDED_YEAR } from "@/config/facts";

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
            <span className="text-ember-600 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
              <span aria-hidden className="bg-ember-600/50 h-px w-8" />
              {t("eyebrow")}
            </span>
            <h2 className="font-display text-brand-900 mt-4 max-w-lg text-[clamp(1.4rem,2.8vw,2rem)] leading-[1.12] font-extrabold tracking-[-0.03em] text-balance">
              {t("title")}
            </h2>
          </div>

          <div className="sm:text-right">
            <p className="text-brand-800/55 max-w-xs text-[13.5px] leading-relaxed">{t("note")}</p>
            <p className="text-brand-500 mt-3 text-[10px] font-bold tracking-[0.18em] uppercase tabular-nums">
              {t("since", { year: FOUNDED_YEAR })}
            </p>
          </div>
        </div>
      </div>

      {}
      <div className="border-brand-900/12 mt-11 border-y sm:mt-14">
        <div className="pm-marquee">
          <ul className="pm-track">
            {Array.from({ length: PARTNER_REPEATS }).flatMap((_, pass) =>
              partners.map((partner) => (
                <li
                  key={`${pass}-${partner.slug}`}
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
                      alt={partner.name}
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
