import type { StaticImageData } from "next/image";

import india from "../../public/destinations/india.jpg";
import nepal from "../../public/destinations/nepal.jpg";

import type { DestinationKey, NavKey, TourKey } from "@/i18n/keys";

/**
 * Navigation tree. Keys are checked against the English catalogue at build
 * time, so a nav entry can never ship without its translation.
 */

export type Tour = {
  key: TourKey;
  href: string;
  days: number;
  image: StaticImageData;
};

export type Region = {
  key: DestinationKey;
  href: string;
  tours: Tour[];
};

export type Country = {
  key: DestinationKey;
  href: string;
  /** ISO 3166-1 alpha-2, for the flag icon. */
  flag: string;
  regions: Region[];
};

export type NavItem =
  | { key: NavKey; href: string }
  | { key: NavKey; href: string; countries: Country[] };

export const hasMegaMenu = (item: NavItem): item is Extract<NavItem, { countries: Country[] }> =>
  "countries" in item;

export const mainNav: NavItem[] = [
  { key: "home", href: "/" },
  {
    key: "destinations",
    href: "/destinations",
    countries: [
      {
        key: "india",
        href: "/destinations/india",
        flag: "in",
        regions: [
          {
            key: "indiaHimalayas",
            href: "/destinations/india/himalayas",
            tours: [
              {
                key: "ladakhMotorcycle",
                href: "/tours/ladakh-motorcycle-tour",
                days: 12,
                image: india,
              },
              {
                key: "himalayas4x4",
                href: "/tours/indian-himalayas-4x4-adventure-expedition",
                days: 14,
                image: india,
              },
            ],
          },
        ],
      },
      {
        key: "nepal",
        href: "/destinations/nepal",
        flag: "np",
        regions: [
          {
            key: "nepalHimalayas",
            href: "/destinations/nepal/himalayas",
            tours: [
              {
                key: "nepalMotorcycle",
                href: "/tours/nepal-motorcycle-tour",
                days: 10,
                image: nepal,
              },
            ],
          },
        ],
      },
    ],
  },
  { key: "adventureTours", href: "/adventure-tours" },
  { key: "about", href: "/about-us" },
  { key: "blog", href: "/blog" },
  { key: "contact", href: "/contact-us" },
];

/** Grouped under "More" in the mobile drawer; unchanged in the desktop bar. */
export const secondaryNavKeys: NavKey[] = ["blog", "contact"];

export const isSecondary = (item: NavItem) => secondaryNavKeys.includes(item.key);
