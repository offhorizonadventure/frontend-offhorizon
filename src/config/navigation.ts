import type { StaticImageData } from "next/image";

import bhutanMotorcycle from "../../public/tours/menu/bhutan-motorcycle.webp";
import everestBaseCamp from "../../public/tours/menu/everest-base-camp.webp";
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

/** The menu. Static on purpose: it is on every page, and it rarely changes. */

export type Tour = {
  key: TourKey;
  href: string;
  days: number;
  /** Our estimate rather than a confirmed itinerary. */
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
            href: "/india/great-himalayan-traverse",
            days: 23,
            image: greatTraverse,
          },
          {
            key: "himalayanExpedition",
            href: "/india/himalayan-expedition",
            days: 11,
            image: himalayanExpedition,
          },
          {
            key: "ladakhCircuit",
            href: "/india/ladakh-circuit",
            days: 8,
            image: ladakhCircuit,
          },
          {
            key: "himalayas4x4",
            href: "/india/indian-himalayas-4x4-expedition",
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
            href: "/nepal/upper-mustang-motorcycle-tour",
            days: 12,
            provisional: true,
            image: upperMustang,
          },
          {
            key: "lowerMustang",
            href: "/nepal/lower-mustang-motorcycle-tour",
            days: 8,
            provisional: true,
            image: lowerMustang,
          },
          {
            key: "nepal4x4",
            href: "/nepal/nepal-4x4-expedition",
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
            href: "/bhutan/bhutan-motorcycle-tour",
            days: 9,
            provisional: true,
            image: bhutanMotorcycle,
          },
        ],
      },
    ],
  },
  {
    key: "tibet",
    href: "/destinations/tibet",
    flag: "cn",
    regions: [
      {
        key: "tibetPlateau",
        href: "/destinations/tibet",
        tours: [
          {
            key: "everestBaseCamp",
            href: "/tibet/everest-base-camp-motorcycle-expedition",
            days: 11,
            image: everestBaseCamp,
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
            href: "/sri-lanka/sri-lanka-motorcycle-tour",
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
            href: "/mongolia/mongolia-motorcycle-tour",
            days: 12,
            provisional: true,
            image: mongoliaMotorcycle,
          },
          {
            key: "mongolia4x4",
            href: "/mongolia/mongolia-4x4-expedition",
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
  { key: "adventureTours", href: "/calendar" },
  { key: "about", href: "/about-us" },
  { key: "blog", href: "/blog" },
  { key: "contact", href: "/contact-us" },
];

/** Grouped under "More" in the mobile drawer; unchanged in the desktop bar. */
export const secondaryNavKeys: NavKey[] = ["blog", "contact"];

export const isSecondary = (item: NavItem) => secondaryNavKeys.includes(item.key);
