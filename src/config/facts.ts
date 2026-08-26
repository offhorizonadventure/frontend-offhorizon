import { crewCount } from "./team";

/** Verifiable facts about the operation, in one place so pages cannot disagree. */
export const FOUNDED_YEAR = 2014;

/** Counted from the founding year, so it never goes stale. */
export const yearsRunning = new Date().getFullYear() - FOUNDED_YEAR;

/** India, Nepal, Tibet, Bhutan, Sri Lanka, Mongolia. */
export const COUNTRY_COUNT = 6;

/** Umling La, the highest pass on the Ladakh route. */
export const HIGHEST_PASS_METRES = 5798;

export { crewCount };
