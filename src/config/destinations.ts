import type { StaticImageData } from "next/image";

import bhutan from "../../public/destinations/bhutan.jpg";
import india from "../../public/destinations/india.jpg";
import mongolia from "../../public/destinations/mongolia.jpg";
import nepal from "../../public/destinations/nepal.jpg";
import sriLanka from "../../public/destinations/sri-lanka.jpg";

import type { DestinationKey } from "@/i18n/keys";

export type Destination = {
  key: DestinationKey;
  href: string;
  flag: string;
  image: StaticImageData;
  /** Number of expeditions currently offered - shown on the card. */
  tours: number;
};

/** Images are imported rather than referenced by path so the bundler content-hashes them - swapping a photo busts the cache automatically, and Next de... */
export const destinations: Destination[] = [
  { key: "india", href: "/destinations/india", flag: "in", image: india, tours: 9 },
  { key: "nepal", href: "/destinations/nepal", flag: "np", image: nepal, tours: 4 },
  { key: "sriLanka", href: "/destinations/sri-lanka", flag: "lk", image: sriLanka, tours: 2 },
  { key: "bhutan", href: "/destinations/bhutan", flag: "bt", image: bhutan, tours: 3 },
  { key: "mongolia", href: "/destinations/mongolia", flag: "mn", image: mongolia, tours: 3 },
];
