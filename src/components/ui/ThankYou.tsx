import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { ArrowRight } from "@/components/ui/icons";
import { Topo } from "@/components/ui/Topo";
import { contact } from "@/config/contact";
import type { Locale } from "@/i18n/config";

/**
 * What a rider sees once an enquiry is away.
 *
 * A page of its own rather than a panel inside the form, so the visit can be
 * counted: an address that is only ever reached by sending something is the
 * one measurement that cannot be faked by somebody browsing.
 */
export async function ThankYou({ locale, source }: { locale: Locale; source: "quick" | "custom" }) {
  const t = await getTranslations({ locale, namespace: "thankYou" });

  const steps = t.raw("steps") as string[];

  return (
    <section
      data-enquiry-sent
      // pt clears the fixed header, which this page has no hero to sit under.
      className="bg-cream-50 relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28"
    >
      <Topo className="text-brand-800/12" rings={13} seed={47.1} />

      <div className="relative mx-auto max-w-2xl px-5 text-center sm:px-8">
        <span
          aria-hidden
          className="bg-ember-500/15 text-ember-600 mx-auto flex size-16 items-center justify-center rounded-full"
        >
          <ArrowRight className="size-7 -rotate-45" />
        </span>

        <h1 className="font-display text-brand-900 mt-7 text-[clamp(1.9rem,4vw,2.7rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance">
          {t("title")}
        </h1>

        <p className="text-brand-800/65 mx-auto mt-5 max-w-lg text-[15.5px] leading-[1.85] text-pretty">
          {t(source === "custom" ? "bodyCustom" : "bodyQuick")}
        </p>

        <ol className="border-brand-900/12 mx-auto mt-10 max-w-md space-y-3.5 border-t pt-8 text-left">
          {steps.map((step, index) => (
            <li key={step} className="text-brand-800/70 flex gap-3.5 text-[14px] leading-[1.7]">
              <span
                aria-hidden
                className="font-display text-ember-500 shrink-0 text-[12px] font-extrabold tabular-nums"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              {step}
            </li>
          ))}
        </ol>

        <p className="text-brand-800/55 mt-8 text-[13.5px] leading-[1.8]">
          {t("urgent")}
          <br />
          <a href={`mailto:${contact.email}`} className="text-brand-800 hover:underline">
            {contact.email}
          </a>
          {"  "}
          <a href={`tel:${contact.phone}`} className="text-brand-800 hover:underline">
            {contact.phoneDisplay}
          </a>
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/adventure-tours"
            className="bg-brand-800 text-cream-100 hover:bg-brand-900 inline-flex h-12 items-center rounded-full px-7 text-[11px] font-bold tracking-[0.13em] uppercase transition-colors"
          >
            {t("browse")}
          </Link>

          <Link
            href="/"
            className="border-brand-900/20 text-brand-800 hover:border-brand-800 hover:bg-brand-800 hover:text-cream-100 inline-flex h-12 items-center rounded-full border px-7 text-[11px] font-bold tracking-[0.13em] uppercase transition-colors"
          >
            {t("home")}
          </Link>
        </div>
      </div>
    </section>
  );
}
