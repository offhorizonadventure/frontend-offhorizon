/** Logos are pre-normalized into a shared 600x200 box (see public/partners). */
export type Partner = {
  slug: string;
  name: string;
};

export const partners: Partner[] = [
  { slug: "royal-enfield", name: "Royal Enfield" },
  { slug: "himachal-tourism", name: "Himachal Tourism" },
  { slug: "brb", name: "BRB" },
  { slug: "reise-moto", name: "Reise Moto" },
  { slug: "mca-india", name: "Ministry of Corporate Affairs, Government of India" },
];

/** How many times the strip repeats so the loop is seamless on wide screens. */
export const PARTNER_REPEATS = 4;
