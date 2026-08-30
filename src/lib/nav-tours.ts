import "server-only";

import { getLocale } from "next-intl/server";

import type { Locale } from "@/i18n/config";
import { imageUrl, listDepartures, listTours, tourPath } from "@/lib/catalogue";
import { translate } from "@/lib/translated";

export type NavTour = {
  href: string;
  title: string;
  image: string | null;
  location: string | null;
  region: string;
  /** Days on the road, taken from a real departure rather than the free text. */
  days: number | null;
  bestSeller: boolean;
};

const dayCount = (start: string, end: string) =>
  Math.max(
    1,
    Math.round(
      (new Date(`${end}T00:00:00Z`).getTime() - new Date(`${start}T00:00:00Z`).getTime()) /
        86_400_000,
    ) + 1,
  );

/** The slug an address ends in. */
export const slugOf = (href: string) => href.split("/").filter(Boolean).pop() ?? "";

/**
 * The tours the menu lists, grouped by the country they run in.
 *
 * The menu used to carry its own written list, which drifted from the tours
 * that actually exist: it named trips never published and missed ones that
 * were. Countries and regions are still written down, because a country with
 * nothing running still has a page worth reading, but what hangs under them
 * comes from the database.
 */
export async function navToursByCountry(): Promise<Map<string, NavTour[]>> {
  const locale = (await getLocale()) as Locale;
  const [tours, departures] = await Promise.all([listTours(), listDepartures()]);

  // The soonest departure is the one whose length the menu quotes.
  const lengths = new Map<string, number>();
  for (const departure of departures) {
    if (lengths.has(departure.tour_id)) continue;
    lengths.set(departure.tour_id, dayCount(departure.start_date, departure.end_date));
  }

  const grouped = new Map<string, NavTour[]>();

  for (const source of tours) {
    const country = source.country;
    if (!country) continue;

    const tour = translate(source, locale);

    const entry: NavTour = {
      href: tourPath(tour),
      title: tour.title,
      image: imageUrl(tour.hero_path),
      location: tour.facts?.location?.trim() || null,
      region: tour.region ?? "",
      days: lengths.get(tour.id) ?? null,
      bestSeller: Boolean(tour.best_seller),
    };

    const existing = grouped.get(country);
    if (existing) existing.push(entry);
    else grouped.set(country, [entry]);
  }

  return grouped;
}

/**
 * The tours belonging under one heading of a country's menu.
 *
 * Not every country splits into regions with pages of their own. Where it does
 * not, the region address is the country's own, and a tour recording a region
 * name would match nothing and vanish from the menu. Anything that matches no
 * heading is gathered under the first one rather than lost.
 */
export function toursUnder(all: NavTour[], regionSlugs: string[], index: number): NavTour[] {
  const slug = regionSlugs[index];

  return all.filter((tour) =>
    tour.region === slug ? true : index === 0 && !regionSlugs.includes(tour.region),
  );
}
