import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { cookies } from "next/headers";

import { AskToSignIn } from "@/components/auth/AskToSignIn";
import { CheckoutForm } from "@/components/booking/CheckoutForm";
import { Summary } from "@/components/booking/Summary";
import { Topo } from "@/components/ui/Topo";
import { COUNTRY_COOKIE } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/params";
import { priceBooking } from "@/lib/booking/preview";
import { countryOptions, toCountryCode } from "@/lib/countries";
import { razorpayConfigured, razorpayKeyId } from "@/lib/booking/razorpay";
import { getProfile } from "@/lib/profile";
import { siteName } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return { title: "Checkout", robots: { index: false, follow: false } };
}

export default async function CheckoutPage({
  params,
  searchParams,
}: PageProps<"/[locale]/booking/checkout">) {
  const locale = await resolveLocale(params);
  const query = await searchParams;
  const t = await getTranslations({ locale, namespace: "checkout" });

  const departureId = typeof query.departure === "string" ? query.departure : "";
  if (!departureId) notFound();

  const profile = await getProfile();

  // The country the visitor was already recognised as, set by the proxy from
  // whatever the network said. A guess in the box the rider can correct beats
  // an empty box they have to fill, and it is only a default: what gets stored
  // is whatever the form comes back with.
  const guessed = toCountryCode((await cookies()).get(COUNTRY_COOKIE)?.value);
  const countries = countryOptions(locale);

  const priced = await priceBooking(locale, departureId, query);
  if (!priced) notFound();

  return (
    <>
      <section className="bg-brand-950 text-cream-100 relative overflow-hidden pt-32 pb-14 sm:pt-40 sm:pb-16">
        <Topo className="text-cream-100/12" rings={12} seed={61.3} />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
            <span aria-hidden className="bg-ember-500/60 h-px w-8" />
            {t("eyebrow")}
          </span>

          <h1 className="font-display mt-5 text-[clamp(2rem,4.2vw,2.8rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-balance">
            {priced.tourTitle}
          </h1>

          <p className="text-cream-100/60 mt-4 text-[15px] leading-[1.8]">{priced.dates}</p>
        </div>
      </section>

      <section className="bg-cream-50 py-14 sm:py-18">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <div className="bg-paper ring-brand-900/10 rounded-[24px] p-6 ring-1 sm:p-8">
              {profile ? (
                <CheckoutForm
                  keyId={razorpayConfigured() ? razorpayKeyId() : ""}
                  siteName={siteName}
                  hidden={priced.hidden}
                  amounts={{ full: priced.totalLabel, deposit: priced.depositLabel }}
                  depositAllowed={priced.depositAllowed}
                  paidInFull={priced.paidInFull}
                  profile={{
                    name: profile.full_name ?? "",
                    email: profile.email ?? "",
                    phone: profile.phone ?? "",
                  }}
                  countries={countries}
                  defaultCountry={guessed}
                  labels={{
                    planTitle: t("planTitle"),
                    full: t("full"),
                    fullNote: t("fullNote"),
                    // The share this expedition asks for, so the button never
                    // promises twenty percent on a date that wants half.
                    deposit: t("deposit", { percent: priced.depositPercent }),
                    depositNote: t("depositNote"),
                    depositClosed: t("depositClosed"),
                    depositFull: t("depositFull"),
                    detailsTitle: t("detailsTitle"),
                    name: t("name"),
                    email: t("email"),
                    phone: t("phone"),
                    country: t("country"),
                    countryHint: t("countryHint"),
                    countryPlaceholder: t("countryPlaceholder"),
                    countryNoMatch: t("countryNoMatch"),
                    countryClear: t("countryClear"),
                    pay: t("pay"),
                    paying: t("paying"),
                    opening: t("opening"),
                    confirming: t("confirming"),
                    dismissed: t("dismissed"),
                    unavailable: t("unavailable"),
                    agree: t("agree"),
                  }}
                />
              ) : (
                <div className="py-4">
                  <AskToSignIn />
                  <h2 className="font-display text-brand-900 text-[19px] leading-tight font-bold tracking-[-0.02em]">
                    {t("signInTitle")}
                  </h2>
                  <p className="text-brand-800/65 mt-3 text-[14px] leading-[1.8]">
                    {t("signInLead")}
                  </p>
                </div>
              )}
            </div>

            <p className="text-brand-800/50 mt-5 text-center text-[12.5px]">
              {t("guideLead")}{" "}
              <Link
                href="/how-booking-works"
                className="text-brand-900 decoration-ember-500/50 font-semibold underline underline-offset-[3px]"
              >
                {t("guideLink")}
              </Link>
            </p>
          </div>

          <div className="lg:col-span-5">
            <Summary locale={locale} priced={priced} />
          </div>
        </div>
      </section>
    </>
  );
}
