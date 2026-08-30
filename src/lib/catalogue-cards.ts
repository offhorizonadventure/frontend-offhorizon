import "server-only";

import { listDepartures, listTours, priceFrom, type Tour } from "@/lib/catalogue";

export type Card = { tour: Tour; priceFrom: number | null; currency: string };

export function toCards(tours: Tour[], departures: Awaited<ReturnType<typeof listDepartures>>) {
  return tours.map((tour) => {
    const dated = departures.filter((departure) => departure.tour_id === tour.id);

    return {
      tour,
      priceFrom: priceFrom(dated),
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

export async function regionCards(country: string, region: string): Promise<Card[]> {
  const cards = await countryCards(country);
  return cards.filter((card) => !card.tour.region || card.tour.region === region);
}

export async function latestCards(limit = 4): Promise<Card[]> {
  const cards = await allCards();

  return [...cards]
    .sort((a, b) => b.tour.created_at.localeCompare(a.tour.created_at))
    .slice(0, limit);
}
