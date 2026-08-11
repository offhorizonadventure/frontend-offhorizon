import { getTranslations } from "next-intl/server";

import { ContactForm } from "@/components/contact/ContactForm";
import { ArrowRight } from "@/components/ui/icons";
import { Topo } from "@/components/ui/Topo";
import { contact } from "@/config/contact";
import { socialLinks } from "@/config/social";
import { locales } from "@/i18n/config";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata, siteName, siteUrl } from "@/lib/seo";

const steps = ["reply", "plan", "confirm"] as const;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/contact-us">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "contact.meta" });

  return buildMetadata({
    locale,
    path: "/contact-us",
    title: t("title"),
    description: t("description"),
  });
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact-us">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "contact" });
  const tm = await getTranslations({ locale, namespace: "consultation" });

  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: t("meta.title"),
    url: `${siteUrl}/${locale}/contact-us`,
    mainEntity: {
      "@type": "TravelAgency",
      name: siteName,
      telephone: contact.phone,
      email: contact.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Log Huts Rd, Siyal",
        addressLocality: "Manali",
        addressRegion: "Himachal Pradesh",
        postalCode: "175131",
        addressCountry: "IN",
      },
    },
  };

  const labels = {
    fullName: tm("fullName"),
    phone: tm("phone"),
    email: tm("email"),
    message: tm("message"),
    messagePlaceholder: tm("messagePlaceholder"),
    submit: t("form.submit"),
    sending: tm("sending"),
    successTitle: tm("successTitle"),
    successBody: tm("successBody"),
    required: tm("required"),
    countryLabel: tm("countryLabel"),
    searchLabel: tm("searchLabel"),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />

      <section className="relative overflow-hidden bg-brand-950 pt-32 pb-16 text-cream-100 sm:pt-40 sm:pb-20">
        <Topo className="text-cream-100/12" rings={15} seed={13.7} />
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
              <ContactForm labels={labels} />
            </div>

            <aside data-anim="up" className="lg:col-span-5">
              <h2 className="font-display text-[clamp(1.4rem,2.6vw,1.9rem)] leading-tight font-extrabold tracking-[-0.03em] text-brand-900">
                {t("direct.title")}
              </h2>
              <p className="mt-3 text-[14.5px] leading-[1.8] text-brand-800/60">
                {t("direct.body")}
              </p>

              <ul className="mt-7 space-y-px overflow-hidden rounded-2xl bg-brand-900/10">
                <li>
                  <a
                    href={`tel:${contact.phone}`}
                    className="group flex items-center justify-between gap-4 bg-cream-50 px-5 py-4 transition-colors hover:bg-white"
                  >
                    <span>
                      <span className="block text-[10px] font-bold tracking-[0.16em] text-brand-400 uppercase">
                        {t("direct.phone")}
                      </span>
                      <span className="font-display mt-1 block text-[15px] font-bold text-brand-900">
                        {contact.phone}
                      </span>
                    </span>
                    <ArrowRight className="text-brand-400 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="group flex items-center justify-between gap-4 bg-cream-50 px-5 py-4 transition-colors hover:bg-white"
                  >
                    <span className="min-w-0">
                      <span className="block text-[10px] font-bold tracking-[0.16em] text-brand-400 uppercase">
                        {t("direct.email")}
                      </span>
                      <span className="font-display mt-1 block truncate text-[15px] font-bold text-brand-900">
                        {contact.email}
                      </span>
                    </span>
                    <ArrowRight className="shrink-0 text-brand-400 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                </li>
                <li>
                  <a
                    href={contact.directionsUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-start justify-between gap-4 bg-cream-50 px-5 py-4 transition-colors hover:bg-white"
                  >
                    <span>
                      <span className="block text-[10px] font-bold tracking-[0.16em] text-brand-400 uppercase">
                        {t("direct.office")}
                      </span>
                      <span className="mt-1 block text-[14px] leading-relaxed font-medium text-brand-900">
                        {contact.addressLines.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </span>
                    </span>
                    <ArrowRight className="mt-1 shrink-0 text-brand-400 transition-transform duration-300 group-hover:translate-x-1" />
                  </a>
                </li>
              </ul>

              {/* What happens after the form is sent */}
              <div className="mt-9 rounded-2xl border border-brand-900/12 p-6">
                <h3 className="text-[10.5px] font-bold tracking-[0.18em] text-brand-500 uppercase">
                  {t("steps.title")}
                </h3>
                <ol className="mt-5 space-y-5">
                  {steps.map((step, index) => (
                    <li key={step} className="flex gap-4">
                      <span className="font-display flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-800 text-[11px] font-bold text-cream-100 tabular-nums">
                        {index + 1}
                      </span>
                      <span>
                        <span className="font-display block text-[14.5px] font-bold text-brand-900">
                          {t(`steps.items.${step}.title`)}
                        </span>
                        <span className="mt-1 block text-[13px] leading-relaxed text-brand-800/55">
                          {t(`steps.items.${step}.body`)}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-9">
                <h3 className="text-[10.5px] font-bold tracking-[0.18em] text-brand-500 uppercase">
                  {t("direct.follow")}
                </h3>
                <ul className="mt-4 flex items-center gap-2.5">
                  {socialLinks.map(({ key, label, href, Icon }) => (
                    <li key={key}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={label}
                        className="flex size-11 items-center justify-center rounded-full border border-brand-900/15 text-brand-800 transition-colors duration-300 hover:border-brand-800 hover:bg-brand-800 hover:text-cream-100"
                      >
                        <Icon />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
