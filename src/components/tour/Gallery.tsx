"use client";

import Image from "next/image";

import { blurOf, type ImageSource } from "@/lib/image-source";
import { useCallback, useEffect, useRef, useState } from "react";

import { ChevronDown, Close } from "@/components/ui/icons";

export type GalleryItem = { image: ImageSource; alt: string };

/** A stable key for either kind of source. */
const keyOf = (image: ImageSource) => (typeof image === "string" ? image : image.src);

/**
 * Photo gallery with a lightbox.
 *
 * The grid is plain server-rendered markup as far as the browser is concerned;
 * the lightbox only mounts once something is opened, so the closed state costs
 * nothing but the click handlers.
 *
 * Arrow keys and Escape work, focus is returned to the thumbnail that opened
 * it, and the page behind is locked while it is up.
 */
export function Gallery({
  eyebrow,
  title,
  items,
  labels,
}: {
  eyebrow: string;
  title: string;
  items: GalleryItem[];
  labels: { open: string; close: string; previous: string; next: string; counter: string };
}) {
  const [index, setIndex] = useState<number | null>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const open = index !== null;

  const close = useCallback(() => {
    setIndex((current) => {
      if (current !== null) triggers.current[current]?.focus();
      return null;
    });
  }, []);

  const step = useCallback(
    (delta: number) => setIndex((current) => (current === null ? null : (current + delta + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    // Locking the body rather than the html element, so the scrollbar gutter
    // does not disappear and shift the page underneath.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, step]);

  const current = index === null ? null : items[index];

  return (
    <section className="bg-white py-18 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div data-anim="up">
          <span className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase">
            <span aria-hidden className="h-px w-8 bg-ember-500/60" />
            {eyebrow}
          </span>
          <h2 className="font-display mt-5 text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-brand-900">
            {title}
          </h2>
        </div>

        <ul data-anim-group className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {items.map((item, position) => (
            <li key={keyOf(item.image) + position}>
              <button
                type="button"
                ref={(node) => {
                  triggers.current[position] = node;
                }}
                onClick={() => setIndex(position)}
                aria-label={`${labels.open}: ${item.alt}`}
                className="group relative block aspect-[4/3] w-full overflow-hidden rounded-[18px] bg-brand-100 ring-1 ring-brand-900/10 transition-transform duration-500 ease-out-expo hover:-translate-y-1 focus-visible:-translate-y-1"
              >
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  {...blurOf(item.image)}
                  sizes="(max-width: 639px) 46vw, (max-width: 1023px) 46vw, 280px"
                  quality={90}
                  className="object-cover transition-transform duration-[1100ms] ease-out-expo group-hover:scale-[1.06]"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-brand-950/0 transition-colors duration-300 group-hover:bg-brand-950/15"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {open && current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-90 flex flex-col bg-brand-950/97 backdrop-blur-sm"
        >
          {/* Backdrop click closes. Sits under the controls. */}
          <button
            type="button"
            aria-label={labels.close}
            onClick={close}
            className="absolute inset-0 cursor-default"
          />

          <div className="relative flex items-center justify-between px-5 py-5 sm:px-8">
            <p className="text-[11px] font-bold tracking-[0.16em] text-cream-100/50 uppercase tabular-nums">
              {labels.counter
                .replace("{current}", String(index + 1))
                .replace("{total}", String(items.length))}
            </p>
            <button
              type="button"
              onClick={close}
              aria-label={labels.close}
              className="flex size-11 items-center justify-center rounded-full text-cream-100 ring-1 ring-cream-100/25 transition-colors duration-300 hover:bg-cream-100/10"
            >
              <Close />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center gap-2 px-3 sm:gap-4 sm:px-6">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label={labels.previous}
              className="flex size-11 shrink-0 items-center justify-center rounded-full text-cream-100 ring-1 ring-cream-100/25 transition-colors duration-300 hover:bg-cream-100/10"
            >
              <ChevronDown className="rotate-90" />
            </button>

            <figure className="relative flex min-h-0 flex-1 flex-col items-center">
              <Image
                key={keyOf(current.image)}
                src={current.image}
                alt={current.alt}
                {...blurOf(current.image)}
                // A bundled import brings its own dimensions; a URL from
                // storage does not, and Next needs a pair either way. These are
                // the intrinsic ratio, not the rendered size, which
                // `object-contain` decides.
                width={1600}
                height={1200}
                sizes="(max-width: 767px) 92vw, 70vw"
                quality={90}
                className="max-h-full w-auto rounded-2xl object-contain"
              />
              <figcaption className="mt-4 max-w-xl text-center text-[12.5px] text-balance text-cream-100/55">
                {current.alt}
              </figcaption>
            </figure>

            <button
              type="button"
              onClick={() => step(1)}
              aria-label={labels.next}
              className="flex size-11 shrink-0 items-center justify-center rounded-full text-cream-100 ring-1 ring-cream-100/25 transition-colors duration-300 hover:bg-cream-100/10"
            >
              <ChevronDown className="-rotate-90" />
            </button>
          </div>

          <div className="relative flex gap-2 overflow-x-auto px-5 py-5 [scrollbar-width:none] sm:px-8 [&::-webkit-scrollbar]:hidden">
            {items.map((item, position) => (
              <button
                key={keyOf(item.image) + position}
                type="button"
                onClick={() => setIndex(position)}
                aria-label={item.alt}
                aria-current={position === index}
                className={`relative size-14 shrink-0 overflow-hidden rounded-lg transition-opacity duration-300 sm:size-16 ${
                  position === index
                    ? "opacity-100 ring-2 ring-ember-500"
                    : "opacity-45 hover:opacity-80"
                }`}
              >
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="64px"
                  quality={90}
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
