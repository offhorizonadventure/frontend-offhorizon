"use client";

import { useMemo, useState } from "react";

import { NumberStepper } from "@/components/ui/NumberStepper";
import { ArrowRight, ChevronDown } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";

export type BookingLabels = {
  stepOf: string;
  back: string;
  next: string;
  decrease: string;
  increase: string;
  basics: { duration: string; groupSize: string; from: string; perRider: string };
  year: { title: string; help: string };
  date: { title: string; help: string; none: string; soldOut: string };
  travellers: { title: string; help: string; riders: string; ridersHint: string; pillions: string; pillionsHint: string };
  extras: { title: string; help: string; insurance: string; insuranceHint: string; room: string; roomHint: string; none: string };
  summary: { title: string; help: string; year: string; dates: string; flexible: string; riders: string; pillions: string; insurance: string; room: string; total: string; enquire: string; note: string };
};

export type Departure = { start: string; end: string; soldOut?: boolean };

export type BookingProps = {
  tourName: string;
  duration: string;
  groupSize: string;
  /** Base-currency unit prices. Converted here so totals recalculate live. */
  prices: { rider: number; pillion: number; insurance: number; room: number };
  currency: string;
  rate: number;
  locale: string;
  maxRiders: number;
  departures: Departure[];
  labels: BookingLabels;
};

const STEPS = ["year", "date", "travellers", "extras", "summary"] as const;

/**
 * Multi-step booking enquiry.
 *
 * One question per step, because the answers depend on each other: the number
 * of machines to insure cannot exceed the riders, and the rooms cannot exceed
 * the people. Asking everything on one screen means validating those
 * relationships after the fact instead of just bounding the next control.
 *
 * The running total is computed here rather than fetched, so it updates as the
 * steppers move. The rate comes in from the server with the rest of the props.
 */
