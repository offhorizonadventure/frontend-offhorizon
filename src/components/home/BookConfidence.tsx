import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import adventureImage from "../../../public/cta/adventure-bg.jpg";

import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  RefreshDeposit,
  Wallet,
} from "@/components/ui/icons";
import { Topo } from "@/components/ui/Topo";
import { QuickEnquiryModal } from "@/components/ui/QuickEnquiryModal";
import { quickEnquiryLabels } from "@/components/ui/QuickEnquiry";
import type { Locale } from "@/i18n/config";

const guarantees = [
  { key: "deposits", Icon: RefreshDeposit },
  { key: "cancellation", Icon: CalendarCheck },
  { key: "reserve", Icon: Wallet },
  { key: "departures", Icon: BadgeCheck },
] as const;

/** Booking guarantees, closing on the contact call to action. */
export async function BookConfidence() {
  const t = await getTranslations("home.confidence");
  const tc = await getTranslations("home.startAdventure");
  const locale = (await getLocale()) as Locale;

  const modalLabels = await quickEnquiryLabels(locale);

  return (
    <section className="bg-brand-950 text-cream-100 relative overflow-hidden py-20 sm:py-28">
      <Topo className="text-cream-100/10" rings={14} seed={5.9} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_50%_at_50%_0%,rgba(180,95,43,0.2),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div data-anim="up" className="max-w-2xl">
          <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
            <span aria-hidden className="bg-ember-500/60 h-px w-8" />
            {t("eyebrow")}
          </span>
          <h2 className="font-display mt-5 text-[clamp(1.85rem,3.6vw,2.9rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance">
            {t("title")}
          </h2>
          <p className="text-cream-100/55 mt-4 text-[15px] leading-[1.8]">{t("subtitle")}</p>
        </div>

        <ul
          data-anim-group
          className="bg-cream-100/12 mt-12 grid gap-px overflow-hidden rounded-3xl sm:mt-14 sm:grid-cols-2 lg:grid-cols-4"
        >
          {guarantees.map(({ key, Icon }) => (
            <li
              key={key}
              className="group bg-brand-950 hover:bg-brand-900 p-7 transition-colors duration-500"
            >
              <span className="bg-cream-100/8 text-ember-500 ring-cream-100/12 group-hover:bg-ember-500 group-hover:text-brand-950 flex size-11 items-center justify-center rounded-full ring-1 transition-colors duration-500">
                <Icon />
              </span>
              <h3 className="font-display mt-5 text-[16px] leading-tight font-bold tracking-[-0.015em]">
                {t(`items.${key}.title`)}
              </h3>
              <p className="text-cream-100/50 mt-2.5 text-[13.5px] leading-[1.75] text-pretty">
                {t(`items.${key}.body`)}
              </p>
            </li>
          ))}
        </ul>

        {/* Cream panel against the dark section, with the rider in an arch.
            The source photo is portrait, so an arch frame fits it without the
            upscaling a full-bleed band would have needed. */}
        <div
          data-anim="wipe"
          className="bg-cream-100 mt-14 overflow-hidden rounded-[32px] sm:mt-20"
        >
          <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-12 lg:gap-14 lg:p-14">
            <div className="lg:col-span-7">
              <span className="text-ember-600 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
                <span aria-hidden className="bg-ember-600/50 h-px w-8" />
                {tc("eyebrow")}
              </span>

              <h3 className="font-display text-brand-900 mt-5 text-[clamp(1.7rem,3.2vw,2.6rem)] leading-[1.06] font-extrabold tracking-[-0.035em]">
                {tc("title")}
              </h3>

              <p className="text-brand-800/60 mt-4 max-w-md text-[15px] leading-[1.8]">
                {tc("subtitle")}
              </p>

              <QuickEnquiryModal
                labels={modalLabels}
                className="group bg-brand-800 text-cream-100 hover:bg-brand-900 mt-8 inline-flex h-13 items-center justify-center gap-2.5 rounded-full px-8 text-[11.5px] font-bold tracking-[0.13em] uppercase transition-colors duration-300"
              >
                {tc("consultation")}
                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </QuickEnquiryModal>

              <p className="text-brand-800/45 mt-4 text-[12px]">{tc("note")}</p>
            </div>

            <div className="lg:col-span-5">
              <div className="ring-brand-900/10 relative mx-auto aspect-[3/4] w-full max-w-[19rem] overflow-hidden rounded-t-full ring-1">
                <Image
                  src={adventureImage}
                  alt=""
                  fill
                  sizes="(max-width: 1023px) 76vw, 304px"
                  className="object-cover object-top"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
