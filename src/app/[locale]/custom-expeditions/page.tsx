import { getTranslations } from "next-intl/server";

import { CustomExpeditionForm } from "@/components/custom/CustomExpeditionForm";
import { BadgeCheck, CalendarCheck, Wallet } from "@/components/ui/icons";
import { Topo } from "@/components/ui/Topo";
import { destinations } from "@/config/destinations";
import { currencyFor, locales, type Locale } from "@/i18n/config";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata, siteName, siteUrl } from "@/lib/seo";

const companyOptions = ["solo", "friends", "family"] as const;
const assurances = [
  { key: "noPayment", Icon: Wallet },
  { key: "reply", Icon: CalendarCheck },
  { key: "tailored", Icon: BadgeCheck },
] as const;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/custom-expeditions">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "custom.meta" });

  return buildMetadata({
    locale,
    path: "/custom-expeditions",
    title: t("title"),
    description: t("description"),
  });
}

/** Symbol only, so the budget field reads "€" rather than "€0.00". */
function currencySymbol(locale: Locale) {
  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyFor(locale),
  }).formatToParts(0);

  return parts.find((part) => part.type === "currency")?.value ?? "";
}

export default async function CustomExpeditionsPage({
  params,
}: PageProps<"/[locale]/custom-expeditions">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "custom" });
  const td = await getTranslations({ locale, namespace: "destinations" });
  const tm = await getTranslations({ locale, namespace: "consultation" });

  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: t("meta.title"),
    description: t("meta.description"),
    url: `${siteUrl}/${locale}/custom-expeditions`,
    about: { "@type": "TravelAgency", name: siteName },
  };

  const labels = {
    sections: {
      route: t("sections.route"),
      group: t("sections.group"),
      budget: t("sections.budget"),
      adventure: t("sections.adventure"),
      details: t("sections.details"),
    },
    destination: t("fields.destination"),
    destinationPlaceholder: t("fields.destinationPlaceholder"),
    startDate: t("fields.startDate"),
    endDate: t("fields.endDate"),
    company: t("fields.company"),
    companyPlaceholder: t("fields.companyPlaceholder"),
    riders: t("fields.riders"),
    ridersHint: t("fields.ridersHint"),
    pillions: t("fields.pillions"),
    pillionsHint: t("fields.pillionsHint"),
    decrease: t("fields.decrease"),
    increase: t("fields.increase"),
    budgetLabel: t("fields.budget"),
    budgetHint: t("fields.budgetHint"),
    message: t("fields.message"),
    messagePlaceholder: t("fields.messagePlaceholder"),
    firstName: t("fields.firstName"),
    lastName: t("fields.lastName"),
    email: tm("email"),
    phone: tm("phone"),
    countryLabel: tm("countryLabel"),
    searchLabel: tm("searchLabel"),
    submit: t("submit"),
    sending: tm("sending"),
    successTitle: t("successTitle"),
    successBody: t("successBody"),
    required: tm("required"),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />

      <section className="relative overflow-hidden bg-brand-950 pt-32 pb-16 text-cream-100 sm:pt-40 sm:pb-20">
        <Topo className="text-cream-100/12" rings={16} seed={17.5} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_0%,rgba(180,95,43,0.24),transparent_72%)]"
        />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <span className="hero-rise flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase">
            <span aria-hidden className="h-px w-8 bg-ember-500/60" />
            {t("hero.eyebrow")}
          </span>

          <h1
            className="hero-rise font-display mt-6 max-w-3xl text-[clamp(2.2rem,5.2vw,3.9rem)] leading-[1.03] font-extrabold tracking-[-0.04em] text-balance"
            style={{ animationDelay: "80ms" }}
          >
            {t("hero.title")}
          </h1>

          <p
            className="hero-rise mt-6 max-w-xl text-[15px] leading-[1.85] text-pretty text-cream-100/60 sm:text-[16px]"
            style={{ animationDelay: "160ms" }}
          >
            {t("hero.lead")}
          </p>
        </div>
      </section>

      <section className="bg-cream-50 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div data-anim="up" className="lg:col-span-7">
              <CustomExpeditionForm
                labels={labels}
                currencySymbol={currencySymbol(locale)}
                destinations={destinations.map((destination) => ({
                  value: destination.key,
                  label: td(destination.key),
                }))}
                company={companyOptions.map((option) => ({
                  value: option,
                  label: t(`company.${option}`),
                }))}
              />
            </div>

            <aside data-anim="up" className="lg:col-span-5">
              <h2 className="font-display text-[clamp(1.4rem,2.6vw,1.9rem)] leading-tight font-extrabold tracking-[-0.03em] text-brand-900">
                {t("aside.title")}
              </h2>
              <p className="mt-3 text-[14.5px] leading-[1.8] text-brand-800/60">
                {t("aside.body")}
              </p>

              <ul className="mt-8 space-y-px overflow-hidden rounded-2xl bg-brand-900/10">
                {assurances.map(({ key, Icon }) => (
                  <li key={key} className="flex items-start gap-4 bg-cream-50 px-5 py-5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-800/8 text-ember-600">
                      <Icon />
                    </span>
                    <span>
                      <span className="font-display block text-[14.5px] font-bold text-brand-900">
                        {t(`assurances.${key}.title`)}
                      </span>
                      <span className="mt-1 block text-[13px] leading-relaxed text-brand-800/55">
                        {t(`assurances.${key}.body`)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-8 border-t border-brand-900/12 pt-6 text-[13px] leading-relaxed text-brand-800/50">
                {t("aside.note")}
              </p>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
