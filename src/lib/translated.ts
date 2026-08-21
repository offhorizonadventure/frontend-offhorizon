import type { Tour } from "@/lib/catalogue";

/** A tour in the language being read. */
export function translate(tour: Tour, locale: string): Tour {
  if (locale === "en") return tour;

  const fields = tour.translations?.[locale]?.fields;
  if (!fields || !Object.keys(fields).length) return tour;

  const at = (path: string, fallback: string | null) => fields[path] ?? fallback;

  return {
    ...tour,
    title: at("title", tour.title) ?? tour.title,
    lead: at("lead", tour.lead),
    place_title: at("place_title", tour.place_title),
    place_body: at("place_body", tour.place_body),
    hero_alt: at("hero_alt", tour.hero_alt),
    route_map_alt: at("route_map_alt", tour.route_map_alt),

    facts: Object.fromEntries(
      Object.entries(tour.facts ?? {}).map(([key, value]) => [
        key,
        at(`facts.${key}`, value ?? ""),
      ]),
    ),

    expect: tour.expect.map((panel, index) => ({
      ...panel,
      tab: at(`expect.${index}.tab`, panel.tab) ?? panel.tab,
      title: at(`expect.${index}.title`, panel.title) ?? panel.title,
      body: at(`expect.${index}.body`, panel.body) ?? panel.body,
    })),

    highlights: tour.highlights.map((highlight, index) => ({
      ...highlight,
      label: at(`highlights.${index}.label`, highlight.label) ?? highlight.label,
      alt: at(`highlights.${index}.alt`, highlight.alt) ?? highlight.alt,
    })),

    programme: tour.programme.map((day, index) => ({
      ...day,
      title: at(`programme.${index}.title`, day.title) ?? day.title,
      stay: at(`programme.${index}.stay`, day.stay) ?? day.stay,
      body: at(`programme.${index}.body`, day.body) ?? day.body,
    })),

    included_items: tour.included_items.map((item, index) => ({
      title: at(`included_items.${index}.title`, item.title) ?? item.title,
      body: at(`included_items.${index}.body`, item.body) ?? item.body,
    })),

    excluded_items: tour.excluded_items.map((item, index) => ({
      title: at(`excluded_items.${index}.title`, item.title) ?? item.title,
      body: at(`excluded_items.${index}.body`, item.body) ?? item.body,
    })),

    gallery: tour.gallery.map((image, index) => ({
      ...image,
      alt: at(`gallery.${index}.alt`, image.alt) ?? image.alt,
    })),
  };
}
