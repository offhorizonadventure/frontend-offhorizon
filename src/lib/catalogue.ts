import "server-only";

import { unstable_cache } from "next/cache";

import { createClient as createSessionClient } from "@/lib/supabase/server";

import { createClient } from "@supabase/supabase-js";

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
  featured: boolean;
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
  expect: ExpectPanel[];
  highlights: Highlight[];
  programme: ProgrammeDay[];
  gallery: GalleryImage[];
  faqs: TourFaq[];
  rating: number | null;
  reviews: number | null;
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

export const listDepartures = unstable_cache(
  async (tourId?: string): Promise<Departure[]> => {
    const supabase = client();
    if (!supabase) return [];

    const today = new Date().toISOString().slice(0, 10);
    let query = supabase
      .from("departures")
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

export const priceFrom = (departures: Departure[]) => {
  const prices = departures
    .map((departure) => departure.rider_price)
    .filter((price): price is number => typeof price === "number");

  return prices.length ? Math.min(...prices) : null;
};

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
