import type { StaticImageData } from "next/image";

import bhutanCta from "../../public/destinations/pages/bhutan-punakha.webp";
import hubHero from "../../public/destinations/pages/hub-hero.jpg";
import indiaAerial from "../../public/destinations/pages/india-aerial.jpg";
import ladakhRiver from "../../public/destinations/pages/ladakh-river-crossing.jpg";
import manaliToLeh from "../../public/destinations/pages/manali-to-leh.jpg";
import mongoliaCta from "../../public/destinations/pages/mongolia-steppe.webp";
import muktinathRoad from "../../public/destinations/pages/nepal-muktinath-road.jpg";
import mustang from "../../public/destinations/pages/nepal-mustang.jpg";
import southIndia from "../../public/destinations/pages/south-india.jpg";
import sriLankaCta from "../../public/destinations/pages/sri-lanka-tea.webp";
import tibetCta from "../../public/destinations/pages/tibet-plateau.webp";

import bhutanRegion from "../../public/tours/menu/bhutan-motorcycle.webp";
import mongoliaRegion from "../../public/tours/menu/mongolia-motorcycle.webp";
import everestRegion from "../../public/tours/menu/everest-base-camp.webp";
import sriLankaRegion from "../../public/tours/menu/sri-lanka-motorcycle.webp";

import { destinations, type Destination } from "./destinations";

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
};

export type PlannedRegion = RegionBase & {
  status: "planned";
  content: "southIndia" | "easternHimalayas" | "hillCountry" | "steppeGobi" | "tibetPlateau";
};

export type RegionPage = LiveRegion | PlannedRegion;

export type CountryPage = {
  slug: string;
  /** Matches the key used by the `destinations` message namespace. */
  destination: Destination;
  /** `live` countries have their own written page. */
  status: "live" | "planned";
  /** Namespace under `dest`. Only set on live countries. */
  content?: "india" | "nepal" | "bhutan" | "sriLanka" | "mongolia" | "tibet";
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
      },
    ],
  },
  {
    slug: "bhutan",
    destination: byKey("bhutan"),
    status: "live",
    content: "bhutan",
    hero: byKey("bhutan").image,
    heroAlt: "Paro Taktsang monastery on the cliffs above the Paro valley in Bhutan",
    ctaImage: bhutanCta,
    regions: [
      {
        slug: "eastern-himalayas",
        content: "easternHimalayas",
        status: "planned",
        image: bhutanRegion,
        imageAlt: "The road climbing towards Paro Taktsang in the Bhutanese Himalayas",
      },
    ],
  },
  {
    slug: "tibet",
    destination: byKey("tibet"),
    status: "live",
    content: "tibet",
    hero: byKey("tibet").image,
    heroAlt: "Rongbuk monastery below the north face of Everest, on the Tibetan plateau",
    ctaImage: tibetCta,
    regions: [
      {
        slug: "tibet-plateau",
        content: "tibetPlateau",
        status: "planned",
        image: everestRegion,
        imageAlt: "The north face of Everest seen from the Tibetan plateau",
      },
    ],
  },
  {
    slug: "sri-lanka",
    destination: byKey("sriLanka"),
    status: "live",
    content: "sriLanka",
    hero: byKey("sriLanka").image,
    heroAlt: "Sigiriya rock fortress rising above the Sri Lankan forest",
    ctaImage: sriLankaCta,
    regions: [
      {
        slug: "hill-country",
        content: "hillCountry",
        status: "planned",
        image: sriLankaRegion,
        imageAlt: "Sigiriya rock fortress seen from the surrounding forest in Sri Lanka",
      },
    ],
  },
  {
    slug: "mongolia",
    destination: byKey("mongolia"),
    status: "live",
    content: "mongolia",
    hero: byKey("mongolia").image,
    heroAlt: "Open desert landscape in the Gobi, Mongolia",
    ctaImage: mongoliaCta,
    regions: [
      {
        slug: "steppe-gobi",
        content: "steppeGobi",
        status: "planned",
        image: mongoliaRegion,
        imageAlt: "Gers and open grassland on the Mongolian steppe",
      },
    ],
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
