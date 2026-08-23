import "server-only";

import { unstable_cache } from "next/cache";

import { createClient } from "@supabase/supabase-js";

/** Tours and their departures, read from Supabase. */

const BUCKET = "tours";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const imageUrl = (path: string | null | undefined) =>
  path && url ? `${url}/storage/v1/object/public/${BUCKET}/${path}` : null;

/** Missing configuration costs the catalogue, not the whole site. */
function client() {
  if (!url || !key) return null;

  return createClient(url, key, { auth: { persistSession: false } });
}

/** Cache tags, so a save in the admin can clear exactly what it changed. */
export const CATALOGUE_TAG = "catalogue";
export const tourTag = (slug: string) => `tour:${slug}`;

const DAY = 60 * 60 * 24;

export type CountrySlug = "india" | "nepal" | "bhutan" | "sri-lanka" | "mongolia";

export type Facts = Partial<Record<string, string>>;

const COUNTRY_NAMES: Record<CountrySlug, string> = {
  india: "India",
  nepal: "Nepal",
  bhutan: "Bhutan",
  "sri-lanka": "Sri Lanka",
  mongolia: "Mongolia",
};

export const countryName = (slug: string | null | undefined) =>
  COUNTRY_NAMES[slug as CountrySlug] ?? null;

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

export type Tour = {
  id: string;
  slug: string;
  title: string;
  lead: string | null;
  country: CountrySlug | null;
  /** Matches the region slug in the public route, or null for none. */
  region: string | null;
  featured: boolean;
  hero_path: string | null;
  hero_alt: string | null;
  place_title: string | null;
  place_body: string | null;
  facts: Facts;
  included_items: Inclusion[];
  excluded_items: Inclusion[];
  route_map_path: string | null;
  route_map_alt: string | null;
  expect: ExpectPanel[];
  highlights: Highlight[];
  programme: ProgrammeDay[];
  gallery: GalleryImage[];
  rating: number | null;
  reviews: number | null;
  /** Machine translations keyed by locale, applied by `lib/translated`. */
  translations: Record<string, { at: string; fields: Record<string, string> }> | null;
};

/** A car on a 4x4 expedition. */
export type Vehicle = {
  id: string;
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
  rider_price: number | null;
  pillion_price: number | null;
  damage_protection_price: number | null;
  single_room_price: number | null;
  edition: string | null;
  direction: string | null;
  leader: string | null;
  seats: number | null;
  seats_taken: number;
  notes: string | null;
  kind: "motorbike" | "4x4";
  bike_name: string | null;
  /** The cars this expedition runs, in the order the admin put them. */
  vehicles: Vehicle[];
};

/** Strips a wrapping pair of quotes. */
const unquote = (line: string) => line.replace(/^["“]([\s\S]*)["”]$/, "$1").trim();

/** One line of what is in the price, or what is not. */
export type Inclusion = { title: string; body: string };

// Inclusion lines are often pasted in already quoted; the quotes are not the sentence.
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
});

/** Every published tour, read once a day rather than once a visitor. */
export const listTours = unstable_cache(
  async (): Promise<Tour[]> => {
    const supabase = client();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("tours")
      .select("*")
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("updated_at", { ascending: false });

    return error ? [] : (data ?? []).map(shape);
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

/** Published departures, soonest first, finished ones dropped. */
export const listDepartures = unstable_cache(
  async (tourId?: string): Promise<Departure[]> => {
    const supabase = client();
    if (!supabase) return [];

    // A departure that has already set off cannot be joined, so the cut is the
    // start date rather than the end date.
    const today = new Date().toISOString().slice(0, 10);
    let query = supabase
      .from("departures")
      // The join is read as a nested select rather than a second round trip.
      .select("*, departure_vehicles(position, vehicles(*))")
      .eq("status", "published")
      .gt("start_date", today)
      .order("start_date");

    if (tourId) query = query.eq("tour_id", tourId);

    const { data, error } = await query;
    if (error) return [];

    type Link = { position: number; vehicles: Vehicle | null };

    return (data ?? []).map((row) => {
      const links = ((row as { departure_vehicles?: Link[] }).departure_vehicles ?? [])
        .slice()
        .sort((a, b) => a.position - b.position);

      return {
        ...(row as unknown as Departure),
        vehicles: links
          .map((link) => link.vehicles)
          .filter((vehicle): vehicle is Vehicle => Boolean(vehicle)),
      };
    });
  },
  ["departures"],
  { tags: [CATALOGUE_TAG], revalidate: 60 * 60 },
);

/** The cheapest rider price on offer, which is what "from" means on a card. */
export const priceFrom = (departures: Departure[]) => {
  const prices = departures
    .map((departure) => departure.rider_price)
    .filter((price): price is number => typeof price === "number");

  return prices.length ? Math.min(...prices) : null;
};
