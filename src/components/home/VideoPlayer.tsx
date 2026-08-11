"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Close } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

type VideoPlayerProps = {
  youtubeId: string;
  title: string;
  duration: string;
  poster: StaticImageData;
  playLabel: string;
  closeLabel: string;
  /** Larger type and play button for the lead film. */
  featured?: boolean;
  sizes: string;
};

type Phase = "closed" | "open" | "closing";

/**
 * Poster card that opens the film in a lightbox.
 *
 * Two reasons it is not played inline: the card is small, so YouTube's own
 * title bar and controls end up covering most of the frame, and the branded
 * chrome sits badly inside the site's own card design. A wide overlay gives
 * the footage the room it needs and leaves the grid intact.
 *
 * It stays a facade either way. No iframe, player script or cookie exists
 * until the visitor presses play, so the click is also the consent moment.
 */
export function VideoPlayer({
  youtubeId,
  title,
  duration,
  poster,
  playLabel,
  closeLabel,
  featured = false,
  sizes,
}: VideoPlayerProps) {
  const [phase, setPhase] = useState<Phase>("closed");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const isOpen = phase === "open";

  useEffect(() => {
    if (!isOpen) return;

    const { style } = document.body;
    const previous = style.overflow;
    style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPhase("closing");
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const lightbox =
    phase === "closed" ? null : (
      <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-8">
        <div
          onClick={() => setPhase("closing")}
          className={cn(
            "absolute inset-0 bg-brand-950/90 backdrop-blur-lg",
            isOpen ? "animate-fade-in" : "animate-fade-out",
          )}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onAnimationEnd={() => {
            if (phase === "closing") {
              setPhase("closed");
              triggerRef.current?.focus();
            }
          }}
          className={cn(
            "relative w-full max-w-5xl",
            isOpen ? "animate-modal-in" : "animate-modal-out",
          )}
        >
          <div className="flex items-center justify-between gap-4 pb-3">
            <p className="font-display truncate text-[14px] font-bold tracking-[-0.01em] text-cream-100 sm:text-[16px]">
              {title}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setPhase("closing")}
              aria-label={closeLabel}
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-cream-100/25 text-cream-100 transition-colors hover:bg-cream-100 hover:text-brand-950"
            >
              <Close />
            </button>
          </div>

          <div className="relative aspect-video overflow-hidden rounded-2xl bg-black ring-1 ring-cream-100/15">
            {isOpen && (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            )}
          </div>
        </div>
      </div>
    );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setPhase("open")}
        aria-label={`${playLabel}: ${title}`}
        aria-haspopup="dialog"
        className="group/v absolute inset-0 h-full w-full cursor-pointer text-left"
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
          className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/15 to-brand-950/5"
        />

        {/* Solid disc rather than a frosted one: a translucent blur over
            photography reads as a smudge and the triangle loses contrast. */}
        <span
          aria-hidden
          className={cn(
            "absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full",
            "bg-cream-50 shadow-[0_8px_28px_-6px_rgba(42,16,2,0.55)]",
            "transition-[transform,background-color] duration-400 ease-out-expo",
            "group-hover/v:scale-[1.08] group-hover/v:bg-ember-500",
            featured ? "size-16 sm:size-[4.5rem]" : "size-13",
          )}
        >
          {/* Nudged right by 6% so the triangle reads optically centred. */}
          <svg
            viewBox="0 0 16 16"
            width={featured ? 22 : 17}
            height={featured ? 22 : 17}
            className="translate-x-[6%] fill-brand-900 transition-colors duration-400 group-hover/v:fill-cream-50"
          >
            <path d="M3.4 1.9a.9.9 0 0 1 1.36-.77l8.4 5.1a.9.9 0 0 1 0 1.54l-8.4 5.1a.9.9 0 0 1-1.36-.77z" />
          </svg>
        </span>

        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
          <span
            className={cn(
              "font-display min-w-0 leading-tight font-bold tracking-[-0.02em] text-white text-pretty",
              featured ? "text-[19px] sm:text-[23px]" : "text-[15px]",
            )}
          >
            {title}
          </span>

          <span className="shrink-0 rounded-full bg-brand-950/65 px-2.5 py-1 text-[11px] font-semibold text-white/90 tabular-nums backdrop-blur-sm">
            {duration}
          </span>
        </span>
      </button>

      {/* Safe on the server: `phase` starts closed, so this only runs after a click. */}
      {lightbox ? createPortal(lightbox, document.body) : null}
    </>
  );
}
