import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Flag } from "@/components/ui/Flag";
import { ArrowRight, ChevronDown } from "@/components/ui/icons";
import { hasMegaMenu, isSecondary, mainNav, type NavItem } from "@/config/navigation";
import { socialLinks } from "@/config/social";
import { Link } from "@/i18n/navigation";

const rowClass =
  "flex items-center justify-between gap-4 py-4 text-[16px] font-semibold tracking-[-0.005em] text-brand-950 transition-colors hover:text-ember-500";

const primary = mainNav.filter((item) => !isSecondary(item));
const more = mainNav.filter(isSecondary);

/** Drawer contents. */
export async function MobileMenu() {
  const [t, td, tt] = await Promise.all([
    getTranslations("nav"),
    getTranslations("destinations"),
    getTranslations("tours"),
  ]);

  const plainLink = (item: NavItem) => (
    <Link href={item.href} className={rowClass}>
      {t(item.key)}
      <ArrowRight className="text-brand-400 size-4 shrink-0" />
    </Link>
  );

  return (
    <div className="flex min-h-full flex-col">
      <nav aria-label={t("primary")}>
        <ul className="divide-brand-900/10 divide-y">
          {primary.map((item) => (
            <li key={item.key}>
              {hasMegaMenu(item) ? (
                <details className="group">
                  <summary
                    className={`${rowClass} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}
                  >
                    {t(item.key)}
                    <span className="bg-brand-900/6 group-open:bg-brand-800 group-open:text-paper flex size-8 shrink-0 items-center justify-center rounded-full transition-colors">
                      <ChevronDown className="transition-transform duration-300 group-open:rotate-180" />
                    </span>
                  </summary>

                  <div className="space-y-4 pb-5">
                    {item.countries.map((country) => (
                      <div key={country.key}>
                        <Link
                          href={country.href}
                          className="text-brand-500 flex items-center gap-2.5 text-[10.5px] font-bold tracking-[0.16em] uppercase"
                        >
                          <Flag country={country.flag} />
                          {td(country.key)}
                        </Link>

                        <ul className="mt-2.5 space-y-2">
                          {country.regions.flatMap((region) =>
                            region.tours.map((tour) => (
                              <li key={tour.key}>
                                <Link
                                  href={tour.href}
                                  className="ring-brand-900/8 flex items-center gap-3.5 rounded-2xl bg-white p-2.5 ring-1"
                                >
                                  <span className="relative size-12 shrink-0 overflow-hidden rounded-xl">
                                    <Image
                                      src={tour.image}
                                      alt={tt(`${tour.key}.name`)}
                                      fill
                                      sizes="48px"
                                      className="object-cover"
                                    />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="text-brand-900 block text-[13.5px] leading-snug font-semibold">
                                      {tt(`${tour.key}.name`)}
                                    </span>
                                    <span className="text-brand-600/70 mt-0.5 block text-[11.5px]">
                                      {t("days", { count: tour.days })} ·{" "}
                                      {tt(`${tour.key}.summary`)}
                                    </span>
                                  </span>
                                  <ArrowRight className="text-brand-400 shrink-0" />
                                </Link>
                              </li>
                            )),
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </details>
              ) : (
                plainLink(item)
              )}
            </li>
          ))}
        </ul>

        <p className="text-brand-500 pt-7 pb-1 text-[10.5px] font-bold tracking-[0.18em] uppercase">
          {t("more")}
        </p>
        <ul className="divide-brand-900/10 border-brand-900/10 divide-y border-t">
          {more.map((item) => (
            <li key={item.key}>{plainLink(item)}</li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto pt-8">
        <Link
          href="/custom-expeditions"
          className="bg-brand-800 text-cream-100 flex h-13 items-center justify-center gap-2.5 rounded-full text-[11.5px] font-bold tracking-[0.13em] uppercase"
        >
          {t("cta")}
          <ArrowRight />
        </Link>

        <div className="border-brand-900/10 mt-6 border-t pt-6">
          <p className="text-brand-500 text-[10.5px] font-bold tracking-[0.18em] uppercase">
            {t("followUs")}
          </p>
          <ul className="mt-3.5 flex items-center gap-2.5">
            {socialLinks.map(({ key, label, href, Icon }) => (
              <li key={key}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="border-brand-900/12 text-brand-800 hover:border-brand-800 hover:bg-brand-800 hover:text-paper flex size-11 items-center justify-center rounded-full border transition-colors"
                >
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
