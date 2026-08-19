import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Tours and their departures, read from Supabase.
 *
 * Read only and unauthenticated. Row level security returns published rows
 * only, so a draft tour cannot reach the site even if its address is guessed.
 *
 * This replaces the tour half of `config/tour-pages.ts`. The written copy that
 * is still translated (headings, labels, the standing sections of a page) stays
 * in the message files; what an editor types in the admin arrives in one
 * language, which is the language it was typed in.
 */

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

export type CountrySlug = "india" | "nepal" | "bhutan" | "sri-lanka" | "mongolia";

export type Facts = Partial<Record<string, string>>;

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
  included: string[];
  excluded: string[];
  route_map_path: string | null;
  route_map_alt: string | null;
  expect: ExpectPanel[];
  highlights: Highlight[];
  programme: ProgrammeDay[];
  gallery: GalleryImage[];
  rating: number | null;
  reviews: number | null;
};

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
};

/**
 * Strips a wrapping pair of quotes.
 *
 * Inclusion lines are often pasted in already quoted, and the quotes are part
 * of how they were written down, not part of the sentence.
 */
const unquote = (line: string) => line.replace(/^["“]([\s\S]*)["”]$/, "$1").trim();

const cleanList = (lines: string[] | null | undefined) =>
  (lines ?? []).map(unquote).filter(Boolean);

const shape = (row: Record<string, unknown>): Tour => ({
  ...(row as unknown as Tour),
  included: cleanList(row.included as string[]),
  excluded: cleanList(row.excluded as string[]),
  facts: (row.facts ?? {}) as Facts,
  expect: (row.expect ?? []) as ExpectPanel[],
  highlights: (row.highlights ?? []) as Highlight[],
  programme: (row.programme ?? []) as ProgrammeDay[],
  gallery: (row.gallery ?? []) as GalleryImage[],
});

export async function listTours(): Promise<Tour[]> {
  const supabase = client();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false });

  return error ? [] : (data ?? []).map(shape);
}

export async function getTour(slug: string): Promise<Tour | null> {
  const supabase = client();
  if (!supabase) return null;

  const { data } = await supabase
    .from("tours")
    .select("*")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  return data ? shape(data) : null;
}

/**
 * Published departures, soonest first, past ones dropped.
 *
 * A date that has been and gone is not a departure anyone can book, and a list
 * that still shows last June reads as a site nobody maintains.
 */
export async function listDepartures(tourId?: string): Promise<Departure[]> {
  const supabase = client();
  if (!supabase) return [];

  const today = new Date().toISOString().slice(0, 10);
  let query = supabase
    .from("departures")
    .select("*")
    .eq("status", "published")
    .gte("start_date", today)
    .order("start_date");

  if (tourId) query = query.eq("tour_id", tourId);

  const { data, error } = await query;
  return error ? [] : ((data ?? []) as Departure[]);
}

/** The cheapest rider price on offer, which is what "from" means on a card. */
export const priceFrom = (departures: Departure[]) => {
  const prices = departures
    .map((departure) => departure.rider_price)
    .filter((price): price is number => typeof price === "number");

  return prices.length ? Math.min(...prices) : null;
};
