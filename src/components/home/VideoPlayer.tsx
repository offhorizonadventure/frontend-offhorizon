"use client";

import Image, { type StaticImageData } from "next/image";
import { useState } from "react";

import { cn } from "@/lib/cn";

type VideoPlayerProps = {
  youtubeId: string;
  title: string;
  duration: string;
  poster: StaticImageData;
  playLabel: string;
  /** Larger type and play button for the lead film. */
  featured?: boolean;
  sizes: string;
};

/**
 * Facade embed.
 *
 * Nothing is loaded from Google until the visitor presses play: no iframe, no
 * player script, no cookies. An eager YouTube embed costs several hundred KB
 * of third-party JavaScript per video, which for three films would undo the
 * page's performance budget on its own.
 *
 * On click the poster is replaced by a `youtube-nocookie.com` iframe with
 * autoplay, so the click both starts the video and acts as the consent moment.
 */
export function VideoPlayer({
  youtubeId,
  title,
  duration,
  poster,
  playLabel,
  featured = false,
  sizes,
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const ready = youtubeId.length > 0;

  if (playing && ready) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      disabled={!ready}
      aria-label={`${playLabel}: ${title}`}
      className="group/v absolute inset-0 h-full w-full cursor-pointer text-left disabled:cursor-default"
    >
      <Image
        src={poster}
        alt=""
        fill
        placeholder="blur"
        sizes={sizes}
        className="object-cover transition-transform duration-[1200ms] ease-out-expo group-hover/v:scale-[1.05]"
      />

      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-brand-950/85 via-brand-950/25 to-brand-950/10"
      />

      {/* Play control */}
      <span
        aria-hidden
        className={cn(
          "absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cream-100/15 ring-1 ring-cream-100/40 backdrop-blur-md transition-all duration-500 ease-out-expo",
          featured ? "size-20" : "size-14",
          ready && "group-hover/v:scale-110 group-hover/v:bg-ember-500 group-hover/v:ring-ember-500",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          className={cn(
            "translate-x-[2px] fill-cream-100 transition-colors duration-500",
            ready && "group-hover/v:fill-brand-950",
          )}
          width={featured ? 26 : 18}
          height={featured ? 26 : 18}
        >
          <path d="M8 5.5v13l11-6.5z" />
        </svg>
      </span>

      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
        <span className="min-w-0">
          <span
            className={cn(
              "font-display block leading-tight font-bold tracking-[-0.02em] text-white text-pretty",
              featured ? "text-[19px] sm:text-[23px]" : "text-[15px]",
            )}
          >
            {title}
          </span>
        </span>

        <span className="shrink-0 rounded-full bg-brand-950/60 px-2.5 py-1 text-[11px] font-semibold text-white/85 tabular-nums backdrop-blur-sm">
          {duration}
        </span>
      </span>
    </button>
  );
}
