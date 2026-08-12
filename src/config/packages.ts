import type { StaticImageData } from "next/image";

import selfDrive from "../../public/expeditions/self-drive.jpg";
import ladakh from "../../public/tours/ladakh-motorcycle-tour.jpg";
import nepal from "../../public/tours/nepal-motorcycle-tour.jpg";

import type { TourKey } from "@/i18n/keys";

export type TourPackage = {
  key: TourKey;
  href: string;
  image: StaticImageData;
  rating: number;
  reviews: number;
  /**
   * Per person, in `baseCurrency` (USD). Converted at render time to whatever
   * suits the visitor's market. TODO: replace with real pricing.
   */
  priceFrom: number;
};

/**
 * Every package we sell. The home page shows the first two; the destination
 * pages pick out whichever belong to the region being read.
 *
 * TODO: ratings, review counts and prices are all placeholders.
 */
export const allPackages: TourPackage[] = [
  {
    key: "ladakhMotorcycle",
    href: "/tours/ladakh-motorcycle-tour",
    image: ladakh,
    rating: 5,
    reviews: 2800,
    priceFrom: 2150,
  },
  {
    key: "himalayas4x4",
    href: "/tours/indian-himalayas-4x4-adventure-expedition",
    image: selfDrive,
    rating: 4.9,
    reviews: 640,
    priceFrom: 2400,
  },
  {
    key: "nepalMotorcycle",
    href: "/tours/nepal-motorcycle-tour",
    image: nepal,
    rating: 4.9,
    reviews: 1400,
    priceFrom: 1850,
  },
];

/** The two departures featured on the home page. */
export const upcomingPackages = allPackages.filter((tour) => tour.key !== "himalayas4x4");
