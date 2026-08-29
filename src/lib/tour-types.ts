import type { PriceIconName } from "@/components/ui/icons";
import type { ImageSource } from "@/lib/image-source";

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
  id?: string;
  start: string;
  end: string;
  soldOut?: boolean;
  seats?: number | null;
  kind?: "motorbike" | "4x4";
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
