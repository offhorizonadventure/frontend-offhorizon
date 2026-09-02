import type { PriceIconName } from "@/components/ui/icons";
import type { ImageSource } from "@/lib/image-source";

export type FactKey =
  | "location"
  | "weather"
  | "seasons"
  | "terrain"
  | "distance"
  | "duration"
  | "difficulty"
  | "groupSize";

/** What one dated running of a tour charges. Zero means "not offered". */
export type DeparturePrices = {
  rider: number;
  pillion: number;
  insurance: number;
  room: number;
};

export type Departure = {
  id?: string;
  start: string;
  end: string;
  soldOut?: boolean;
  seats?: number | null;
  kind?: "motorbike" | "4x4";
  /** What this date charges: the tour's list price less its own discount. */
  prices?: DeparturePrices;
  /** The list price before that discount, so it can be struck through. */
  list?: { rider: number; pillion: number };
  vehicles?: { id: string; name: string; seats: number; perDay: number }[];
};

export type PriceLine = {
  icon: PriceIconName;
  label: string;
  note?: string;
  amount: number;
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
