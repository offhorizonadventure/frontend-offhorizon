import { BALANCE_DUE_DAYS } from "./types";

/**
 * When the balance falls due, and whether a late booking may hold a place with
 * a deposit at all.
 *
 * The house rule is that everything is paid a fortnight before the expedition
 * leaves, and inside that fortnight only a booking paid in full is taken. That
 * suits a rider flying in from Europe, who needs a visa, a flight and time.
 *
 * It does not suit India, where most riders live a day's drive from the start
 * and decide the week before. Turning them away because the calendar said
 * thirteen days was refusing money for no reason, so an Indian expedition takes
 * a deposit right up to the day it leaves.
 *
 * Nothing here changes for any other country. The one branch that behaves
 * differently is reached only when the usual deadline has already passed AND
 * the tour is one that allows a late deposit, and everywhere else the answer is
 * the same date the old code produced.
 *
 * Pure and client safe: no server-only, no Supabase.
 */

/** Countries whose expeditions take a deposit however close the date is. */
const LATE_DEPOSIT_COUNTRIES = new Set(["india"]);

export const allowsLateDeposit = (country: string | null | undefined) =>
  LATE_DEPOSIT_COUNTRIES.has((country ?? "").trim().toLowerCase());

const iso = (at: Date) => at.toISOString().slice(0, 10);
const midnight = (date: string) => new Date(`${date}T00:00:00Z`);

/** Today, as the database writes a date: no time, no zone. */
export const todayIso = () => new Date().toISOString().slice(0, 10);

/**
 * The day the balance falls due for a booking made now.
 *
 * A fortnight before the expedition leaves, exactly as before, unless that day
 * has already gone on a tour that allows a late deposit. Then it is the day the
 * expedition leaves: a rider who books three days out cannot be held to a
 * deadline eleven days in the past, and writing one would have the overnight
 * job cancel their booking before breakfast.
 */
export function balanceDueOn(
  startDate: string,
  country?: string | null,
  today = todayIso(),
): string {
  const usual = midnight(startDate);
  usual.setUTCDate(usual.getUTCDate() - BALANCE_DUE_DAYS);

  // Not strictly after: a booking made on the deadline itself keeps it, which
  // is what the old code did and what the checkout still refuses a deposit on.
  if (usual.getTime() >= midnight(today).getTime()) return iso(usual);

  // Past the usual deadline. Only a late-deposit tour gets a different answer;
  // everywhere else this is the date that has always been written, and the
  // booking is paid in full anyway so nothing is left to fall due.
  if (!allowsLateDeposit(country)) return iso(usual);

  const start = midnight(startDate);

  return iso(start.getTime() > midnight(today).getTime() ? start : midnight(today));
}

/**
 * Whether missing this deadline hands the booking to the overnight job.
 *
 * Only when the deadline falls before the expedition leaves. A balance due on
 * the day of departure is a thing to settle before riding, not a countdown to a
 * cancellation: the earliest it could be enforced is the morning after the trip
 * started, and a robot must not cancel a booking for a trip that has run.
 *
 * The job reads this before cancelling anything, and the warning letters read
 * it before threatening anything, so neither says something that cannot happen.
 */
export const cancelsAutomatically = (balanceDue: string, startDate: string) =>
  midnight(balanceDue).getTime() < midnight(startDate).getTime();
