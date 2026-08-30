import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { DestinationsMenu } from "@/components/layout/DestinationsMenu";
import { Flag } from "@/components/ui/Flag";
import { ArrowRight } from "@/components/ui/icons";
import { hasMegaMenu, mainNav, type Country } from "@/config/navigation";
import { Link } from "@/i18n/navigation";
import { bestSellerPaths } from "@/lib/best-sellers";

const trigger =
  "nav-link relative flex h-8 items-center gap-1 text-[11px] font-semibold tracking-[0.08em] whitespace-nowrap text-brand-900/75 uppercase transition-colors duration-200 hover:text-brand-800";

export async function DesktopNav() {
  const t = await getTranslations("nav");

  return (
    <nav aria-label={t("primary")} className="hidden lg:block">
      <ul className="flex items-center gap-3.5 xl:gap-5">
        {mainNav.map((item) =>
          hasMegaMenu(item) ? (
            <li key={item.key}>
              <DestinationsMenu label={t(item.key)} closeLabel={t("closeMenu")}>
                <Panel countries={item.countries} />
              </DestinationsMenu>
            </li>
          ) : (
            <li key={item.key}>
              <Link href={item.href} className={trigger}>
                {t(item.key)}
              </Link>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}

async function Panel({ countries }: { countries: Country[] }) {
  const [best, t, td, tt, tb] = await Promise.all([
    bestSellerPaths(),
    getTranslations("nav"),
    getTranslations("destinations"),
    getTranslations("tours"),
    getTranslations("dest.shared"),
  ]);

  return (
    <div>
      <div className="columns-2 gap-9 xl:columns-3">
        {countries.map((country) => (
          <section key={country.key} className="mb-8 break-inside-avoid last:mb-0">
            <Link
              href={country.href}
              className="group/c border-brand-900/8 flex items-center gap-2.5 border-b pb-3"
            >
              <Flag country={country.flag} />
              <span className="font-display text-brand-800 text-[13px] font-bold tracking-[0.1em] uppercase">
                {td(country.key)}
              </span>
              <ArrowRight className="text-brand-500 -translate-x-1 opacity-0 transition-all duration-200 group-hover/c:translate-x-0 group-hover/c:opacity-100" />
            </Link>

            {country.regions.map((region) => (
              <div key={region.key} className="mt-4">
                <p className="text-brand-400 text-[10px] font-semibold tracking-[0.18em] uppercase">
                  {td(region.key)}
                </p>
                <ul className="mt-2.5 space-y-1">
                  {region.tours.map((tour) => (
                    <li key={tour.key}>
                      <Link
                        href={tour.href}
                        className="group/t hover:bg-cream-100/70 flex items-center gap-3.5 rounded-2xl p-1.5 transition-colors duration-200"
                      >
                        <span className="relative size-12 shrink-0 overflow-hidden rounded-xl">
                          <Image
                            src={tour.image}
                            alt={tt(`${tour.key}.name`)}
                            fill
                            sizes="48px"
                            className="object-cover transition-transform duration-500 group-hover/t:scale-110"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="text-brand-900 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] leading-snug font-semibold">
                            {tt(`${tour.key}.name`)}
                            {best.has(tour.href) && (
                              <span className="bg-ember-500/12 text-ember-600 rounded-full px-2 py-0.5 text-[9.5px] font-bold tracking-[0.1em] uppercase">
                                {tb("bestSeller")}
                              </span>
                            )}
                          </span>
                          <span className="text-brand-600/75 mt-0.5 block text-[11.5px]">
                            {t("days", { count: tour.days })} · {tt(`${tour.key}.summary`)}
                          </span>
                        </span>
                        <ArrowRight className="text-brand-500 shrink-0 -translate-x-1 opacity-0 transition-all duration-200 group-hover/t:translate-x-0 group-hover/t:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ))}
      </div>

      <Link
        href="/destinations"
        className="group/a border-brand-900/10 mt-4 flex items-center justify-between border-t pt-5"
      >
        <span className="text-brand-700/80 text-[12.5px]">{t("allDestinationsHint")}</span>
        <span className="text-brand-800 flex items-center gap-1.5 text-[12px] font-bold tracking-[0.08em] uppercase">
          {t("viewAllDestinations")}
          <ArrowRight className="transition-transform duration-200 group-hover/a:translate-x-1" />
        </span>
      </Link>
    </div>
  );
}
