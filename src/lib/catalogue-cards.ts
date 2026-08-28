import "server-only";

import { listDepartures, listTours, priceFrom, type Tour } from "@/lib/catalogue";

export type Card = { tour: Tour; priceFrom: number | null; currency: string };

/** A tour with the two things a card needs beyond the row: a price and its currency. */
export function toCards(tours: Tour[], departures: Awaited<ReturnType<typeof listDepartures>>) {
  return tours.map((tour) => {
    const dated = departures.filter((departure) => departure.tour_id === tour.id);

    return {
      tour,
      priceFrom: priceFrom(dated),
      // Whichever currency the departures are quoted in.
      currency: dated[0]?.currency ?? "USD",
    };
  });
}

export async function allCards(): Promise<Card[]> {
  const [tours, departures] = await Promise.all([listTours(), listDepartures()]);
  return toCards(tours, departures);
}

export async function countryCards(country: string): Promise<Card[]> {
  const cards = await allCards();
  return cards.filter((card) => card.tour.country === country);
}

/** The tours on one region page. */
export async function regionCards(country: string, region: string): Promise<Card[]> {
  const cards = await countryCards(country);
  return cards.filter((card) => !card.tour.region || card.tour.region === region);
}

/** The home page selection: featured first, and never more than asked for. */
export async function featuredCards(limit = 2): Promise<Card[]> {
  const cards = await allCards();
  const featured = cards.filter((card) => card.tour.featured);

  return (featured.length ? featured : cards).slice(0, limit);
}

/**
 * The newest tours, whether or not anybody ticked featured.
 *
 * The home page used to show the featured selection, which meant a tour added
 * last week stayed off the front page until somebody remembered a checkbox.
 */
export async function latestCards(limit = 4): Promise<Card[]> {
  const cards = await allCards();

  return [...cards]
    .sort((a, b) => b.tour.created_at.localeCompare(a.tour.created_at))
    .slice(0, limit);
}
