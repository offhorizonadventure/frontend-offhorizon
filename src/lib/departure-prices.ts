/**
 * What one dated running of a tour costs.
 *
 * The list price belongs to the tour, because the site has to quote a tour
 * before a visitor has picked a date. It used to belong to each departure, and
 * the tour page showed the cheapest departure's rider, pillion, protection and
 * room prices as though they were the tour's: adding one cheap date rewrote the
 * advertised price of every other date, and the total the booking wizard agreed
 * with the rider disagreed with the total at the checkout.
 *
 * A departure now decides one thing only: what comes off the rider and the
 * pillion price on that date. Everything that quotes money goes through here,
 * so the wizard, the checkout and the office cannot drift apart.
 *
 * Pure and client safe: no server-only, no Supabase.
 */

export type TourPrices = {
  rider_price: number | null;
  pillion_price: number | null;
  damage_protection_price: number | null;
  single_room_price: number | null;
};

export type DepartureDiscounts = {
  rider_discount?: number | null;
  pillion_discount?: number | null;
};

export type ResolvedPrices = {
  rider: number | null;
  pillion: number | null;
  protection: number | null;
  room: number | null;
  /** Before the discount, so a page can strike it through. */
  listRider: number | null;
  listPillion: number | null;
  riderDiscount: number;
  pillionDiscount: number;
};

const off = (list: number | null, discount: number) =>
  list === null ? null : Math.max(0, Math.round((list - discount) * 100) / 100);

/**
 * `legacy` is the departure's own price columns, which nothing writes any more.
 * They stand in only where the tour has no price for that field, so a database
 * that has not run `patch-tour-prices.sql` yet keeps quoting what it always
 * quoted instead of quoting nothing at all.
 */
export function resolvePrices(
  tour: TourPrices | null | undefined,
  departure: DepartureDiscounts & Partial<TourPrices>,
): ResolvedPrices {
  const pick = (key: keyof TourPrices) => tour?.[key] ?? departure[key] ?? null;

  const riderDiscount = Math.max(0, departure.rider_discount ?? 0);
  const pillionDiscount = Math.max(0, departure.pillion_discount ?? 0);

  const listRider = pick("rider_price");
  const listPillion = pick("pillion_price");

  return {
    rider: off(listRider, riderDiscount),
    pillion: off(listPillion, pillionDiscount),
    // Neither is discounted per date: they are the same extra whenever it runs.
    protection: pick("damage_protection_price"),
    room: pick("single_room_price"),
    listRider,
    listPillion,
    riderDiscount,
    pillionDiscount,
  };
}

/** The columns a query needs to resolve a departure's prices. */
export const TOUR_PRICE_COLUMNS =
  "rider_price, pillion_price, damage_protection_price, single_room_price";
