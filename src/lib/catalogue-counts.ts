import "server-only";

import { listDepartures, listTours, type Tour } from "@/lib/catalogue";

export async function runningByCountry(): Promise<{
  counts: Map<string, number>;
  tours: Tour[];
  total: number;
}> {
  const [tours, departures] = await Promise.all([listTours(), listDepartures()]);

  const scheduled = new Set(departures.map((departure) => departure.tour_id));
  const counts = new Map<string, number>();

  for (const tour of tours) {
    if (!tour.country || !scheduled.has(tour.id)) continue;
    counts.set(tour.country, (counts.get(tour.country) ?? 0) + 1);
  }

  return { counts, tours, total: [...counts.values()].reduce((sum, n) => sum + n, 0) };
}
