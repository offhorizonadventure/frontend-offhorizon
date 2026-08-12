import type { ReactNode } from "react";

import { ChevronDown } from "@/components/ui/icons";

export type FaqItem = {
  question: string;
  /** Leading paragraphs. */
  answer: string[];
  /** Optional bullet list rendered between the paragraphs and the closer. */
  list?: string[];
  /** Optional closing paragraphs. */
  after?: string[];
  /** Extra nodes appended to the answer, for links that need real markup. */
  children?: ReactNode;
};

/**
 * FAQ accordion with FAQPage structured data.
 *
 * Native <details>, so it expands with no JavaScript and the answers are in
 * the HTML whether or not a visitor opens them. That matters twice over:
 * crawlers read the whole answer, and the FAQPage markup makes these eligible
 * for expandable results in search, which is the main reason this content is
 * worth structuring rather than leaving as prose.
 */
export function Faq({
  items,
  title,
  eyebrow,
}: {
  items: FaqItem[];
  title: string;
  eyebrow?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: [...item.answer, ...(item.list ?? []), ...(item.after ?? [])].join(" "),
      },
    })),
  };

  return (
    <section className="bg-white py-18 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />

      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div data-anim="up">
          {eyebrow && (
            <span className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase">
              <span aria-hidden className="h-px w-8 bg-ember-500/60" />
              {eyebrow}
            </span>
          )}
          <h2 className="font-display mt-5 text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance text-brand-900">
            {title}
          </h2>
        </div>

        <div data-anim-group className="mt-10 divide-y divide-brand-900/12 border-y border-brand-900/12">
          {items.map((item) => (
            <details key={item.question} className="group">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                <h3 className="font-display text-[16.5px] leading-snug font-bold tracking-[-0.015em] text-balance text-brand-900 sm:text-[18px]">
                  {item.question}
                </h3>
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-900/6 text-brand-700 transition-colors duration-300 group-open:bg-brand-800 group-open:text-cream-100">
                  <ChevronDown className="transition-transform duration-300 group-open:rotate-180" />
                </span>
              </summary>

              <div className="space-y-4 pr-14 pb-7">
                {item.answer.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-[14.5px] leading-[1.85] text-pretty text-brand-900/70"
                  >
                    {paragraph}
                  </p>
                ))}

                {item.list && (
                  <ul className="space-y-2.5">
                    {item.list.map((entry) => (
                      <li
                        key={entry}
                        className="flex gap-3 text-[14px] leading-[1.8] text-brand-900/70"
                      >
                        <span
                          aria-hidden
                          className="mt-[0.65em] size-1.5 shrink-0 rounded-full bg-ember-500"
                        />
                        {entry}
                      </li>
                    ))}
                  </ul>
                )}

                {item.after?.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-[14.5px] leading-[1.85] text-pretty text-brand-900/70"
                  >
                    {paragraph}
                  </p>
                ))}

                {item.children}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
