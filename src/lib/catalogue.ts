import "server-only";

import { unstable_cache } from "next/cache";

import { createClient as createSessionClient } from "@/lib/supabase/server";
import {
  resolvePrices,
  TOUR_PRICE_COLUMNS,
  type ResolvedPrices,
  type TourPrices,
} from "@/lib/departure-prices";

import { createClient } from "@supabase/supabase-js";

/**
 * The tour is read alongside every departure, because the prices live there.
 * One join rather than a second round trip, and rather than each caller having
 * to remember to do it.
 */
const DEPARTURE_COLUMNS = `
  *,
  tour:tours(${TOUR_PRICE_COLUMNS}),
  departure_vehicles(position, vehicles(*))
`;

const BUCKET = "tours";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const imageUrl = (path: string | null | undefined) =>
  path && url ? `${url}/storage/v1/object/public/${BUCKET}/${path}` : null;

function client() {
  if (!url || !key) return null;

  return createClient(url, key, { auth: { persistSession: false } });
}

export const CATALOGUE_TAG = "catalogue";
export const tourTag = (slug: string) => `tour:${slug}`;

const DAY = 60 * 60 * 24;

export type CountrySlug = "india" | "nepal" | "tibet" | "bhutan" | "sri-lanka" | "mongolia";

export type Facts = Partial<Record<string, string>>;

const COUNTRY_NAMES: Record<CountrySlug, string> = {
  india: "India",
  nepal: "Nepal",
  tibet: "Tibet",
  bhutan: "Bhutan",
  "sri-lanka": "Sri Lanka",
  mongolia: "Mongolia",
};

export const countryName = (slug: string | null | undefined) =>
  COUNTRY_NAMES[slug as CountrySlug] ?? null;

export const COUNTRY_SLUGS = Object.keys(COUNTRY_NAMES) as CountrySlug[];

export const isCountrySlug = (value: string): value is CountrySlug =>
  Object.hasOwn(COUNTRY_NAMES, value);

export const tourPath = (tour: { slug: string; country: string | null }) =>
  tour.country && isCountrySlug(tour.country)
    ? `/${tour.country}/${tour.slug}`
    : `/adventure/${tour.slug}`;

export type ExpectPanel = { key: string; tab: string; title: string; body: string };
export type Highlight = { path: string | null; label: string; alt: string };
export type ProgrammeDay = {
  day: number;
  title: string;
  stay: string;
  body: string;
  path: string | null;
  alt: string;
};
export type GalleryImage = { path: string; alt: string };

export type TourFaq = { question: string; answer: string };

export type Tour = {
  id: string;
  created_at: string;
  slug: string;
  title: string;
  lead: string | null;
  country: CountrySlug | null;
  region: string | null;
  best_seller: boolean;
  hero_path: string | null;
  hero_alt: string | null;
  visibility: "public" | "private";
  place_title: string | null;
  place_body: string | null;
  facts: Facts;
  included_items: Inclusion[];
  excluded_items: Inclusion[];
  route_map_path: string | null;
  route_map_alt: string | null;

  /** What Google shows. Blank falls back to the title and the introduction. */
  meta_title: string | null;
  meta_description: string | null;
  /** The picture shown when the link is shared. Blank falls back to the hero. */
  og_path: string | null;
  og_alt: string | null;
  expect: ExpectPanel[];
  highlights: Highlight[];
  programme: ProgrammeDay[];
  gallery: GalleryImage[];
  faqs: TourFaq[];
  rating: number | null;
  reviews: number | null;

  /**
   * The list price for everything this tour sells, in one currency.
   *
   * It lives on the tour because the page has to quote a price before a
   * visitor has picked a date. A departure may discount the rider and the
   * pillion price; nothing else changes them. Null means the option is not
   * offered, which is not the same as free.
   */
  rider_price: number | null;
  pillion_price: number | null;
  damage_protection_price: number | null;
  single_room_price: number | null;
  translations: Record<string, { at: string; fields: Record<string, string> }> | null;
};

export type Vehicle = {
  id: string;
  kind: "bike" | "car";
  name: string;
  per_day_price: number | null;
  seats: number | null;
  image_path: string | null;
  image_alt: string | null;
  notes: string | null;
};

export const fleetImageUrl = (path: string | null | undefined) =>
  path && url ? `${url}/storage/v1/object/public/fleet/${path}` : null;

export type Departure = {
  id: string;
  tour_id: string;
  start_date: string;
  end_date: string;
  sold_out: boolean;
  currency: string;
  /** Taken off the tour's list price on this date. Zero is the common case. */
  rider_discount: number;
  pillion_discount: number;
  /** Filled by the query from the tour's prices and the discounts above. */
  prices: ResolvedPrices;
  /** Superseded by the tour's prices. Read only as a fallback, never written. */
  rider_price: number | null;
  pillion_price: number | null;
  damage_protection_price: number | null;
  single_room_price: number | null;
  edition: string | null;
  direction: string | null;
  leader: string | null;
  seats: number | null;
  seats_taken: number;
  visibility: "public" | "private";
  assigned_user_id: string | null;
  notes: string | null;
  kind: "motorbike" | "4x4";
  bike_name: string | null;
  vehicles: Vehicle[];
};

