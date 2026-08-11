import type { StaticImageData } from "next/image";

import himalayas from "../../public/expeditions/himalayas.jpg";
import ladakh from "../../public/tours/ladakh-motorcycle-tour.jpg";
import nepal from "../../public/tours/nepal-motorcycle-tour.jpg";

export type Film = {
  key: "himalayas" | "ladakh" | "loManthang";
  /**
   * YouTube video id, the part after `v=`.
   *
   * TODO: fill these in. Until then the card renders its poster and the play
   * button is disabled, rather than opening a broken player.
   */
  youtubeId: string;
  /** Shown as a badge. Format is mm:ss. */
  duration: string;
  poster: StaticImageData;
};

/**
 * Films are embedded through a facade (see `VideoPlayer`): the poster is a
 * local image and nothing is requested from Google until the visitor presses
 * play. That keeps the section free of third-party JavaScript and cookies on
 * first load, which matters for the European markets this site targets.
 */
export const films: Film[] = [
  { key: "himalayas", youtubeId: "", duration: "3:12", poster: himalayas },
  { key: "ladakh", youtubeId: "", duration: "4:05", poster: ladakh },
  { key: "loManthang", youtubeId: "", duration: "5:28", poster: nepal },
];
