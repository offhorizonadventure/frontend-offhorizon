import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Flag } from "@/components/ui/Flag";
import { ArrowRight, ChevronDown } from "@/components/ui/icons";
import { hasMegaMenu, mainNav, type Country } from "@/config/navigation";
import { Link } from "@/i18n/navigation";

/** Underline grows from the left on hover and on keyboard focus within the item. */
const trigger =
  "nav-link relative flex h-8 items-center gap-1 text-[11px] font-semibold tracking-[0.08em] whitespace-nowrap text-brand-900/75 uppercase transition-colors duration-200 hover:text-brand-800";

/** Desktop navigation - server-rendered with no JavaScript. */
export async function DesktopNav() {
  const t = await getTranslations("nav");

  return (
    <nav aria-label={t("primary")} className="hidden lg:block">
      <ul className="flex items-center gap-5 xl:gap-7">
        {mainNav.map((item) =>
          hasMegaMenu(item) ? (
            <li key={item.key} className="group relative">
              <Link href={item.href} className={trigger}>
                {t(item.key)}
                <ChevronDown className="mt-px transition-transform duration-300 group-focus-within:rotate-180 group-hover:rotate-180" />
              </Link>
              <div className="ease-out-expo invisible absolute top-full left-1/2 z-40 w-[min(50rem,calc(100vw-3rem))] -translate-x-1/2 translate-y-2 pt-4 opacity-0 transition-all duration-300 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <MegaPanel countries={item.countries} />
              </div>
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

async function MegaPanel({ countries }: { countries: Country[] }) {
  const [t, td, tt] = await Promise.all([
    getTranslations("nav"),
    getTranslations("destinations"),
    getTranslations("tours"),
  ]);

  return (
    <div className="border-brand-900/10 overflow-hidden rounded-3xl border bg-white">
      <div className="grid grid-cols-[1fr_1fr] gap-8 p-7">
        {countries.map((country) => (
          <section key={country.key}>
            <Link
              href={country.href}
              className="group/c border-brand-900/8 inline-flex items-center gap-2.5 border-b pb-3"
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
                        className="group/t hover:bg-cream-100/70 flex items-center gap-3.5 rounded-2xl p-2 transition-colors duration-200"
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
                          <span className="text-brand-900 block truncate text-[13px] font-semibold">
                            {tt(`${tour.key}.name`)}
                          </span>
                          <span className="text-brand-600/75 mt-0.5 block truncate text-[11px]">
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
        className="group/a border-brand-900/8 bg-cream-50/80 hover:bg-cream-100/80 flex items-center justify-between border-t px-7 py-4 transition-colors"
      >
        <span className="text-brand-700/80 text-[12px]">{t("allDestinationsHint")}</span>
        <span className="text-brand-800 flex items-center gap-1.5 text-[12px] font-bold tracking-[0.08em] uppercase">
          {t("viewAllDestinations")}
          <ArrowRight className="transition-transform duration-200 group-hover/a:translate-x-1" />
        </span>
      </Link>
    </div>
  );
}