const unquote = (line: string) => line.replace(/^["“]([\s\S]*)["”]$/, "$1").trim();

export type Inclusion = { title: string; body: string };

const asInclusions = (items: unknown): Inclusion[] =>
  ((items ?? []) as Inclusion[])
    .map((row) => ({ title: unquote(row.title ?? ""), body: unquote(row.body ?? "") }))
    .filter((row) => row.title);

const shape = (row: Record<string, unknown>): Tour => ({
  ...(row as unknown as Tour),
  included_items: asInclusions(row.included_items),
  excluded_items: asInclusions(row.excluded_items),
  facts: (row.facts ?? {}) as Facts,
  expect: (row.expect ?? []) as ExpectPanel[],
  highlights: (row.highlights ?? []) as Highlight[],
  programme: (row.programme ?? []) as ProgrammeDay[],
  gallery: (row.gallery ?? []) as GalleryImage[],
  faqs: (row.faqs ?? []) as TourFaq[],
});

export const listTours = unstable_cache(
  async (): Promise<Tour[]> => {
    const supabase = client();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("tours")
      .select("*")
      .eq("status", "published")
      .order("updated_at", { ascending: false });

    // Best sellers first, ordered here rather than in the query. Sorting on a
    // column asks the database for it by name, and a name it does not have yet
    // fails the whole read and empties the site.
    return error
      ? []
      : (data ?? [])
          .map(shape)
          .sort((a, b) => Number(b.best_seller ?? false) - Number(a.best_seller ?? false));
  },
  ["tours"],
  { tags: [CATALOGUE_TAG], revalidate: DAY },
);

export const getTour = unstable_cache(
  async (slug: string): Promise<Tour | null> => {
    const supabase = client();
    if (!supabase) return null;

    const { data } = await supabase
      .from("tours")
      .select("*")
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();

    return data ? shape(data) : null;
  },
  ["tour"],
  { tags: [CATALOGUE_TAG], revalidate: DAY },
);

export const listDepartures = unstable_cache(
  async (tourId?: string): Promise<Departure[]> => {
    const supabase = client();
    if (!supabase) return [];

    const today = new Date().toISOString().slice(0, 10);
    let query = supabase
      .from("departures")
      .select(DEPARTURE_COLUMNS)
      .eq("status", "published")
      .gt("start_date", today)
      .order("start_date");

    if (tourId) query = query.eq("tour_id", tourId);

    const { data, error } = await query;

    return error ? [] : withVehicles(data ?? []);
  },
  ["departures"],
  { tags: [CATALOGUE_TAG], revalidate: 60 * 60 },
);

function withVehicles(rows: unknown[]): Departure[] {
  type Link = { position: number; vehicles: Vehicle | null };

  return rows.map((row) => {
    const links = ((row as { departure_vehicles?: Link[] }).departure_vehicles ?? [])
      .slice()
      .sort((a, b) => a.position - b.position);

    const departure = row as Departure;

    return {
      ...departure,
      // Worked out here, once, so nothing downstream has to know that a price
      // is the tour's list price less this date's discount.
      prices: resolvePrices((row as { tour?: TourPrices | null }).tour, departure),
      vehicles: links
        .map((link) => link.vehicles)
        .filter((vehicle): vehicle is Vehicle => Boolean(vehicle)),
    };
  });
}

/** The lowest a rider actually pays across these dates, discounts included. */
export const priceFrom = (departures: Departure[]) => {
  const prices = departures
    .map((departure) => departure.prices.rider)
    .filter((price): price is number => typeof price === "number" && price > 0);

  return prices.length ? Math.min(...prices) : null;
};

export async function listMyDepartures(tourId?: string): Promise<Departure[]> {
  const supabase = await createSessionClient();
  const { data: session } = await supabase.auth.getUser();
  if (!session.user) return [];

  const today = new Date().toISOString().slice(0, 10);

  let query = supabase
    .from("departures")
    .select(DEPARTURE_COLUMNS)
    .eq("status", "published")
    .eq("visibility", "private")
    .eq("assigned_user_id", session.user.id)
    .gte("start_date", today)
    .order("start_date");

  if (tourId) query = query.eq("tour_id", tourId);

  const { data, error } = await query;

  return error ? [] : withVehicles(data ?? []);
}

export async function listMyExpeditions(): Promise<{ tour: Tour; departures: Departure[] }[]> {
  const departures = await listMyDepartures();
  if (!departures.length) return [];

  const supabase = await createSessionClient();
  const ids = [...new Set(departures.map((departure) => departure.tour_id))];

  const { data } = await supabase.from("tours").select("*").in("id", ids);

  return (data ?? []).map((row) => {
    const tour = shape(row);

    return { tour, departures: departures.filter((entry) => entry.tour_id === tour.id) };
  });
}