export function BookingWizard({
  tourName,
  duration,
  groupSize,
  prices,
  currency,
  rate,
  locale,
  maxRiders,
  departures,
  labels,
}: BookingProps) {
  const [step, setStep] = useState(0);
  const [year, setYear] = useState<number | null>(null);
  const [departure, setDeparture] = useState<string | null>(null);
  const [riders, setRiders] = useState(1);
  const [pillions, setPillions] = useState(0);
  const [insurance, setInsurance] = useState(0);
  const [rooms, setRooms] = useState(0);

  // Current year plus the two after it.
  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return [now, now + 1, now + 2];
  }, []);

  const money = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }),
    [locale, currency],
  );

  const price = (base: number) => money.format(Math.round(base * rate));

  const dateRange = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }),
    [locale],
  );

  // Only the departures in the chosen year, so the two questions stay in step.
  const options = useMemo(
    () => (year === null ? [] : departures.filter((d) => new Date(d.start).getFullYear() === year)),
    [departures, year],
  );

  const chosen = options.find((option) => option.start === departure) ?? null;

  const total =
    riders * prices.rider +
    pillions * prices.pillion +
    insurance * prices.insurance +
    rooms * prices.room;

  // Bounds that keep the answers consistent with each other: you cannot insure
  // more machines than you have riders, or book more single rooms than people.
  // Clamped when the driving number changes rather than during render, so the
  // extras cannot be left stranded above their own maximum.
  const maxInsurance = riders;
  const maxRooms = riders + pillions;
  const canContinue =
    step === 0
      ? year !== null
      : step === 1
        ? // Nothing to pick in a year with no published departures, so the step
          // must not become a dead end.
          departure !== null || options.length === 0
        : true;

  // Changing the year invalidates whatever date was picked under the old one.
  const changeYear = (next: number) => {
    setYear(next);
    setDeparture(null);
  };

  const changeRiders = (next: number) => {
    setRiders(next);
    setPillions((current) => Math.min(current, next));
    setInsurance((current) => Math.min(current, next));
    setRooms((current) => Math.min(current, next + Math.min(pillions, next)));
  };

  const changePillions = (next: number) => {
    setPillions(next);
    setRooms((current) => Math.min(current, riders + next));
  };

  const rowClass = "flex items-baseline justify-between gap-4 py-2.5";
  const labelClass = "text-[13px] text-brand-800/60";
  const valueClass = "text-[13.5px] font-bold text-brand-900 tabular-nums";

  return (
    <div className="flex h-full flex-col">
      {/* Basics, always on show. */}
      <div className="border-b border-brand-900/12 pb-5">
        <p className="font-display text-[15px] leading-snug font-bold tracking-[-0.015em] text-brand-900">
          {tourName}
        </p>
        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          <div>
            <dt className="text-[9.5px] font-bold tracking-[0.16em] text-brand-800/45 uppercase">
              {labels.basics.duration}
            </dt>
            <dd className="mt-0.5 text-[13px] font-semibold text-brand-900">{duration}</dd>
          </div>
          <div>
            <dt className="text-[9.5px] font-bold tracking-[0.16em] text-brand-800/45 uppercase">
              {labels.basics.groupSize}
            </dt>
            <dd className="mt-0.5 text-[13px] font-semibold text-brand-900">{groupSize}</dd>
          </div>
          <div>
            <dt className="text-[9.5px] font-bold tracking-[0.16em] text-brand-800/45 uppercase">
              {labels.basics.from}
            </dt>
            <dd className="mt-0.5 text-[13px] font-semibold text-brand-900 tabular-nums">
              {price(prices.rider)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3 pt-5">
        <span className="text-[9.5px] font-bold tracking-[0.16em] text-brand-800/45 uppercase">
          {labels.stepOf.replace("{current}", String(step + 1)).replace("{total}", String(STEPS.length))}
        </span>
        <span aria-hidden className="flex flex-1 gap-1">
          {STEPS.map((name, index) => (
            <span
              key={name}
              className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                index <= step ? "bg-ember-500" : "bg-brand-900/12"
              }`}
            />
          ))}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        {step === 0 && (
          <fieldset>
            <legend className="font-display text-[17px] leading-snug font-bold tracking-[-0.02em] text-brand-900">
              {labels.year.title}
            </legend>
            <p className="mt-1.5 text-[12.5px] text-brand-800/50">{labels.year.help}</p>

            <div className="mt-5 grid gap-2.5">
              {years.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => changeYear(option)}
                  aria-pressed={year === option}
                  className={`flex h-13 items-center justify-between rounded-xl border px-5 text-left transition-colors duration-200 ${
                    year === option
                      ? "border-brand-800 bg-brand-800 text-cream-100"
                      : "border-brand-900/15 bg-white text-brand-900 hover:border-brand-800/50"
                  }`}
                >
                  <span className="font-display text-[17px] font-bold tracking-[-0.02em] tabular-nums">
                    {option}
                  </span>
                  {year === option && <ChevronDown className="-rotate-90" />}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset>
            <legend className="font-display text-[17px] leading-snug font-bold tracking-[-0.02em] text-brand-900">
              {labels.date.title}
            </legend>
            <p className="mt-1.5 text-[12.5px] text-brand-800/50">{labels.date.help}</p>

            {options.length === 0 && (
              <p className="mt-5 rounded-xl bg-brand-900/4 px-4 py-3.5 text-[12.5px] leading-relaxed text-brand-800/60">
                {labels.date.none.replace("{year}", String(year))}
              </p>
            )}

            <div className="mt-5 grid gap-2.5">
              {options.map((option) => {
                const selected = departure === option.start;

                return (
                  <button
                    key={option.start}
                    type="button"
                    onClick={() => setDeparture(option.start)}
                    aria-pressed={selected}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-5 py-3.5 text-left transition-colors duration-200 ${
                      selected
                        ? "border-brand-800 bg-brand-800 text-cream-100"
                        : "border-brand-900/15 bg-white text-brand-900 hover:border-brand-800/50"
                    }`}
                  >
                    <span className="font-display text-[14px] leading-snug font-bold tracking-[-0.015em] tabular-nums">
                      {dateRange.formatRange(new Date(option.start), new Date(option.end))}
                    </span>
                    {option.soldOut && (
                      <span
                        className={`text-[9.5px] font-bold tracking-[0.14em] whitespace-nowrap uppercase ${
                          selected ? "text-cream-100/60" : "text-brand-800/40"
                        }`}
                      >
                        {labels.date.soldOut}
                      </span>
                    )}
                  </button>
                );
              })}

            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="space-y-5">
            <legend className="font-display text-[17px] leading-snug font-bold tracking-[-0.02em] text-brand-900">
              {labels.travellers.title}
            </legend>
            <p className="-mt-4 text-[12.5px] text-brand-800/50">{labels.travellers.help}</p>

            <NumberStepper
              name="riders"
              label={labels.travellers.riders}
              hint={labels.travellers.ridersHint}
              min={1}
              max={maxRiders}
              value={riders}
              onValueChange={changeRiders}
              decreaseLabel={labels.decrease}
              increaseLabel={labels.increase}
            />

            <NumberStepper
              name="pillions"
              label={labels.travellers.pillions}
              hint={labels.travellers.pillionsHint}
              min={0}
              max={riders}
              value={pillions}
              onValueChange={changePillions}
              decreaseLabel={labels.decrease}
              increaseLabel={labels.increase}
            />
          </fieldset>
        )}

        {step === 3 && (
          <fieldset className="space-y-5">
            <legend className="font-display text-[17px] leading-snug font-bold tracking-[-0.02em] text-brand-900">
              {labels.extras.title}
            </legend>
            <p className="-mt-4 text-[12.5px] text-brand-800/50">{labels.extras.help}</p>

            <NumberStepper
              name="insurance"
              label={`${labels.extras.insurance} · ${price(prices.insurance)}`}
              hint={labels.extras.insuranceHint}
              min={0}
              max={maxInsurance}
              value={insurance}
              onValueChange={setInsurance}
              decreaseLabel={labels.decrease}
              increaseLabel={labels.increase}
            />

            <NumberStepper
              name="singleRoom"
              label={`${labels.extras.room} · ${price(prices.room)}`}
              hint={labels.extras.roomHint}
              min={0}
              max={maxRooms}
              value={rooms}
              onValueChange={setRooms}
              decreaseLabel={labels.decrease}
              increaseLabel={labels.increase}
            />

            <p className="text-[12px] text-brand-800/45">{labels.extras.none}</p>
          </fieldset>
        )}

        {step === 4 && (
          <div>
            <h3 className="font-display text-[17px] leading-snug font-bold tracking-[-0.02em] text-brand-900">
              {labels.summary.title}
            </h3>
            <p className="mt-1.5 text-[12.5px] text-brand-800/50">{labels.summary.help}</p>

            <dl className="mt-5 divide-y divide-brand-900/10 border-y border-brand-900/10">
              <div className={rowClass}>
                <dt className={labelClass}>{labels.summary.year}</dt>
                <dd className={valueClass}>{year}</dd>
              </div>
              <div className={rowClass}>
                <dt className={labelClass}>{labels.summary.dates}</dt>
                <dd className={valueClass}>
                  {chosen
                    ? dateRange.formatRange(new Date(chosen.start), new Date(chosen.end))
                    : labels.summary.flexible}
                </dd>
              </div>
              <div className={rowClass}>
                <dt className={labelClass}>{labels.summary.riders}</dt>
                <dd className={valueClass}>
                  {riders} · {price(riders * prices.rider)}
                </dd>
              </div>
              {pillions > 0 && (
                <div className={rowClass}>
                  <dt className={labelClass}>{labels.summary.pillions}</dt>
                  <dd className={valueClass}>
                    {pillions} · {price(pillions * prices.pillion)}
                  </dd>
                </div>
              )}
              {insurance > 0 && (
                <div className={rowClass}>
                  <dt className={labelClass}>{labels.summary.insurance}</dt>
                  <dd className={valueClass}>
                    {insurance} · {price(insurance * prices.insurance)}
                  </dd>
                </div>
              )}
              {rooms > 0 && (
                <div className={rowClass}>
                  <dt className={labelClass}>{labels.summary.room}</dt>
                  <dd className={valueClass}>
                    {rooms} · {price(rooms * prices.room)}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-5 flex items-baseline justify-between gap-4">
              <span className="text-[10.5px] font-bold tracking-[0.16em] text-brand-800/45 uppercase">
                {labels.summary.total}
              </span>
              <span className="font-display text-[24px] leading-none font-extrabold tracking-[-0.03em] text-brand-900 tabular-nums">
                {price(total)}
              </span>
            </div>

            <p className="mt-4 text-[11px] leading-relaxed text-brand-800/45">
              {labels.summary.note}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-2.5 border-t border-brand-900/12 pt-5">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((current) => current - 1)}
            className="flex h-12 flex-1 items-center justify-center rounded-full border border-brand-900/20 text-[11px] font-bold tracking-[0.12em] text-brand-800 uppercase transition-colors duration-300 hover:border-brand-800 hover:bg-brand-800 hover:text-cream-100"
          >
            {labels.back}
          </button>
        )}

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((current) => current + 1)}
            disabled={!canContinue}
            className="group flex h-12 flex-1 items-center justify-center gap-2.5 rounded-full bg-brand-800 text-[11px] font-bold tracking-[0.12em] text-cream-100 uppercase transition-colors duration-300 hover:bg-brand-900 disabled:pointer-events-none disabled:opacity-40"
          >
            {labels.next}
            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        ) : (
          <Link
            href="/custom-expeditions"
            className="group flex h-12 flex-1 items-center justify-center gap-2.5 rounded-full bg-brand-800 text-[11px] font-bold tracking-[0.12em] text-cream-100 uppercase transition-colors duration-300 hover:bg-brand-900"
          >
            {labels.summary.enquire}
            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        )}
      </div>
    </div>
  );
}
