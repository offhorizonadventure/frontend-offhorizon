import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { DestinationsMenu } from "@/components/layout/DestinationsMenu";
import { Flag } from "@/components/ui/Flag";
import { ArrowRight, Compass } from "@/components/ui/icons";
import { hasMegaMenu, mainNav, type Country } from "@/config/navigation";
import { Link } from "@/i18n/navigation";
import { navToursByCountry, slugOf, toursUnder } from "@/lib/nav-tours";

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
  const [byCountry, t, td, tb] = await Promise.all([
    navToursByCountry(),
    getTranslations("nav"),
    getTranslations("destinations"),
    getTranslations("dest.shared"),
  ]);

  return (
    <div>
      <div className="columns-2 gap-9 xl:columns-3">
        {countries.map((country) => {
          const mine = byCountry.get(slugOf(country.href)) ?? [];
          const slugs = country.regions.map((region) => slugOf(region.href));

          // Whether anything at all will appear under this country.
          //
          // Asked of the headings rather than of the tour list, because they
          // are what actually renders. A country with tours but no heading to
          // hang them under would pass a check on the list and still draw a
          // gap, which is the thing being fixed.
          const shows = country.regions.some(
            (_, index) => toursUnder(mine, slugs, index).length > 0,
          );

          return (
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

              {/* A country with nothing running at all.
                  
                  Six countries are offered and three of them have no dated
                  expedition yet, so those columns were a flag, a name and a gap
                  the height of the ones beside them. A menu that leaves holes
                  reads as broken rather than as early, and the honest answer is
                  also the useful one: the route is being put together, and the
                  person reading can say when they want to ride. */}
              {!shows && (
                <Link
                  href="/custom-expeditions"
                  className="group/s border-brand-900/12 hover:border-brand-800/25 hover:bg-cream-100/70 mt-4 flex items-center gap-3.5 rounded-2xl border border-dashed p-2.5 transition-colors duration-200"
                >
                  <span className="bg-brand-100/70 text-brand-500 flex size-12 shrink-0 items-center justify-center rounded-xl">
                    <Compass />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-brand-900 block text-[13px] leading-snug font-semibold">
                      {tb("comingSoon")}
                    </span>
                    <span className="text-brand-600/75 mt-0.5 block text-[11.5px] leading-snug text-pretty">
                      {tb("comingSoonBody")}
                    </span>
                  </span>
                  <ArrowRight className="text-brand-500 shrink-0 -translate-x-1 opacity-0 transition-all duration-200 group-hover/s:translate-x-0 group-hover/s:opacity-100" />
                </Link>
              )}

              {country.regions.map((region, index) => {
                const tours = toursUnder(mine, slugs, index);
                // A region with nothing running is left out. The country stays
                // either way, because its page is worth reading on its own.
                if (tours.length === 0) return null;

                return (
                  <div key={region.key} className="mt-4">
                    <p className="text-brand-400 text-[10px] font-semibold tracking-[0.18em] uppercase">
                      {td(region.key)}
                    </p>
                    <ul className="mt-2.5 space-y-1">
                      {tours.map((tour) => (
                        <li key={tour.href}>
                          <Link
                            href={tour.href}
                            className="group/t hover:bg-cream-100/70 flex items-center gap-3.5 rounded-2xl p-1.5 transition-colors duration-200"
                          >
                            <span className="bg-brand-100 relative size-12 shrink-0 overflow-hidden rounded-xl">
                              {tour.image && (
                                <Image
                                  src={tour.image}
                                  alt={tour.title}
                                  fill
                                  sizes="48px"
                                  className="object-cover transition-transform duration-500 group-hover/t:scale-110"
                                />
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="text-brand-900 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] leading-snug font-semibold">
                                {tour.title}
                                {tour.bestSeller && (
                                  <span className="bg-ember-500/12 text-ember-600 shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-bold tracking-[0.1em] uppercase">
                                    {tb("bestSeller")}
                                  </span>
                                )}
                              </span>
                              <span className="text-brand-600/75 mt-0.5 block text-[11.5px]">
                                {[tour.days ? t("days", { count: tour.days }) : null, tour.location]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </span>
                            </span>
                            <ArrowRight className="text-brand-500 shrink-0 -translate-x-1 opacity-0 transition-all duration-200 group-hover/t:translate-x-0 group-hover/t:opacity-100" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </section>
          );
        })}
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
