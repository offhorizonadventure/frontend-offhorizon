import type { DestinationKey, NavKey } from "@/i18n/keys";

export type Region = {
  key: DestinationKey;
  href: string;
};

export type Country = {
  key: DestinationKey;
  href: string;
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

export const secondaryNavKeys: NavKey[] = ["blog", "contact"];

export const isSecondary = (item: NavItem) => secondaryNavKeys.includes(item.key);
