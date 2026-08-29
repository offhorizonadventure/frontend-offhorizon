import { getTranslations } from "next-intl/server";

import { CustomExpeditionForm } from "@/components/custom/CustomExpeditionForm";
import { BadgeCheck, CalendarCheck, Wallet } from "@/components/ui/icons";
import { Topo } from "@/components/ui/Topo";
import { destinations } from "@/config/destinations";
import { locales, type Locale } from "@/i18n/config";
import { currencyForVisitor } from "@/lib/currency";
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

async function currencySymbol(locale: Locale) {
  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: await currencyForVisitor(locale),
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
    travelMode: t("fields.travelMode"),
    modeMotorcycle: t("fields.modeMotorcycle"),
    modeVehicle: t("fields.modeVehicle"),
    vehicleChoice: t("fields.vehicleChoice"),
    vehicleOwn: t("fields.vehicleOwn"),
    vehicleOwnHint: t("fields.vehicleOwnHint"),
    vehicleOurs: t("fields.vehicleOurs"),
    vehicleOursHint: t("fields.vehicleOursHint"),
    people: t("fields.people"),
    peopleHint: t("fields.peopleHint"),
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
    required: tm("required"),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />

      <section className="bg-brand-950 text-cream-100 relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
        <Topo className="text-cream-100/12" rings={16} seed={17.5} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_0%,rgba(180,95,43,0.24),transparent_72%)]"
        />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <span className="hero-rise text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
            <span aria-hidden className="bg-ember-500/60 h-px w-8" />
            {t("hero.eyebrow")}
          </span>

          <h1
            className="hero-rise font-display mt-6 max-w-3xl text-[clamp(2.2rem,5.2vw,3.9rem)] leading-[1.03] font-extrabold tracking-[-0.04em] text-balance"
            style={{ animationDelay: "80ms" }}
          >
            {t("hero.title")}
          </h1>

          <p
            className="hero-rise text-cream-100/60 mt-6 max-w-xl text-[15px] leading-[1.85] text-pretty sm:text-[16px]"
            style={{ animationDelay: "160ms" }}
          >
            {t("hero.lead")}
          </p>
        </div>
      </section>

      <section className="bg-cream-50 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div data-anim="up" className="min-w-0 lg:col-span-7">
              <CustomExpeditionForm
                labels={labels}
                currencySymbol={await currencySymbol(locale)}
                currency={await currencyForVisitor(locale)}
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

            <aside data-anim="up" className="min-w-0 lg:col-span-5">
              <h2 className="font-display text-brand-900 text-[clamp(1.4rem,2.6vw,1.9rem)] leading-tight font-extrabold tracking-[-0.03em]">
                {t("aside.title")}
              </h2>
              <p className="text-brand-800/60 mt-3 text-[14.5px] leading-[1.8]">
                {t("aside.body")}
              </p>

              <ul className="bg-brand-900/10 mt-8 space-y-px overflow-hidden rounded-2xl">
                {assurances.map(({ key, Icon }) => (
                  <li key={key} className="bg-cream-50 flex items-start gap-4 px-5 py-5">
                    <span className="bg-brand-800/8 text-ember-600 flex size-10 shrink-0 items-center justify-center rounded-full">
                      <Icon />
                    </span>
                    <span>
                      <span className="font-display text-brand-900 block text-[14.5px] font-bold">
                        {t(`assurances.${key}.title`)}
                      </span>
                      <span className="text-brand-800/55 mt-1 block text-[13px] leading-relaxed">
                        {t(`assurances.${key}.body`)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <p className="border-brand-900/12 text-brand-800/50 mt-8 border-t pt-6 text-[13px] leading-relaxed">
                {t("aside.note")}
              </p>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
