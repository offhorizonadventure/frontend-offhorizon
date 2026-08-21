import type { StaticImageData } from "next/image";

import selfDrive from "../../public/expeditions/self-drive.jpg";
import ladakh from "../../public/tours/ladakh-motorcycle-tour.jpg";
import nepal from "../../public/tours/nepal-motorcycle-tour.jpg";

import type { TourKey } from "@/i18n/keys";

/** A tour as the navigation menu knows it. */
export type TourPackage = {
  key: TourKey;
  href: string;
  image: StaticImageData;
};

/** Every package we sell. */
export const allPackages: TourPackage[] = [
  {
    key: "ladakhMotorcycle",
    href: "/adventure/ladakh-motorcycle-tour",
    image: ladakh,
  },
  {
    key: "himalayas4x4",
    href: "/adventure/indian-himalayas-4x4-adventure-expedition",
    image: selfDrive,
  },
  {
    key: "nepalMotorcycle",
    href: "/adventure/nepal-motorcycle-tour",
    image: nepal,
  },
];

/** The two departures featured on the home page. */
export const upcomingPackages = allPackages.filter((tour) => tour.key !== "himalayas4x4");
