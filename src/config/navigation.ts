import type { StaticImageData } from "next/image";

import bhutanMotorcycle from "../../public/tours/menu/bhutan-motorcycle.webp";
import greatTraverse from "../../public/tours/menu/great-himalayan-traverse.webp";
import himalayanExpedition from "../../public/tours/menu/himalayan-expedition.webp";
import himalayas4x4 from "../../public/tours/menu/indian-himalayas-4x4.webp";
import ladakhCircuit from "../../public/tours/menu/ladakh-circuit.webp";
import lowerMustang from "../../public/tours/menu/lower-mustang.webp";
import mongolia4x4 from "../../public/tours/menu/mongolia-4x4.webp";
import mongoliaMotorcycle from "../../public/tours/menu/mongolia-motorcycle.webp";
import nepal4x4 from "../../public/tours/menu/nepal-4x4.webp";
import sriLankaMotorcycle from "../../public/tours/menu/sri-lanka-motorcycle.webp";
import upperMustang from "../../public/tours/menu/upper-mustang.webp";

import type { DestinationKey, NavKey, TourKey } from "@/i18n/keys";

/**
 * The navigation tree.
 *
 * Written here rather than read from the database on purpose: the menu is on
 * every page, and a query per page is a query the free tier pays for. These
 * eleven change about once a year. The cards on the destination and tour pages
 * are the dynamic part.
 */

export type Tour = {
  key: TourKey;
  href: string;
  days: number;
  /**
   * Durations marked provisional are our own estimate of what the route takes
   * run properly, not a confirmed itinerary. They are flagged so they can be
   * corrected without reading every line.
   */
  provisional?: boolean;
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
  { key: NavKey; href: string } | { key: NavKey; href: string; countries: Country[] };

export const hasMegaMenu = (item: NavItem): item is Extract<NavItem, { countries: Country[] }> =>
  "countries" in item;

const countries: Country[] = [
  {
    key: "india",
    href: "/destinations/india",
    flag: "in",
    regions: [
      {
        key: "indiaHimalayas",
        href: "/destinations/india/indian-himalayas",
        tours: [
          {
            key: "greatHimalayanTraverse",
            href: "/adventure/great-himalayan-traverse",
            days: 23,
            image: greatTraverse,
          },
          {
            key: "himalayanExpedition",
            href: "/adventure/himalayan-expedition",
            days: 11,
            image: himalayanExpedition,
          },
          {
            key: "ladakhCircuit",
            href: "/adventure/ladakh-circuit",
            days: 8,
            image: ladakhCircuit,
          },
          {
            key: "himalayas4x4",
            href: "/adventure/indian-himalayas-4x4-expedition",
            days: 14,
            image: himalayas4x4,
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
        href: "/destinations/nepal/nepal-himalayas",
        tours: [
          {
            key: "upperMustang",
            href: "/adventure/upper-mustang-motorcycle-tour",
            days: 12,
            provisional: true,
            image: upperMustang,
          },
          {
            key: "lowerMustang",
            href: "/adventure/lower-mustang-motorcycle-tour",
            days: 8,
            provisional: true,
            image: lowerMustang,
          },
          {
            key: "nepal4x4",
            href: "/adventure/nepal-4x4-expedition",
            days: 11,
            provisional: true,
            image: nepal4x4,
          },
        ],
      },
    ],
  },
  {
    key: "bhutan",
    href: "/destinations/bhutan",
    flag: "bt",
    regions: [
      {
        key: "easternHimalayas",
        href: "/destinations/bhutan",
        tours: [
          {
            key: "bhutanMotorcycle",
            href: "/adventure/bhutan-motorcycle-tour",
            days: 9,
            provisional: true,
            image: bhutanMotorcycle,
          },
        ],
      },
    ],
  },
  {
    key: "sriLanka",
    href: "/destinations/sri-lanka",
    flag: "lk",
    regions: [
      {
        key: "hillCountry",
        href: "/destinations/sri-lanka",
        tours: [
          {
            key: "sriLankaMotorcycle",
            href: "/adventure/sri-lanka-motorcycle-tour",
            days: 10,
            provisional: true,
            image: sriLankaMotorcycle,
          },
        ],
      },
    ],
  },
  {
    key: "mongolia",
    href: "/destinations/mongolia",
    flag: "mn",
    regions: [
      {
        key: "steppeGobi",
        href: "/destinations/mongolia",
        tours: [
          {
            key: "mongoliaMotorcycle",
            href: "/adventure/mongolia-motorcycle-tour",
            days: 12,
            provisional: true,
            image: mongoliaMotorcycle,
          },
          {
            key: "mongolia4x4",
            href: "/adventure/mongolia-4x4-expedition",
            days: 14,
            provisional: true,
            image: mongolia4x4,
          },
        ],
      },
    ],
  },
];

export const mainNav: NavItem[] = [
  { key: "home", href: "/" },
  { key: "destinations", href: "/destinations", countries },
  { key: "adventureTours", href: "/adventure-tours" },
  { key: "about", href: "/about-us" },
  { key: "blog", href: "/blog" },
  { key: "contact", href: "/contact-us" },
];

/** Grouped under "More" in the mobile drawer; unchanged in the desktop bar. */
export const secondaryNavKeys: NavKey[] = ["blog", "contact"];

export const isSecondary = (item: NavItem) => secondaryNavKeys.includes(item.key);
