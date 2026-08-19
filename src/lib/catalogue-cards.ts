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
      // Whichever currency the departures are quoted in. Mixed currencies on one
      // tour would be a data problem, not something to paper over here.
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

/**
 * The tours on one region page.
 *
 * A tour with no region set still belongs to the country, so it is shown on
 * every region of it rather than nowhere: an unfiled tour should be too visible
 * rather than invisible.
 */
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
