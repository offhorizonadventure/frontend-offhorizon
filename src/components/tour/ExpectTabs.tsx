"use client";

import Image, { type StaticImageData } from "next/image";
import { useId, useState } from "react";

export type ExpectItem = {
  key: string;
  tab: string;
  title: string;
  body: string;
  image: StaticImageData;
};

/**
 * What to expect.
 *
 * Full bleed photograph with the copy sitting on it and a ruled tab strip
 * above. Every panel is rendered and only hidden, so the text is in the HTML
 * for crawlers and the images are decoded before the tab is clicked.
 *
 * Client side only because a tab strip needs a selection; it is a handful of
 * bytes and no library.
 */
export function ExpectTabs({ eyebrow, items }: { eyebrow: string; items: ExpectItem[] }) {
  const [active, setActive] = useState(0);
  const id = useId();

  return (
    <section className="relative isolate overflow-hidden bg-brand-950 text-cream-100">
      {items.map((item, index) => (
        <Image
          key={item.key}
          src={item.image}
          alt=""
          fill
          placeholder="blur"
          sizes="100vw"
          priority={index === 0}
          className={`-z-10 object-cover transition-opacity duration-700 ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-950 via-brand-950/70 to-brand-950/45 sm:bg-gradient-to-r sm:from-brand-950 sm:via-brand-950/70 sm:to-brand-950/20"
      />

      <div className="mx-auto max-w-6xl px-5 py-18 sm:px-8 sm:py-28">
        <h2
          data-anim="up"
          className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase"
        >
          <span aria-hidden className="h-px w-8 bg-ember-500/60" />
          {eyebrow}
        </h2>

        {/* Scrolls rather than wraps: four tabs in German do not fit a phone. */}
        <div
          role="tablist"
          aria-label={eyebrow}
          className="-mx-5 mt-8 flex gap-6 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, index) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              id={`${id}-tab-${index}`}
              aria-selected={index === active}
              aria-controls={`${id}-panel-${index}`}
              onClick={() => setActive(index)}
              className={`shrink-0 border-b-2 pb-3 text-[13.5px] font-semibold whitespace-nowrap transition-colors duration-300 ${
                index === active
                  ? "border-cream-100 text-cream-100"
                  : "border-cream-100/20 text-cream-100/45 hover:text-cream-100/80"
              }`}
            >
              {item.tab}
            </button>
          ))}
        </div>

        <div className="mt-12 min-h-[13rem] max-w-xl sm:mt-16">
          {items.map((item, index) => (
            <div
              key={item.key}
              role="tabpanel"
              id={`${id}-panel-${index}`}
              aria-labelledby={`${id}-tab-${index}`}
              hidden={index !== active}
            >
              <h3 className="font-display text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.1] font-extrabold tracking-[-0.035em] text-balance">
                {item.title}
              </h3>
              <p className="mt-5 text-[15px] leading-[1.85] text-pretty text-cream-100/70 sm:text-[16px]">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
