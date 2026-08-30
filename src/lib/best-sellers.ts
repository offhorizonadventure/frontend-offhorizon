import "server-only";

import { listTours, tourPath } from "@/lib/catalogue";

/**
 * The addresses of the tours marked as best sellers.
 *
 * The menu is a hand written list of tours, and the flag lives on the tour in
 * the database. The address is the one thing both of them know, so it is what
 * they are matched on. A menu entry pointing at nothing simply carries no
 * badge.
 */
export async function bestSellerPaths(): Promise<Set<string>> {
  const tours = await listTours();

  return new Set(tours.filter((tour) => tour.best_seller).map((tour) => tourPath(tour)));
}
