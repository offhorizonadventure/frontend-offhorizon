import { getTranslations } from "next-intl/server";

import { ArrowRight } from "@/components/ui/icons";
import { Topo } from "@/components/ui/Topo";

const lessons = ["terrain", "altitude", "vehicles", "logistics"] as const;

const BRB_URL = "https://www.bikerentalsbhuntar.com/";

export async function Journey() {
  const t = await getTranslations("about.journey");

  return (
    <section className="bg-cream-50 relative overflow-hidden py-20 sm:py-28">
      <Topo className="text-brand-800/12" rings={12} seed={9.1} />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div data-anim="up" className="max-w-2xl">
          <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
            <span aria-hidden className="bg-ember-500/60 h-px w-8" />
            {t("eyebrow")}
          </span>
          <h2 className="font-display text-brand-900 mt-5 text-[clamp(1.85rem,3.6vw,2.9rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance">
            {t("title")}
          </h2>
        </div>

        {}
        <ol className="mt-14 sm:mt-16">
          <li
            data-anim="up"
            className="border-brand-900/15 relative grid gap-4 border-l pb-14 pl-8 sm:grid-cols-12 sm:gap-10 sm:pl-12"
          >
            <span
              aria-hidden
              className="bg-ember-500 ring-cream-50 absolute top-1.5 -left-[5px] size-2.5 rounded-full ring-4"
            />
            <div className="sm:col-span-3">
              <span className="font-display text-brand-800 text-[22px] leading-none font-extrabold tabular-nums">
                2014
              </span>
            </div>
            <div className="sm:col-span-9">
              <h3 className="font-display text-brand-900 text-[19px] leading-tight font-bold tracking-[-0.02em] sm:text-[21px]">
                {t("start.title")}
              </h3>
              <p className="text-brand-800/60 mt-3 max-w-xl text-[14.5px] leading-[1.8] text-pretty">
                {t.rich("start.body", {
                  brb: (chunks) => (
                    <a
                      href={BRB_URL}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-brand-800 decoration-ember-500/50 hover:decoration-ember-500 font-semibold underline underline-offset-4 transition-colors"
                    >
                      {chunks}
                    </a>
                  ),
                })}
              </p>
            </div>
          </li>

          <li
            data-anim="up"
            className="border-brand-900/15 relative grid gap-4 border-l pb-14 pl-8 sm:grid-cols-12 sm:gap-10 sm:pl-12"
          >
            <span
              aria-hidden
              className="bg-brand-400 ring-cream-50 absolute top-1.5 -left-[5px] size-2.5 rounded-full ring-4"
            />
            <div className="sm:col-span-3">
              <span className="text-brand-500 text-[10.5px] font-bold tracking-[0.18em] uppercase">
                {t("learned.label")}
              </span>
            </div>
            <div className="sm:col-span-9">
              <h3 className="font-display text-brand-900 text-[19px] leading-tight font-bold tracking-[-0.02em] sm:text-[21px]">
                {t("learned.title")}
              </h3>
              <ul className="bg-brand-900/10 mt-5 grid gap-px overflow-hidden rounded-2xl sm:grid-cols-2">
                {lessons.map((lesson) => (
                  <li
                    key={lesson}
                    className="bg-cream-50 text-brand-800/70 p-4 text-[13.5px] leading-relaxed"
                  >
                    {t(`learned.items.${lesson}`)}
                  </li>
                ))}
              </ul>
            </div>
          </li>

          <li
            data-anim="up"
            className="relative grid gap-4 pl-8 sm:grid-cols-12 sm:gap-10 sm:pl-12"
          >
            <span
              aria-hidden
              className="bg-brand-800 ring-cream-50 absolute top-1.5 -left-[5px] size-2.5 rounded-full ring-4"
            />
            <div className="sm:col-span-3">
              <span className="text-brand-500 text-[10.5px] font-bold tracking-[0.18em] uppercase">
                {t("today.label")}
              </span>
            </div>
            <div className="sm:col-span-9">
              <h3 className="font-display text-brand-900 text-[19px] leading-tight font-bold tracking-[-0.02em] sm:text-[21px]">
                {t("today.title")}
              </h3>
              <p className="text-brand-800/60 mt-3 max-w-xl text-[14.5px] leading-[1.8] text-pretty">
                {t("today.body")}
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <a
                  href={BRB_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group border-brand-900/12 hover:border-brand-900/25 rounded-3xl border bg-white/60 p-6 transition-colors duration-500"
                >
                  <span className="text-brand-400 text-[10px] font-bold tracking-[0.18em] uppercase">
                    {t("divisions.rentalsLabel")}
                  </span>
                  <span className="font-display text-brand-900 mt-3 flex items-center gap-2 text-[17px] font-bold tracking-[-0.02em]">
                    BRB Expeditions
                    <ArrowRight className="text-brand-500 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <span className="text-brand-800/60 mt-2.5 block text-[13.5px] leading-relaxed">
                    {t("divisions.rentals")}
                  </span>
                </a>

                <div className="border-brand-800 bg-brand-800 text-cream-100 rounded-3xl border p-6">
                  <span className="text-cream-100/50 text-[10px] font-bold tracking-[0.18em] uppercase">
                    {t("divisions.expeditionsLabel")}
                  </span>
                  <span className="font-display mt-3 block text-[17px] font-bold tracking-[-0.02em]">
                    Offhorizon Adventure
                  </span>
                  <span className="text-cream-100/60 mt-2.5 block text-[13.5px] leading-relaxed">
                    {t("divisions.expeditions")}
                  </span>
                </div>
              </div>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
