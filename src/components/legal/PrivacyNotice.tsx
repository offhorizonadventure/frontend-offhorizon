import { getFormatter, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { CookiePreferences } from "@/components/analytics/CookiePreferences";
import { Topo } from "@/components/ui/Topo";
import type { Locale } from "@/i18n/config";
import {
  PRIVACY_INTRO,
  PRIVACY_SECTIONS,
  PRIVACY_SUMMARY,
  PRIVACY_UPDATED,
  type Block,
} from "@/config/privacy";

function inline(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;

  let last = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));

    const key = `${keyPrefix}-${index}`;
    index += 1;

    if (match[1] && match[2]) {
      const href = match[2];
      const external = !href.startsWith("#") && !href.startsWith("mailto:");

      parts.push(
        <a
          key={key}
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="text-brand-900 decoration-ember-500/50 font-medium break-words underline underline-offset-[3px]"
        >
          {match[1]}
        </a>,
      );
    } else if (match[3]) {
      parts.push(<strong key={key}>{match[3]}</strong>);
    } else if (match[4]) {
      parts.push(<em key={key}>{match[4]}</em>);
    }

    last = pattern.lastIndex;
  }

  if (last < text.length) parts.push(text.slice(last));

  return parts;
}

function Blocks({ blocks, id }: { blocks: Block[]; id: string }) {
  return (
    <>
      {blocks.map((block, index) => {
        const key = `${id}-${index}`;

        if (block.kind === "h3") {
          return (
            <h3
              key={key}
              id={block.id}
              className="font-display text-brand-900 mt-8 scroll-mt-28 text-[16px] font-bold tracking-[-0.015em]"
            >
              {block.text}
            </h3>
          );
        }

        if (block.kind === "short") {
          return (
            <p
              key={key}
              className="border-ember-500/40 text-brand-900/70 mt-4 border-l-2 pl-4 text-[14.5px] leading-[1.8] italic"
            >
              {inline(block.text, key)}
            </p>
          );
        }

        if (block.kind === "ul") {
          return (
            <ul key={key} className="mt-4 space-y-3">
              {block.items.map((item, at) => (
                <li
                  key={`${key}-${at}`}
                  className="text-brand-900/75 flex gap-3.5 text-[15px] leading-[1.8]"
                >
                  <span
                    aria-hidden
                    className="bg-ember-500 mt-[0.7em] size-1.5 shrink-0 rounded-full"
                  />
                  <span>{inline(item, `${key}-${at}`)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.kind === "table") {
          return (
            <div key={key} className="ring-brand-900/10 mt-6 overflow-x-auto rounded-xl ring-1">
              <table className="w-full min-w-[36rem] border-collapse text-left">
                <thead className="bg-brand-900/[0.04]">
                  <tr>
                    {block.head.map((heading) => (
                      <th
                        key={heading}
                        className="text-brand-900 px-4 py-3 text-[12.5px] font-bold tracking-[0.06em] uppercase"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row) => (
                    <tr key={row[0]} className="border-brand-900/10 border-t">
                      {row.map((cell, at) => (
                        <td
                          key={`${row[0]}-${at}`}
                          className={`text-brand-900/75 px-4 py-3 align-top text-[14px] leading-[1.7] ${
                            at === 2 ? "font-semibold whitespace-nowrap" : ""
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <p
            key={key}
            className="text-brand-900/75 mt-4 text-[15px] leading-[1.8] whitespace-pre-line"
          >
            {inline(block.text, key)}
          </p>
        );
      })}
    </>
  );
}

export async function PrivacyNotice({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "legal" });
  const format = await getFormatter({ locale });

  return (
    <>
      <section className="bg-brand-950 text-cream-100 relative overflow-hidden pt-32 pb-14 sm:pt-40 sm:pb-16">
        <Topo className="text-cream-100/12" rings={13} seed={9.2} />
        <div className="relative mx-auto max-w-3xl px-5 sm:px-8">
          <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
            <span aria-hidden className="bg-ember-500/60 h-px w-8" />
            {t("privacy.eyebrow")}
          </span>

          <h1 className="font-display mt-5 text-[clamp(2rem,4.6vw,3rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-balance">
            Privacy Policy
          </h1>

          <p className="text-cream-100/40 mt-6 text-[12px] tracking-[0.04em]">
            {t("updated", {
              date: format.dateTime(PRIVACY_UPDATED, {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            })}
          </p>
        </div>
      </section>

      <section className="bg-cream-50 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Blocks blocks={PRIVACY_INTRO} id="intro" />

          <h2 className="font-display text-brand-900 mt-14 text-[19px] font-bold tracking-[-0.02em]">
            Summary of key points
          </h2>
          <p className="text-brand-900/70 mt-4 text-[15px] leading-[1.8] italic">
            This summary provides key points from our Privacy Notice, but you can find out more
            details about any of these topics by clicking the link following each key point or by
            using the table of contents below to find the section you are looking for.
          </p>
          <Blocks blocks={PRIVACY_SUMMARY} id="summary" />

          <h2
            id="toc"
            className="font-display text-brand-900 mt-14 text-[19px] font-bold tracking-[-0.02em]"
          >
            Table of contents
          </h2>
          <ol className="mt-5 space-y-2.5">
            {PRIVACY_SECTIONS.map((section, index) => (
              <li key={section.id} className="flex gap-3 text-[14.5px] leading-[1.7]">
                <span className="text-ember-500 shrink-0 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <a
                  href={`#${section.id}`}
                  className="text-brand-900 decoration-ember-500/50 underline underline-offset-[3px]"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>

          <ol className="mt-14 space-y-14">
            {PRIVACY_SECTIONS.map((section, index) => (
              <li key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="font-display text-brand-900 flex gap-3 text-[19px] font-bold tracking-[-0.02em]">
                  <span className="text-ember-500 tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </h2>

                <Blocks blocks={section.blocks} id={section.id} />
              </li>
            ))}
          </ol>

          <div className="border-brand-900/10 mt-14 space-y-4 border-t pt-8">
            <p className="text-brand-800/60 text-[14px] leading-[1.8]">
              You can change what this site is allowed to store on your device at any time.
            </p>

            <CookiePreferences label="Cookie preferences" />

            <p className="text-brand-800/45 text-[13px] leading-[1.8]">{t("prevail")}</p>
          </div>
        </div>
      </section>
    </>
  );
}
