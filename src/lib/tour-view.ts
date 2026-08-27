import "server-only";

import type { Departure, Tour } from "@/lib/catalogue";
import { imageUrl } from "@/lib/catalogue";
import type { FactKey, PriceGroup } from "@/lib/tour-types";

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

/** Two facts are stored as bare numbers and read badly on their own. */
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

/** The price card, built from the cheapest departure. */
export function pricing(tour: Tour, departures: Departure[]): PriceGroup[] {
  const cheapest = [...departures]
    .filter((departure) => departure.rider_price !== null)
    .sort((a, b) => (a.rider_price ?? 0) - (b.rider_price ?? 0))[0];

  if (!cheapest) return [];

  const machine =
    cheapest.kind === "motorbike"
      ? // Machines picked from the fleet win over the typed name: the office
        // chose them more recently, and a stale line of text would outrank them.
        cheapest.vehicles.map((vehicle) => vehicle.name).join(", ") || cheapest.bike_name || null
      : // A 4x4 expedition's cars are priced per day, so the machine line is
        // the vehicle fact rather than a single name.
        (tour.facts?.vehicle ?? null);

  const groups: PriceGroup[] = [
    {
      title: "Expedition price",
      lines: [
        {
          icon: "rider",
          label: cheapest.kind === "4x4" ? "Person" : "Rider",
          amount: cheapest.rider_price ?? 0,
        },
        // A zero is not "included": it means the tour does not offer the option at all.
        ...(cheapest.pillion_price
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
    ...(cheapest.damage_protection_price
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

  if (cheapest.single_room_price) {
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
    id: departure.id,
    start: departure.start_date,
    end: departure.end_date,
    // Sold to this reader alone, so the drawer can say so.
    custom: departure.visibility === "private",
    // No seats left is sold out whether or not the switch was thrown.
    soldOut: departure.sold_out || left(departure) === 0,
    solo: departure.rider_price ?? 0,
    twin: departure.pillion_price ?? 0,
    seats: left(departure),
    kind: departure.kind,
    // Only cars with a rate: one without cannot be totalled.
    vehicles: departure.vehicles
      .filter((vehicle) => vehicle.per_day_price)
      .map((vehicle) => ({
        id: vehicle.id,
        name: vehicle.name,
        seats: vehicle.seats ?? 4,
        perDay: vehicle.per_day_price as number,
      })),
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

/** The what-to-expect panels, each behind a different photograph. */
export const expectList = (tour: Tour) => {
  const gallery = tour.gallery.map((image) => imageUrl(image.path)!).filter(Boolean);
  const hero = imageUrl(tour.hero_path) ?? "";

  // Fisher-Yates over a copy: the `sort(() => Math.random() - 0.5)` shortcut is not even.
  const shuffled = [...gallery];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }

  return tour.expect.map((panel, index) => ({
    ...panel,
    image: shuffled.length ? shuffled[index % shuffled.length] : hero,
  }));
};
