import type { StaticImageData } from "next/image";

import himalayas from "../../public/expeditions/himalayas.jpg";
import ladakh from "../../public/tours/ladakh-motorcycle-tour.jpg";
import nepal from "../../public/tours/nepal-motorcycle-tour.jpg";

export type Film = {
  key: "himalayas" | "ladakh" | "loManthang";
  youtubeId: string;
  seconds: number;
  poster: StaticImageData;
};

export const films: Film[] = [
  { key: "himalayas", youtubeId: "p2EknuiON-8", seconds: 23, poster: himalayas },
  { key: "ladakh", youtubeId: "8_607eplWjU", seconds: 24, poster: ladakh },
  { key: "loManthang", youtubeId: "RnIaGC6cZic", seconds: 33, poster: nepal },
];

export const formatDuration = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export const isoDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `PT${minutes ? `${minutes}M` : ""}${rest ? `${rest}S` : ""}`;
};

export const thumbnailUrl = (youtubeId: string) =>
  `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`;
