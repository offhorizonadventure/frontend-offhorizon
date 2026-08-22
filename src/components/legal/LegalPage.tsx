import { getFormatter, getTranslations } from "next-intl/server";

import { Topo } from "@/components/ui/Topo";
import { contact } from "@/config/contact";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";

/** One clause: a heading, prose, and an optional list under it. */
export type Clause = { title: string; body: string[]; list?: string[] };

/** The day the current wording took effect. */
export const LEGAL_UPDATED = new Date("2026-08-22T00:00:00Z");

/** Shared shell for the terms and the privacy policy. */
export async function LegalPage({
  locale,
  namespace,
}: {
  locale: Locale;
  namespace: "terms" | "privacy";
}) {
  const t = await getTranslations({ locale, namespace: "legal" });
  const format = await getFormatter({ locale });

  const clauses = t.raw(`${namespace}.sections`) as Clause[];

  return (
    <>
      <section className="bg-brand-950 text-cream-100 relative overflow-hidden pt-32 pb-14 sm:pt-40 sm:pb-16">
        <Topo className="text-cream-100/12" rings={13} seed={9.2} />
        <div className="relative mx-auto max-w-3xl px-5 sm:px-8">
          <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
            <span aria-hidden className="bg-ember-500/60 h-px w-8" />
            {t(`${namespace}.eyebrow`)}
          </span>

          <h1 className="font-display mt-5 text-[clamp(2rem,4.6vw,3rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-balance">
            {t(`${namespace}.title`)}
          </h1>

          <p className="text-cream-100/60 mt-5 max-w-xl text-[15px] leading-[1.8] text-pretty">
            {t(`${namespace}.lead`)}
          </p>

          <p className="text-cream-100/40 mt-6 text-[12px] tracking-[0.04em]">
            {t("updated", {
              date: format.dateTime(LEGAL_UPDATED, {
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
          <ol className="space-y-12">
            {clauses.map((clause, index) => (
              <li key={clause.title}>
                <h2 className="font-display text-brand-900 flex gap-3 text-[19px] font-bold tracking-[-0.02em]">
                  <span className="text-ember-500 tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {clause.title}
                </h2>

                <div className="mt-4 space-y-4">
                  {clause.body.map((paragraph) => (
                    <p key={paragraph} className="text-brand-900/75 text-[15px] leading-[1.8]">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {clause.list && (
                  <ul className="mt-4 space-y-3">
                    {clause.list.map((item) => (
                      <li
                        key={item}
                        className="text-brand-900/75 flex gap-3.5 text-[15px] leading-[1.8]"
                      >
                        <span
                          aria-hidden
                          className="bg-ember-500 mt-[0.7em] size-1.5 shrink-0 rounded-full"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>

          <div className="border-brand-900/10 mt-14 space-y-4 border-t pt-8">
            <p className="text-brand-800/60 text-[14px] leading-[1.8]">
              {t("questions")}{" "}
              <a
                href={`mailto:${contact.email}`}
                className="text-brand-900 decoration-ember-500/50 font-semibold underline underline-offset-[3px]"
              >
                {contact.email}
              </a>{" "}
              {t("orThrough")}{" "}
              <Link
                href="/contact-us"
                className="text-brand-900 decoration-ember-500/50 font-semibold underline underline-offset-[3px]"
              >
                {t("contactForm")}
              </Link>
              .
            </p>
            <p className="text-brand-800/45 text-[13px] leading-[1.8]">{t("prevail")}</p>
          </div>
        </div>
      </section>
    </>
  );
}
