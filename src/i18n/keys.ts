import type messages from "../../messages/en.json";

type Catalogue = typeof messages;

/** Keys whose value is a string - i.e. usable directly with `t(...)`. */
type LeafKeys<T> = { [K in keyof T]: T[K] extends string ? K : never }[keyof T] & string;

/**
 * Message-key unions derived from the English catalogue. Typing the navigation
 * config with these means a nav entry without a translation fails the build
 * instead of rendering a raw key at runtime.
 */
export type NavKey = LeafKeys<Catalogue["nav"]>;
export type DestinationKey = LeafKeys<Catalogue["destinations"]>;

/** Tour entries are objects (`name` + `summary`), so these are group keys. */
export type TourKey = keyof Catalogue["tours"] & string;
