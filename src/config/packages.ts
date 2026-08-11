import type { StaticImageData } from "next/image";

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

export const upcomingPackages: TourPackage[] = [
  {
    key: "ladakhMotorcycle",
    href: "/tours/ladakh-motorcycle-tour",
    image: ladakh,
    rating: 5,
    reviews: 2800,
    priceFrom: 2150,
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
