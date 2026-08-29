import type messages from "../../messages/en.json";

type Catalogue = typeof messages;

type LeafKeys<T> = { [K in keyof T]: T[K] extends string ? K : never }[keyof T] & string;

export type NavKey = LeafKeys<Catalogue["nav"]>;
export type DestinationKey = LeafKeys<Catalogue["destinations"]>;

export type TourKey = keyof Catalogue["tours"] & string;
