import type { StaticImageData } from "next/image";

import hubHero from "../../public/destinations/pages/hub-hero.jpg";
import indiaAerial from "../../public/destinations/pages/india-aerial.jpg";
import ladakhRiver from "../../public/destinations/pages/ladakh-river-crossing.jpg";
import manaliToLeh from "../../public/destinations/pages/manali-to-leh.jpg";
import muktinathRoad from "../../public/destinations/pages/nepal-muktinath-road.jpg";
import mustang from "../../public/destinations/pages/nepal-mustang.jpg";
import southIndia from "../../public/destinations/pages/south-india.jpg";

import { destinations, type Destination } from "./destinations";
import { allPackages, type TourPackage } from "./packages";

export { hubHero };

type RegionBase = {
  slug: string;
  image: StaticImageData;
  imageAlt: string;
};

/** Live regions have their own page and a full namespace under `dest`. */
export type LiveRegion = RegionBase & {
  status: "live";
  content: "indianHimalayas" | "nepalHimalayas";
  hero: StaticImageData;
  ctaImage: StaticImageData;
  tours: { tour: TourPackage; image?: StaticImageData }[];
};

export type PlannedRegion = RegionBase & {
  status: "planned";
  content: "southIndia";
};

export type RegionPage = LiveRegion | PlannedRegion;

export type CountryPage = {
  slug: string;
  /** Matches the key used by the `destinations` message namespace. */
  destination: Destination;
  /** `live` countries have their own written page. */
  status: "live" | "planned";
  /** Namespace under `dest`. Only set on live countries. */
  content?: "india" | "nepal";
  hero: StaticImageData;
  heroAlt: string;
  ctaImage?: StaticImageData;
  regions: RegionPage[];
};

const byKey = (key: Destination["key"]) => {
  const match = destinations.find((destination) => destination.key === key);
  if (!match) throw new Error(`Unknown destination: ${key}`);
  return match;
};

const tour = (key: TourPackage["key"]) => {
  const match = allPackages.find((entry) => entry.key === key);
  if (!match) throw new Error(`Unknown tour: ${key}`);
  return match;
};

export const countryPages: CountryPage[] = [
  {
    slug: "india",
    destination: byKey("india"),
    status: "live",
    content: "india",
    hero: ladakhRiver,
    heroAlt:
      "Motorcyclist riding through a river crossing on an off-road Ladakh tour in the Himalayas",
    ctaImage: indiaAerial,
    regions: [
      {
        slug: "indian-himalayas",
        content: "indianHimalayas",
        status: "live",
        image: manaliToLeh,
        imageAlt: "The Manali to Leh road winding through the Ladakh mountains",
        hero: manaliToLeh,
        ctaImage: manaliToLeh,
        tours: [
          { tour: tour("ladakhMotorcycle"), image: ladakhRiver },
          { tour: tour("himalayas4x4") },
        ],
      },
      {
        slug: "south-india",
        content: "southIndia",
        status: "planned",
        image: southIndia,
        imageAlt: "The Amba Ghat pass road climbing through the Western Ghats in southern India",
      },
    ],
  },
  {
    slug: "nepal",
    destination: byKey("nepal"),
    status: "live",
    content: "nepal",
    hero: byKey("nepal").image,
    heroAlt: "The Ama Dablam massif in the Nepalese Himalayas",
    ctaImage: muktinathRoad,
    regions: [
      {
        slug: "nepal-himalayas",
        content: "nepalHimalayas",
        status: "live",
        image: mustang,
        imageAlt: "The Kali Gandaki valley cutting through the Mustang desert in Nepal",
        hero: mustang,
        ctaImage: muktinathRoad,
        tours: [{ tour: tour("nepalMotorcycle") }],
      },
    ],
  },
  {
    slug: "bhutan",
    destination: byKey("bhutan"),
    status: "planned",
    hero: byKey("bhutan").image,
    heroAlt: "Paro Taktsang monastery on the cliffs above the Paro valley in Bhutan",
    regions: [],
  },
  {
    slug: "sri-lanka",
    destination: byKey("sriLanka"),
    status: "planned",
    hero: byKey("sriLanka").image,
    heroAlt: "Sigiriya rock fortress rising above the Sri Lankan forest",
    regions: [],
  },
  {
    slug: "mongolia",
    destination: byKey("mongolia"),
    status: "planned",
    hero: byKey("mongolia").image,
    heroAlt: "Open desert landscape in the Gobi, Mongolia",
    regions: [],
  },
];

export const getCountry = (slug: string) => countryPages.find((page) => page.slug === slug);

export const getRegion = (countrySlug: string, regionSlug: string) => {
  const region = getCountry(countrySlug)?.regions.find((entry) => entry.slug === regionSlug);
  return region?.status === "live" ? region : undefined;
};

/** Every country and live region path, for static generation and the sitemap. */
export const destinationRoutes = [
  "/destinations",
  ...countryPages.map((page) => `/destinations/${page.slug}`),
  ...countryPages.flatMap((page) =>
    page.regions
      .filter((region) => region.status === "live")
      .map((region) => `/destinations/${page.slug}/${region.slug}`),
  ),
];
