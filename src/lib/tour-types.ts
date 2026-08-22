import type { PriceIconName } from "@/components/ui/icons";
import type { ImageSource } from "@/lib/image-source";

/** The eight expedition facts, in the order the page shows them. */
export type FactKey =
  | "location"
  | "weather"
  | "vehicle"
  | "terrain"
  | "distance"
  | "duration"
  | "difficulty"
  | "groupSize";

export type Departure = {
  /** Carried to the checkout, which prices it again from the row itself. */
  id?: string;
  /** ISO dates. Rendered with the visitor's locale. */
  start: string;
  end: string;
  soldOut?: boolean;
  /** Places left. Null where the number is not published. */
  seats?: number | null;
  kind?: "motorbike" | "4x4";
  /** Cars on offer, on a 4x4 departure. */
  vehicles?: { id: string; name: string; seats: number; perDay: number }[];
};

/** One line in the price card. */
export type PriceLine = {
  icon: PriceIconName;
  label: string;
  note?: string;
  /** Zero renders as included. */
  amount: number;
  /** Renders as a supplement rather than a total. */
  addon?: boolean;
};

export type PriceGroup = { title: string; lines: PriceLine[] };

export type Highlight = { label: string; image: ImageSource; alt: string };

export type ProgramDay = {
  day: number;
  title: string;
  stay?: string;
  body: string;
  image: ImageSource;
};

export type ExpectPanel = {
  key: string;
  tab: string;
  title: string;
  body: string;
  image: ImageSource;
};
