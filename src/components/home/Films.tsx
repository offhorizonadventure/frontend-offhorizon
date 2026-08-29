import { getTranslations } from "next-intl/server";

import { Topo } from "@/components/ui/Topo";
import { films, formatDuration, isoDuration, thumbnailUrl } from "@/config/videos";
import { cn } from "@/lib/cn";

import { VideoPlayer } from "./VideoPlayer";

export async function Films() {
  const t = await getTranslations("home.films");

  const [lead, ...rest] = films;

  const schema = films.map((film) => ({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: t(`items.${film.key}`),
    description: t(`items.${film.key}`),
    thumbnailUrl: thumbnailUrl(film.youtubeId),
    duration: isoDuration(film.seconds),
    embedUrl: `https://www.youtube-nocookie.com/embed/${film.youtubeId}`,
    contentUrl: `https://www.youtube.com/watch?v=${film.youtubeId}`,
  }));

  return (
    <section className="bg-cream-50 relative overflow-hidden py-20 sm:py-28">
      <Topo className="text-brand-800/12" rings={11} seed={6.2} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />

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

        <div data-anim-group className="mt-11 grid gap-4 sm:mt-14 lg:grid-cols-12">
          <article
            className={cn(
              "bg-brand-950 ring-brand-900/10 relative overflow-hidden rounded-[24px] ring-1",
              "aspect-video lg:col-span-7 lg:row-span-2 lg:aspect-auto",
            )}
          >
            <VideoPlayer
              youtubeId={lead.youtubeId}
              title={t(`items.${lead.key}`)}
              duration={formatDuration(lead.seconds)}
              poster={lead.poster}
              playLabel={t("play")}
              closeLabel={t("close")}
              featured
              sizes="(max-width: 1023px) 92vw, 640px"
            />
          </article>

          {rest.map((film) => (
            <article
              key={film.key}
              className="bg-brand-950 ring-brand-900/10 relative aspect-video overflow-hidden rounded-[24px] ring-1 lg:col-span-5"
            >
              <VideoPlayer
                youtubeId={film.youtubeId}
                title={t(`items.${film.key}`)}
                duration={formatDuration(film.seconds)}
                poster={film.poster}
                playLabel={t("play")}
                closeLabel={t("close")}
                sizes="(max-width: 1023px) 92vw, 440px"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
