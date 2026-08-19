import "server-only";

import type { Departure, Tour } from "@/lib/catalogue";
import { imageUrl } from "@/lib/catalogue";
import type { FactKey, PriceGroup } from "@/config/tour-pages";

/**
 * Turning database rows into what the tour page components already take.
 *
 * The page was built against a config file; the shapes it expects are perfectly
 * good, so this maps onto them rather than rewriting eight components. Where
 * the database says nothing, the section is dropped rather than rendered empty.
 */

/** The admin stores snake_case; the page's icons and labels are camelCase. */
const FACT_KEYS: Record<string, FactKey> = {
  location: "location",
  weather: "weather",
  vehicle: "vehicle",
  terrain: "terrain",
  distance: "distance",
  duration: "duration",
  difficulty: "difficulty",
  group_size: "groupSize",
};

/**
 * Two facts are stored as bare numbers and read badly on their own.
 *
 * Distance gets a tolerance mark, because a route length is a plan rather than
 * a measurement: detours, closures and fuel runs all move it. Duration is shown
 * as days and nights, which is the pair a traveller books flights and hotels
 * against; eleven nights sit inside twelve days, so the second number is always
 * one fewer.
 *
 * Both leave a value alone if the editor has already written it out, so typing
 * "± 1,800 km" or "12 days, 11 nights" is not doubled up.
 */
function present(key: FactKey, value: string): string {
  if (key === "distance") {
    return /^[±~+]/.test(value) ? value : `± ${value}`;
  }

  if (key === "duration") {
    const days = Number(value.match(/^\s*(\d+)\s*$/)?.[1]);
    return Number.isFinite(days) && days > 0 ? `${days}D ${days - 1}N` : value;
  }

  return value;
}

/** In the order the page shows them, skipping any the editor left blank. */
export const factList = (tour: Tour): { key: FactKey; value: string }[] =>
  Object.entries(FACT_KEYS)
    .map(([column, key]) => ({ key, value: (tour.facts?.[column] ?? "").trim() }))
    .filter((fact) => fact.value)
    .map((fact) => ({ ...fact, value: present(fact.key, fact.value) }));

/**
 * The price card, built from the cheapest departure.
 *
 * A tour can run at several prices across a season. The card says "from", so it
 * quotes the cheapest and lets the dates drawer show the rest. A line with no
 * price is left out entirely: an empty row reads as a missing feature rather
 * than as an unpriced one.
 */
export function pricing(tour: Tour, departures: Departure[]): PriceGroup[] {
  const cheapest = [...departures]
    .filter((departure) => departure.rider_price !== null)
    .sort((a, b) => (a.rider_price ?? 0) - (b.rider_price ?? 0))[0];

  if (!cheapest) return [];

  const machine =
    cheapest.kind === "motorbike"
      ? cheapest.bike_name
      : // A 4x4 expedition's cars are priced per day, so the machine line is
        // the vehicle fact rather than a single name.
        (tour.facts?.vehicle ?? null);

  const groups: PriceGroup[] = [
    {
      title: "Expedition price",
      lines: [
        { icon: "rider", label: "Rider", amount: cheapest.rider_price ?? 0 },
        ...(cheapest.pillion_price !== null
          ? [
              {
                icon: "pillion" as const,
                label: "Pillion",
                note: "Sharing the rider's machine",
                amount: cheapest.pillion_price,
              },
            ]
          : []),
      ],
    },
  ];

  const machineLines = [
    ...(machine
      ? [
          {
            icon: cheapest.kind === "motorbike" ? ("bike" as const) : ("rider" as const),
            label: machine,
            note: "Included in the rider price",
            amount: 0,
            addon: true,
          },
        ]
      : []),
    ...(cheapest.damage_protection_price !== null
      ? [
          {
            icon: "shield" as const,
            label: "Full damage protection",
            note: "Waives the deposit on the expedition machine",
            amount: cheapest.damage_protection_price,
            addon: true,
          },
        ]
      : []),
  ];

  if (machineLines.length) groups.push({ title: "Machine", lines: machineLines });

  if (cheapest.single_room_price !== null) {
    groups.push({
      title: "Rooms",
      lines: [
        {
          icon: "singleRoom",
          label: "Single room",
          note: "Your own room throughout",
          amount: cheapest.single_room_price,
          addon: true,
        },
      ],
    });
  }

  return groups;
}

/** Places still open on a departure, or null where the total is unpublished. */
const left = (departure: Departure) =>
  departure.seats === null ? null : Math.max(0, departure.seats - (departure.seats_taken ?? 0));

/** What the dates drawer and the booking wizard read. */
export const departureList = (departures: Departure[]) =>
  departures.map((departure) => ({
    start: departure.start_date,
    end: departure.end_date,
    // A departure with nothing left is sold out whether or not the switch has
    // been thrown, so the two are settled here rather than on the card.
    soldOut: departure.sold_out || left(departure) === 0,
    solo: departure.rider_price ?? 0,
    twin: departure.pillion_price ?? 0,
    seats: left(departure),
    edition: departure.edition ?? "",
    direction: departure.direction ?? "",
    leader: departure.leader ?? "",
  }));

export const highlightList = (tour: Tour) =>
  tour.highlights
    .filter((highlight) => highlight.path)
    .map((highlight) => ({
      label: highlight.label,
      image: imageUrl(highlight.path)!,
      alt: highlight.alt,
    }));

export const programmeList = (tour: Tour) =>
  tour.programme
    .filter((day) => day.path)
    .map((day) => ({
      day: day.day,
      title: day.title,
      stay: day.stay || undefined,
      body: day.body,
      image: imageUrl(day.path)!,
    }));

export const galleryList = (tour: Tour) =>
  tour.gallery.map((image) => ({ image: imageUrl(image.path)!, alt: image.alt }));

/**
 * The what-to-expect panels, each behind a different photograph.
 *
 * The pictures come from the tour's own gallery, spread evenly across it rather
 * than taken from the front: four tabs pulling the first four shots would show
 * four versions of the same afternoon, since a gallery is usually uploaded in
 * the order it was taken.
 *
 * Spread, not random. A fresh pick on every render would change under a reader
 * mid-page and would differ between the server and the browser; this gives the
 * same variety and stays put. The hero stands in when there is no gallery.
 */
export const expectList = (tour: Tour) => {
  const gallery = tour.gallery.map((image) => imageUrl(image.path)!).filter(Boolean);
  const hero = imageUrl(tour.hero_path) ?? "";

  const stride = gallery.length > tour.expect.length
    ? Math.floor(gallery.length / tour.expect.length)
    : 1;

  return tour.expect.map((panel, index) => ({
    ...panel,
    image: gallery.length ? gallery[(index * stride) % gallery.length] : hero,
  }));
};
