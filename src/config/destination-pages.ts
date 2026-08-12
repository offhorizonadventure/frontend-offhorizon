import type { StaticImageData } from "next/image";

import hubHero from "../../public/destinations/pages/hub-hero.jpg";
import indiaAerial from "../../public/destinations/pages/india-aerial.jpg";
import ladakhRiver from "../../public/destinations/pages/ladakh-river-crossing.jpg";
import manaliToLeh from "../../public/destinations/pages/manali-to-leh.jpg";
import selfDrive from "../../public/expeditions/self-drive.jpg";

import { destinations, type Destination } from "./destinations";
import type { TourKey } from "@/i18n/keys";

export { hubHero };

export type RegionPage = {
  slug: string;
  /** Namespace under `dest` in the message catalogue. */
  content: "indianHimalayas";
  hero: StaticImageData;
  heroAlt: string;
  ctaImage: StaticImageData;
  tours: { key: TourKey; href: string; image: StaticImageData; alt: string }[];
};

export type CountryPage = {
  slug: string;
  /** Matches the key used by the `destinations` message namespace. */
  destination: Destination;
  /**
   * `live` countries have their own written page. `planned` ones are on the
   * roadmap and get a short honest page instead of a 404, because the home
   * page gallery already links to all five.
   */
  status: "live" | "planned";
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
    hero: ladakhRiver,
    heroAlt:
      "Motorcyclist riding through a river crossing on an off-road Ladakh tour in the Himalayas",
    ctaImage: indiaAerial,
    regions: [
      {
        slug: "indian-himalayas",
        content: "indianHimalayas",
        hero: manaliToLeh,
        heroAlt: "The Manali to Leh road winding through the Ladakh mountains",
        ctaImage: manaliToLeh,
        tours: [
          {
            key: "ladakhMotorcycle",
            href: "/tours/ladakh-motorcycle-tour",
            image: ladakhRiver,
            alt: "Rider crossing a Himalayan river on the Ladakh motorcycle tour",
          },
          {
            key: "himalayas4x4",
            href: "/tours/indian-himalayas-4x4-adventure-expedition",
            image: selfDrive,
            alt: "Self-drive 4x4 crossing high mountain terrain in the Indian Himalayas",
          },
        ],
      },
    ],
  },
  {
    slug: "nepal",
    destination: byKey("nepal"),
    status: "planned",
    hero: byKey("nepal").image,
    heroAlt: "The Ama Dablam massif in the Nepalese Himalayas",
    regions: [],
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

export const getRegion = (countrySlug: string, regionSlug: string) =>
  getCountry(countrySlug)?.regions.find((region) => region.slug === regionSlug);

/** Every country and region path, for static generation and the sitemap. */
export const destinationRoutes = [
  "/destinations",
  ...countryPages.map((page) => `/destinations/${page.slug}`),
  ...countryPages.flatMap((page) =>
    page.regions.map((region) => `/destinations/${page.slug}/${region.slug}`),
  ),
];
