import { getTranslations } from "next-intl/server";

import { Star } from "@/components/ui/icons";
import { Topo } from "@/components/ui/Topo";

const platforms = ["Google", "TripAdvisor", "Trustpilot"] as const;

/**
 * Social proof without inventing testimonials.
 *
 * No individual reviews are quoted here, because nothing has been supplied to
 * quote. The section points at the platforms where the real ones live instead
 * of filling the space with placeholder praise.
 */
export async function Riders() {
  const t = await getTranslations("about.riders");

  return (
    <section className="relative overflow-hidden bg-cream-50 py-20 sm:py-28">
      <Topo className="text-brand-800/12" rings={10} seed={11.8} />

      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <div data-anim="up">
          <span className="inline-flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase">
            <span aria-hidden className="h-px w-8 bg-ember-500/60" />
            {t("eyebrow")}
            <span aria-hidden className="h-px w-8 bg-ember-500/60" />
          </span>

          <h2 className="font-display mt-6 text-[clamp(1.85rem,3.8vw,2.9rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance text-brand-900">
            {t("title")}
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-[1.85] text-pretty text-brand-800/60 sm:text-[16px]">
            {t("body")}
          </p>
        </div>

        <div data-anim="up" className="mt-10 flex flex-col items-center gap-6 sm:mt-12">
          <span aria-hidden className="flex items-center gap-1 text-ember-500">
            {Array.from({ length: 5 }).map((_, star) => (
              <Star key={star} className="size-4" />
            ))}
          </span>

          <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            {platforms.map((platform, index) => (
              <li key={platform} className="flex items-center gap-3">
                <span className="font-display text-[15px] font-bold tracking-[-0.01em] text-brand-800">
                  {platform}
                </span>
                {index < platforms.length - 1 && (
                  <span aria-hidden className="size-1 rounded-full bg-brand-300" />
                )}
              </li>
            ))}
          </ul>
        </div>

        <p data-anim="up" className="mx-auto mt-10 max-w-xl text-[14px] leading-[1.8] text-pretty text-brand-800/45">
          {t("thanks")}
        </p>
      </div>
    </section>
  );
}
