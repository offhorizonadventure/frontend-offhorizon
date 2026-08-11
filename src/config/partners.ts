/**
 * Logos are pre-normalized into a shared 600x200 box (see public/partners).
 * Each one is scaled by area rather than height, so a wide wordmark and a
 * square badge carry the same visual weight, and every slot is identical.
 *
 * `mono` is a brand-brown silhouette shown at rest; `color` is the original
 * artwork revealed on hover.
 */
export type Partner = {
  slug: string;
  name: string;
};

export const partners: Partner[] = [
  { slug: "royal-enfield", name: "Royal Enfield" },
  { slug: "himachal-tourism", name: "Himachal Tourism" },
  { slug: "brb", name: "BRB" },
  { slug: "reise-moto", name: "Reise Moto" },
];

/** How many times the strip repeats to fill wide screens and loop seamlessly. */
export const PARTNER_REPEATS = 4;
