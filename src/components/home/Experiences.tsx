import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { ArrowRight } from "@/components/ui/icons";
import { Topo } from "@/components/ui/Topo";
import { experiences } from "@/config/experiences";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

/** Short proof points pulled out of each description. */
const features = {
  motorcycle: [
    "motorcycle.features.backup",
    "motorcycle.features.mechanic",
    "motorcycle.features.safety",
  ],
  selfDrive: [
    "selfDrive.features.lead",
    "selfDrive.features.terrain",
    "selfDrive.features.logistics",
  ],
} as const;

/** The positioning statement and the two expedition formats. */
export async function Experiences() {
  const t = await getTranslations("home.about");
  const tw = await getTranslations("home.ways");

  return (
    <section className="bg-brand-950 text-cream-100 relative overflow-hidden py-24 sm:py-32">
      <Topo className="text-cream-100/12" rings={18} seed={2.1} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_0%,rgba(180,95,43,0.22),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div data-anim="up">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
                <span aria-hidden className="bg-ember-500/60 h-px w-8" />
                {t("eyebrow")}
              </span>
              <h2 className="font-display mt-6 text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.04] font-extrabold tracking-[-0.035em] text-balance">
                {t("title")}
              </h2>
            </div>

            <div className="lg:col-span-5 lg:pt-20">
              <p className="text-cream-100/60 text-[15px] leading-[1.85] text-pretty sm:text-[16px]">
                {t("body")}
              </p>
            </div>
          </div>
        </div>

        <div data-anim="up" className="mt-20 sm:mt-28">
          <h3 className="font-display text-[clamp(1.3rem,2.6vw,2.1rem)] leading-tight font-extrabold tracking-[-0.03em]">
            {tw("title")}
          </h3>
        </div>

        <div className="mt-10 space-y-16 sm:mt-14 sm:space-y-24">
          {experiences.map((experience, index) => {
            const flipped = index % 2 === 1;

            return (
              <article
                key={experience.key}
                className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14"
              >
                <div
                  data-anim="wipe"
                  className={cn(
                    "lg:col-span-7",
                    flipped ? "lg:order-2 lg:col-start-6" : "lg:order-1",
                  )}
                >
                  <Link
                    href={experience.href}
                    tabIndex={-1}
                    aria-hidden
                    className="group ring-cream-100/15 relative block overflow-hidden rounded-[28px] ring-1"
                  >
                    <span className="relative block aspect-[4/3]">
                      <Image
                        src={experience.image}
                        alt={tw(`${experience.key}.name`)}
                        fill
                        sizes="(max-width: 1023px) 92vw, 640px"
                        className="ease-out-expo object-cover transition-transform duration-[1200ms] group-hover:scale-[1.05]"
                      />
                      {/* Warms the photography toward the brand palette. */}
                      <span className="from-brand-950/70 via-brand-950/10 absolute inset-0 bg-gradient-to-t to-transparent" />
                    </span>

                    <span className="font-display text-cream-100/85 absolute top-5 left-6 text-[64px] leading-none font-extrabold tabular-nums sm:text-[84px]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </div>

                <div
                  data-anim="up"
                  className={cn(
                    "lg:col-span-5",
                    flipped ? "lg:order-1 lg:col-start-1 lg:row-start-1" : "lg:order-2",
                  )}
                >
                  <h4 className="font-display text-[clamp(1.4rem,2.4vw,2rem)] leading-[1.1] font-extrabold tracking-[-0.03em]">
                    {tw(`${experience.key}.name`)}
                  </h4>

                  <p className="text-cream-100/55 mt-4 text-[14.5px] leading-[1.8] text-pretty">
                    {tw(`${experience.key}.description`)}
                  </p>

                  <ul className="mt-7 flex flex-wrap gap-2">
                    {features[experience.key].map((feature) => (
                      <li
                        key={feature}
                        className="border-cream-100/18 text-cream-100/75 rounded-full border px-3.5 py-1.5 text-[10.5px] font-semibold tracking-[0.13em] uppercase"
                      >
                        {tw(feature)}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={experience.href}
                    className="group text-cream-100 mt-8 inline-flex items-center gap-3 text-[11px] font-bold tracking-[0.16em] uppercase"
                  >
                    <span
                      aria-hidden
                      className="bg-ember-500 ease-out-expo h-px w-8 transition-all duration-500 group-hover:w-14"
                    />
                    {tw("cta")}
                    <ArrowRight className="text-ember-500 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
