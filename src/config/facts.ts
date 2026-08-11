import { crewCount } from "./team";

/**
 * Verifiable facts about the operation, in one place so the homepage and the
 * About page cannot drift apart.
 *
 * Everything here is derivable from something the business has stated: the
 * founding year, the countries the site sells, the size of the crew listed on
 * the About page, and the altitude on the Umling La sign in our own
 * photograph. Nothing is estimated.
 */
export const FOUNDED_YEAR = 2014;

/** Counted from the founding year, so it never goes stale. */
export const yearsRunning = new Date().getFullYear() - FOUNDED_YEAR;

/** India, Nepal, Bhutan, Sri Lanka, Mongolia. */
export const COUNTRY_COUNT = 5;

/** Umling La, the highest pass on the Ladakh route. */
export const HIGHEST_PASS_METRES = 5798;

export { crewCount };
