import "server-only";

import type { Departure, Tour } from "@/lib/catalogue";
import { imageUrl } from "@/lib/catalogue";
import type { FactKey, PriceGroup } from "@/lib/tour-types";

const FACT_KEYS: Record<string, FactKey> = {
  location: "location",
  weather: "weather",
  seasons: "seasons",
  terrain: "terrain",
  distance: "distance",
  duration: "duration",
  difficulty: "difficulty",
  group_size: "groupSize",
};

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

export function machineFor(departures: Departure[]): string | null {
  const names = [
    ...new Set(
      departures.flatMap((departure) => departure.vehicles.map((vehicle) => vehicle.name)),
    ),
  ];

  if (names.length) return names.join(", ");

  const typed = [
    ...new Set(departures.map((departure) => departure.bike_name?.trim()).filter(Boolean)),
  ];

  return typed.join(", ") || null;
}

export const factList = (tour: Tour) => {
  return Object.entries(FACT_KEYS)
    .map(([column, key]) => ({
      key,
      value: (tour.facts?.[column] ?? "").trim(),
    }))
    .filter((fact) => fact.value)
    .map((fact) => ({ ...fact, value: present(fact.key, fact.value) }));
};

/**
 * The price card on the tour page.
 *
 * Every figure here is the tour's own list price, undiscounted, because that
 * is what this tour charges whenever it runs. A departure's discount belongs
 * to that departure and is shown in the dates drawer, next to the date it
 * applies to, with the list price struck through beside it.
 *
 * The headline used to be the cheapest departure's rider price. One discounted
 * date then rewrote the advertised price of the tour, and a visitor reading
 * the card was quoted a number that most of the dates in the drawer did not
 * charge. The two disagreed on the same screen.
 *
 * The fallbacks read the representative departure's resolved list prices,
 * which are the tour's prices already, or the departure's own legacy columns
 * where a database has not run `patch-tour-prices.sql` yet. Never the
 * discounted figure.
 */
export function pricing(tour: Tour, departures: Departure[]): PriceGroup[] {
  // Only for the shape of the expedition (which machine, whether it is a 4x4).
  // None of the money below comes from here.
  const representative = departures[0] ?? null;
  const fallback = representative?.prices ?? null;

  const rider = tour.rider_price ?? fallback?.listRider ?? 0;
  const pillion = tour.pillion_price ?? fallback?.listPillion ?? null;
  const protection = tour.damage_protection_price ?? fallback?.protection ?? null;
  const room = tour.single_room_price ?? fallback?.room ?? null;

  if (!rider && !pillion) return [];

  const kind = representative?.kind ?? "motorbike";
  const machine = representative ? machineFor([representative]) : null;

  const groups: PriceGroup[] = [
    {
      title: "Expedition price",
      lines: [
        {
          icon: "rider",
          label: kind === "4x4" ? "Person" : "Rider",
          amount: rider,
        },
        ...(pillion
          ? [
              {
                icon: "pillion" as const,
                label: "Pillion",
                note: "Sharing the rider's machine",
                amount: pillion,
              },
            ]
          : []),
      ],
    },
  ];

  const cars = (representative?.vehicles ?? []).filter((vehicle) => vehicle.per_day_price);

  const machineLines = [
    ...(cars.length
      ? cars.map((vehicle) => ({
          icon: "car" as const,
          label: vehicle.name,
          note: "Per day, shared between the people in it",
          amount: vehicle.per_day_price as number,
          addon: true,
        }))
      : machine
        ? [
            {
              icon: kind === "motorbike" ? ("bike" as const) : ("rider" as const),
              label: machine,
              note: "Included in the rider price",
              amount: 0,
              addon: true,
            },
          ]
        : []),
    ...(protection
      ? [
          {
            icon: "shield" as const,
            label: "Full damage protection",
            note: "Waives the deposit on the expedition machine",
            amount: protection,
            addon: true,
          },
        ]
      : []),
  ];

  if (machineLines.length) groups.push({ title: "Machine", lines: machineLines });

  if (room) {
    groups.push({
      title: "Rooms",
      lines: [
        {
          icon: "singleRoom",
          label: "Single room",
          note: "Your own room throughout",
          amount: room,
          addon: true,
        },
      ],
    });
  }

  return groups;
}

const left = (departure: Departure) =>
  departure.seats === null ? null : Math.max(0, departure.seats - (departure.seats_taken ?? 0));

export const departureList = (departures: Departure[]) =>
  departures.map((departure) => ({
    id: departure.id,
    start: departure.start_date,
    end: departure.end_date,
    custom: departure.visibility === "private",
    soldOut: departure.sold_out || left(departure) === 0,
    solo: departure.prices.rider ?? 0,
    twin: departure.prices.pillion ?? 0,
    // Carried per departure rather than taken from the cheapest one, and
    // already resolved: the tour's list price less whatever this date takes
    // off it. `list` is what it was before the discount, for the wizard to
    // strike through.
    prices: {
      rider: departure.prices.rider ?? 0,
      pillion: departure.prices.pillion ?? 0,
      insurance: departure.prices.protection ?? 0,
      room: departure.prices.room ?? 0,
    },
    list: {
      rider: departure.prices.listRider ?? 0,
      pillion: departure.prices.listPillion ?? 0,
    },
    seats: left(departure),
    kind: departure.kind,
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

export const expectList = (tour: Tour) => {
  const gallery = tour.gallery.map((image) => imageUrl(image.path)!).filter(Boolean);
  const hero = imageUrl(tour.hero_path) ?? "";

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
