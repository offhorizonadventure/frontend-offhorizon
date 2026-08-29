import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { ArrowRight } from "@/components/ui/icons";
import { Topo } from "@/components/ui/Topo";
import { contact } from "@/config/contact";
import { socialLinks } from "@/config/social";
import { CookiePreferences } from "@/components/analytics/CookiePreferences";
import { Link } from "@/i18n/navigation";
import { siteName } from "@/lib/seo";

const resources = [
  { key: "about", href: "/about-us" },
  { key: "booking", href: "/how-booking-works" },
  { key: "terms", href: "/terms-of-service" },
  { key: "privacy", href: "/privacy-policy" },
] as const;

export async function SiteFooter() {
  const t = await getTranslations("footer");

  const heading =
    "font-display flex items-center gap-3 text-[11px] font-bold tracking-[0.2em] text-cream-100/45 uppercase";
  const rule = <span aria-hidden className="bg-cream-100/12 h-px flex-1" />;

  return (
    <footer className="bg-brand-950 text-cream-100 relative overflow-hidden">
      <Topo className="text-cream-100/8" rings={13} seed={7.3} />

      <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-8 sm:px-8 sm:pt-20">
        <div data-anim-group className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Link href="/" aria-label={siteName} className="inline-flex">
              <Image
                src="/logo/logo-horizontal-cream.png"
                alt={siteName}
                width={2589}
                height={546}
                sizes="220px"
                className="h-9 w-auto"
              />
            </Link>

            <p className="text-cream-100/50 mt-6 max-w-md text-[14px] leading-[1.85] text-pretty">
              {t("about")}
            </p>
          </div>

          <div className="lg:col-span-4">
            <h2 className={heading}>
              {t("contactTitle")}
              {rule}
            </h2>

            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href={`tel:${contact.phone}`}
                  className="group text-cream-100/75 hover:text-cream-100 inline-flex items-center gap-3 text-[14.5px] transition-colors"
                >
                  <span className="text-cream-100/35 text-[11px] font-semibold tracking-[0.14em] uppercase">
                    {t("phone")}
                  </span>
                  <span className="underline-offset-4 group-hover:underline">{contact.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="group text-cream-100/75 hover:text-cream-100 inline-flex items-center gap-3 text-[14.5px] transition-colors"
                >
                  <span className="text-cream-100/35 text-[11px] font-semibold tracking-[0.14em] uppercase">
                    {t("email")}
                  </span>
                  <span className="underline-offset-4 group-hover:underline">{contact.email}</span>
                </a>
              </li>
            </ul>

            <h2 className={`${heading} mt-9`}>
              {t("officeTitle")}
              {rule}
            </h2>

            <address className="text-cream-100/60 mt-4 text-[14.5px] leading-[1.7] not-italic">
              {contact.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>

            <a
              href={contact.directionsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="group border-cream-100/25 text-cream-100 hover:border-cream-100 hover:bg-cream-100 hover:text-brand-950 mt-5 inline-flex h-11 items-center gap-2.5 rounded-full border px-5 text-[10.5px] font-bold tracking-[0.14em] uppercase transition-colors duration-300"
            >
              {t("directions")}
              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>

          <div className="lg:col-span-3">
            <h2 className={heading}>
              {t("resourcesTitle")}
              {rule}
            </h2>

            <ul className="mt-5 space-y-1">
              {resources.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="group text-cream-100/70 hover:text-cream-100 inline-flex items-center gap-2.5 py-1.5 text-[14.5px] transition-colors"
                  >
                    <span
                      aria-hidden
                      className="bg-ember-500 ease-out-expo h-px w-0 transition-all duration-400 group-hover:w-5"
                    />
                    {t(`resources.${item.key}`)}
                  </Link>
                </li>
              ))}

              {}
              <li>
                <CookiePreferences
                  label={t("resources.cookies")}
                  className="group text-cream-100/70 hover:text-cream-100 inline-flex items-center gap-2.5 py-1.5 text-left text-[14.5px] transition-colors"
                />
              </li>
            </ul>

            <h2 className={`${heading} mt-9`}>
              {t("followTitle")}
              {rule}
            </h2>

            <ul className="mt-5 flex items-center gap-2.5">
              {socialLinks.map(({ key, label, href, Icon }) => (
                <li key={key}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={label}
                    className="border-cream-100/20 text-cream-100/80 hover:border-ember-500 hover:bg-ember-500 hover:text-brand-950 flex size-11 items-center justify-center rounded-full border transition-colors duration-300"
                  >
                    <Icon />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-cream-100/12 mt-14 flex flex-col-reverse items-center gap-6 border-t pt-7 sm:mt-16 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-cream-100/40 text-[12px]">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>

          {}
          <div className="rounded-xl bg-white p-2.5">
            <Image
              src="/payment/gateways.png"
              alt={t("paymentsAlt")}
              width={828}
              height={271}
              sizes="300px"
              className="h-auto w-[16rem] sm:w-[18rem]"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
