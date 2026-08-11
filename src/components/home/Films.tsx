import { getTranslations } from "next-intl/server";

import { Topo } from "@/components/ui/Topo";
import { films } from "@/config/videos";
import { cn } from "@/lib/cn";

import { VideoPlayer } from "./VideoPlayer";

/**
 * Film strip.
 *
 * The lead film takes a wide 16:9 frame and the other two stack beside it, so
 * the row has a focal point instead of three equal thumbnails. Light section
 * with dark cards: the posters supply the contrast, which keeps the page from
 * running two dark bands together.
 */
export async function Films() {
  const t = await getTranslations("home.films");

  const [lead, ...rest] = films;

  return (
    <section className="relative overflow-hidden bg-cream-50 py-20 sm:py-28">
      <Topo className="text-brand-800/12" rings={11} seed={6.2} />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div data-anim="up" className="max-w-2xl">
          <span className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase">
            <span aria-hidden className="h-px w-8 bg-ember-500/60" />
            {t("eyebrow")}
          </span>
          <h2 className="font-display mt-5 text-[clamp(1.85rem,3.6vw,2.9rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance text-brand-900">
            {t("title")}
          </h2>
        </div>

        <div data-anim-group className="mt-11 grid gap-4 sm:mt-14 lg:grid-cols-12">
          <article
            className={cn(
              "relative overflow-hidden rounded-[24px] bg-brand-950 ring-1 ring-brand-900/10",
              "aspect-video lg:col-span-7 lg:row-span-2 lg:aspect-auto",
            )}
          >
            <VideoPlayer
              youtubeId={lead.youtubeId}
              title={t(`items.${lead.key}`)}
              duration={lead.duration}
              poster={lead.poster}
              playLabel={t("play")}
              featured
              sizes="(max-width: 1023px) 92vw, 640px"
            />
          </article>

          {rest.map((film) => (
            <article
              key={film.key}
              className="relative aspect-video overflow-hidden rounded-[24px] bg-brand-950 ring-1 ring-brand-900/10 lg:col-span-5"
            >
              <VideoPlayer
                youtubeId={film.youtubeId}
                title={t(`items.${film.key}`)}
                duration={film.duration}
                poster={film.poster}
                playLabel={t("play")}
                sizes="(max-width: 1023px) 92vw, 440px"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
