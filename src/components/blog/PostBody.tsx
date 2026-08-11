import Image from "next/image";

import type { Block } from "@/config/posts";

/**
 * Renders the block list.
 *
 * Measure is capped around 68 characters on the text blocks while images and
 * quotes are allowed to break wider, which is what gives a long read its
 * rhythm instead of one uniform column.
 */
export function PostBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-7">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <h2
                key={index}
                className="font-display mx-auto mt-14 max-w-[38rem] text-[clamp(1.4rem,2.6vw,1.95rem)] leading-[1.15] font-extrabold tracking-[-0.03em] text-balance text-brand-900 first:mt-0"
              >
                {block.text}
              </h2>
            );

          case "subheading":
            return (
              <h3
                key={index}
                className="font-display mx-auto mt-10 max-w-[38rem] text-[17px] leading-tight font-bold tracking-[-0.02em] text-brand-900 sm:text-[19px]"
              >
                {block.text}
              </h3>
            );

          case "paragraph":
            return (
              <p
                key={index}
                className="mx-auto max-w-[38rem] text-[16px] leading-[1.85] text-pretty text-brand-900/75 sm:text-[17px]"
              >
                {block.text}
              </p>
            );

          case "list":
            return (
              <ul key={index} className="mx-auto max-w-[38rem] space-y-3">
                {block.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3.5 text-[15.5px] leading-[1.8] text-brand-900/75 sm:text-[16px]"
                  >
                    <span
                      aria-hidden
                      className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-ember-500"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            );

          case "quote":
            return (
              <blockquote
                key={index}
                className="mx-auto my-12 max-w-[44rem] border-l-2 border-ember-500 pl-6 sm:pl-8"
              >
                <p className="font-display text-[clamp(1.25rem,2.6vw,1.75rem)] leading-[1.35] font-bold tracking-[-0.025em] text-balance text-brand-900">
                  {block.text}
                </p>
                {block.cite && (
                  <cite className="mt-4 block text-[12px] font-semibold tracking-[0.14em] text-brand-500 uppercase not-italic">
                    {block.cite}
                  </cite>
                )}
              </blockquote>
            );

          case "image":
            return (
              <figure key={index} className="mx-auto my-12 max-w-[52rem]">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-brand-100">
                  <Image
                    src={block.src}
                    alt={block.alt}
                    fill
                    placeholder="blur"
                    sizes="(max-width: 1023px) 92vw, 832px"
                    className="object-cover"
                  />
                </div>
                {block.caption && (
                  <figcaption className="mt-3 text-center text-[12.5px] text-brand-800/50">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );

          case "callout":
            return (
              <aside
                key={index}
                className="mx-auto my-12 max-w-[42rem] rounded-[20px] bg-cream-100 p-6 sm:p-7"
              >
                <p className="text-[10.5px] font-bold tracking-[0.18em] text-ember-600 uppercase">
                  {block.title}
                </p>
                <p className="mt-3 text-[15px] leading-[1.8] text-pretty text-brand-900/75">
                  {block.text}
                </p>
              </aside>
            );
        }
      })}
    </div>
  );
}
