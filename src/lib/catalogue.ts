import "server-only";

import { unstable_cache } from "next/cache";

import { createClient as createSessionClient } from "@/lib/supabase/server";

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
/** Days before departure that a place stops being sold. */
export const BOOKING_CLOSES_DAYS = 30;

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

/**
 * Where a tour lives, without the locale.
 *
 * The country is part of the address because that is how people look for these
 * trips. A tour filed under no country has nowhere to sit, so it keeps the old
 * shape rather than inventing one.
 */
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

/** A question riders ask before they book, and the answer they get. */
export type TourFaq = { question: string; answer: string };

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
  /**
   * Kept in step with the column. Custom expeditions live on the departure, so
   * this stays public unless a bespoke route ever needs a page of its own.
   */
  visibility: "public" | "private";
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
  faqs: TourFaq[];
  rating: number | null;
  reviews: number | null;
  /** Machine translations keyed by locale, applied by `lib/translated`. */
  translations: Record<string, { at: string; fields: Record<string, string> }> | null;
};

/** A car on a 4x4 expedition. */
export type Vehicle = {
  id: string;
  /** A motorcycle carries its rider; a car carries a party. */
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
  rider_price: number | null;
  pillion_price: number | null;
  damage_protection_price: number | null;
  single_room_price: number | null;
  edition: string | null;
  direction: string | null;
  leader: string | null;
  seats: number | null;
  seats_taken: number;
  /** A custom expedition: this running belongs to one rider. */
  visibility: "public" | "private";
  assigned_user_id: string | null;
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
  faqs: (row.faqs ?? []) as TourFaq[],
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

    // Off sale 30 days out: the balance is due at 14, the permits are filed and
    // the group is closed, so an empty seat is no longer an offer. Riders who
    // booked keep seeing theirs on their account, which reads the booking rather
    // than this list.
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() + BOOKING_CLOSES_DAYS);
    const today = cutoff.toISOString().slice(0, 10);
    let query = supabase
      .from("departures")
      // The join is read as a nested select rather than a second round trip.
      .select("*, departure_vehicles(position, vehicles(*))")
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

/** Cars come back as a join table; the page wants them on the departure. */
function withVehicles(rows: unknown[]): Departure[] {
  type Link = { position: number; vehicles: Vehicle | null };

  return rows.map((row) => {
    const links = ((row as { departure_vehicles?: Link[] }).departure_vehicles ?? [])
      .slice()
      .sort((a, b) => a.position - b.position);

    return {
      ...(row as Departure),
      vehicles: links
        .map((link) => link.vehicles)
        .filter((vehicle): vehicle is Vehicle => Boolean(vehicle)),
    };
  });
}

/** The cheapest rider price on offer, which is what "from" means on a card. */
export const priceFrom = (departures: Departure[]) => {
  const prices = departures
    .map((departure) => departure.rider_price)
    .filter((price): price is number => typeof price === "number");

  return prices.length ? Math.min(...prices) : null;
};

/**
 * The reader's own custom departures, on one tour or across all of them.
 *
 * The catalogue is cached and read anonymously, and row level security only
 * shows a private departure to the rider it was sold to, so the cache can
 * never hold one. This asks with their session instead, and keeps every date:
 * a custom expedition is a conversation, not a seat on sale, so the thirty day
 * cut off does not apply to it.
 */
export async function listMyDepartures(tourId?: string): Promise<Departure[]> {
  const supabase = await createSessionClient();
  const { data: session } = await supabase.auth.getUser();
  if (!session.user) return [];

  const today = new Date().toISOString().slice(0, 10);

  let query = supabase
    .from("departures")
    .select("*, departure_vehicles(position, vehicles(*))")
    .eq("status", "published")
    .eq("visibility", "private")
    .eq("assigned_user_id", session.user.id)
    .gte("start_date", today)
    .order("start_date");

  if (tourId) query = query.eq("tour_id", tourId);

  const { data, error } = await query;

  return error ? [] : withVehicles(data ?? []);
}

/** The tours those custom departures belong to, for the account page. */
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
