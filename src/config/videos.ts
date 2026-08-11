import type { StaticImageData } from "next/image";

import himalayas from "../../public/expeditions/himalayas.jpg";
import ladakh from "../../public/tours/ladakh-motorcycle-tour.jpg";
import nepal from "../../public/tours/nepal-motorcycle-tour.jpg";

export type Film = {
  key: "himalayas" | "ladakh" | "loManthang";
  /** YouTube video id, the part after `v=` or `youtu.be/`. */
  youtubeId: string;
  /** Single source of truth: the badge and the ISO duration both derive from this. */
  seconds: number;
  poster: StaticImageData;
};

/**
 * Films are embedded through a facade (see `VideoPlayer`): the poster is a
 * local image and nothing is requested from Google until the visitor presses
 * play. That keeps the section free of third-party JavaScript and cookies on
 * first load, which matters for the European markets this site targets.
 */
export const films: Film[] = [
  { key: "himalayas", youtubeId: "p2EknuiON-8", seconds: 23, poster: himalayas },
  { key: "ladakh", youtubeId: "8_607eplWjU", seconds: 24, poster: ladakh },
  { key: "loManthang", youtubeId: "RnIaGC6cZic", seconds: 33, poster: nepal },
];

/** "0:23" for the badge. */
export const formatDuration = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/** "PT23S" for schema.org. */
export const isoDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `PT${minutes ? `${minutes}M` : ""}${rest ? `${rest}S` : ""}`;
};

/** YouTube's own thumbnail, used only inside structured data, never fetched by the page. */
export const thumbnailUrl = (youtubeId: string) =>
  `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`;
