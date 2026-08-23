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
  date: {
    title: string;
    help: string;
    none: string;
    soldOut: string;
    places: string;
    /** The button when a year has no dates at all. */
    custom: string;
    /** The mark on a date sold to this rider alone. */
    yours: string;
  };
  travellers: {
    title: string;
    help: string;
    riders: string;
    ridersHint: string;
    pillions: string;
    pillionsHint: string;
    people: string;
    peopleHint: string;
    peopleHelp: string;
  };
  extras: {
    title: string;
    help: string;
    insurance: string;
    insuranceHint: string;
    room: string;
    roomHint: string;
    none: string;
  };
  vehicle: {
    title: string;
    help: string;
    seats: string;
    perDay: string;
    total: string;
    own: string;
    ownHint: string;
    noCharge: string;
  };
  summary: {
    title: string;
    help: string;
    year: string;
    dates: string;
    flexible: string;
    riders: string;
    people: string;
    pillions: string;
    insurance: string;
    room: string;
    vehicle: string;
    total: string;
    enquire: string;
    book: string;
    note: string;
    guide: string;
  };
};

/** A car on offer for a 4x4 departure. */
export type WizardVehicle = {
  id: string;
  name: string;
  seats: number;
  /** In the base currency, converted here like every other figure. */
  perDay: number;
};

/** Chosen when someone is driving their own car, which costs nothing here. */
export const OWN_CAR = "own";

export type Departure = {
  /** Carried to the checkout, which prices the row again for itself. */
  id?: string;
  /** A date sold to this rider alone. */
  custom?: boolean;
  start: string;
  end: string;
  soldOut?: boolean;
  /** Places on this departure. Null where the number is not published. */
  seats?: number | null;
  kind?: "motorbike" | "4x4";
  /** Empty on a motorbike departure, which has one machine for everyone. */
  vehicles?: WizardVehicle[];
};

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

/** The vehicle gets a step of its own on a 4x4, where there is a fleet to pick from. */
const STEP_NAMES = ["year", "date", "travellers", "vehicle", "extras", "summary"] as const;
type StepName = (typeof STEP_NAMES)[number];

/** Multi-step booking enquiry. */
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
  const [vehicle, setVehicle] = useState<string | null>(null);

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

  /** A car is hired for the whole trip, so its cost is the daily rate times the days on the road. */
  const days = chosen
    ? Math.round((new Date(chosen.end).getTime() - new Date(chosen.start).getTime()) / 86_400_000) +
      1
    : 0;

  const fleet = chosen?.kind === "4x4" ? (chosen.vehicles ?? []) : [];
  const byPerson = chosen?.kind === "4x4";

  // Three controls under one heading ran off the bottom of the drawer, so the
  // cars stand on their own wherever there are any. Counted from the whole
  // calendar before a date is picked, so the total does not change under the
  // reader on the way through.
  const anyFleet = departures.some(
    (option) => option.kind === "4x4" && (option.vehicles?.length ?? 0) > 0,
  );
  const steps: StepName[] = STEP_NAMES.filter(
    (name) => name !== "vehicle" || (chosen ? fleet.length > 0 : anyFleet),
  ) as StepName[];
  const current = steps[Math.min(step, steps.length - 1)];
  const picked = fleet.find((option) => option.id === vehicle) ?? null;

  // Own car: the daily vehicle rate drops out of the total.
  const vehicleCost = picked ? picked.perDay * days : 0;

  const total =
    riders * prices.rider +
    pillions * prices.pillion +
    insurance * prices.insurance +
    rooms * prices.room +
    vehicleCost;

  // Bounds that keep the answers consistent: no more insured machines than riders.
  const maxInsurance = riders;
  const maxRooms = riders + pillions;
  // A year with nothing published cannot be continued through: there is no date to price.
  const noDates = current === "date" && options.length === 0;
  const canContinue =
    current === "year" ? year !== null : current === "date" ? departure !== null : true;

  // Changing the year invalidates whatever date was picked under the old one.
  const changeYear = (next: number) => {
    setYear(next);
    setDeparture(null);
    setVehicle(null);
  };

  // And a different date may run a different set of cars.
  const checkoutQuery = (departureId: string) => ({
    departure: departureId,
    riders: String(riders),
    pillions: String(pillions),
    rooms: String(rooms),
    protection: String(insurance),
    ...(vehicle && vehicle !== OWN_CAR ? { vehicle } : {}),
    ...(vehicle === OWN_CAR ? { own: "1" } : {}),
  });

  const changeDeparture = (start: string) => {
    setDeparture(start);
    setVehicle(null);
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
      <div className="border-brand-900/12 border-b pb-5">
        <p className="font-display text-brand-900 text-[15px] leading-snug font-bold tracking-[-0.015em]">
          {tourName}
        </p>
        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          <div>
            <dt className="text-brand-800/45 text-[9.5px] font-bold tracking-[0.16em] uppercase">
              {labels.basics.duration}
            </dt>
            <dd className="text-brand-900 mt-0.5 text-[13px] font-semibold">{duration}</dd>
          </div>
          <div>
            <dt className="text-brand-800/45 text-[9.5px] font-bold tracking-[0.16em] uppercase">
              {labels.basics.groupSize}
            </dt>
            <dd className="text-brand-900 mt-0.5 text-[13px] font-semibold">{groupSize}</dd>
          </div>
          <div>
            <dt className="text-brand-800/45 text-[9.5px] font-bold tracking-[0.16em] uppercase">
              {labels.basics.from}
            </dt>
            <dd className="text-brand-900 mt-0.5 text-[13px] font-semibold tabular-nums">
              {price(prices.rider)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3 pt-5">
        <span className="text-brand-800/45 text-[9.5px] font-bold tracking-[0.16em] uppercase">
          {labels.stepOf
            .replace("{current}", String(step + 1))
            .replace("{total}", String(steps.length))}
        </span>
        <span aria-hidden className="flex flex-1 gap-1">
          {steps.map((name, index) => (
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
        {current === "year" && (
          <fieldset>
            <legend className="font-display text-brand-900 text-[17px] leading-snug font-bold tracking-[-0.02em]">
              {labels.year.title}
            </legend>
            <p className="text-brand-800/50 mt-1.5 text-[12.5px]">{labels.year.help}</p>

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
                      : "border-brand-900/15 text-brand-900 hover:border-brand-800/50 bg-white"
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

        {current === "date" && (
          <fieldset>
            <legend className="font-display text-brand-900 text-[17px] leading-snug font-bold tracking-[-0.02em]">
              {labels.date.title}
            </legend>
            <p className="text-brand-800/50 mt-1.5 text-[12.5px]">{labels.date.help}</p>

            {options.length === 0 && (
              <p className="bg-brand-900/4 text-brand-800/60 mt-5 rounded-xl px-4 py-3.5 text-[12.5px] leading-relaxed">
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
                    disabled={option.soldOut}
                    onClick={() => changeDeparture(option.start)}
                    aria-pressed={selected}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-5 py-3.5 text-left transition-colors duration-200 ${
                      selected
                        ? "border-brand-800 bg-brand-800 text-cream-100"
                        : option.soldOut
                          ? "border-brand-900/10 bg-brand-900/4 text-brand-900/40 cursor-not-allowed"
                          : "border-brand-900/15 text-brand-900 hover:border-brand-800/50 bg-white"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="font-display text-[14px] leading-snug font-bold tracking-[-0.015em] tabular-nums">
                        {dateRange.formatRange(new Date(option.start), new Date(option.end))}
                      </span>
                      {option.custom && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold tracking-[0.12em] uppercase ${
                            selected
                              ? "bg-cream-100/20 text-cream-100"
                              : "bg-ember-500/15 text-ember-600"
                          }`}
                        >
                          {labels.date.yours}
                        </span>
                      )}
                    </span>

                    {/**
                     * Sold out wins over a seat count: a departure that is full has no places left
                     * to advertise, whatever its size.
                     */}
                    {(option.soldOut || option.seats) && (
                      <span
                        className={`text-[9.5px] font-bold tracking-[0.14em] whitespace-nowrap uppercase ${
                          selected
                            ? "text-cream-100/60"
                            : option.soldOut
                              ? "text-brand-800/40"
                              : "text-ember-600"
                        }`}
                      >
                        {option.soldOut
                          ? labels.date.soldOut
                          : labels.date.places.replace("{count}", String(option.seats))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {current === "travellers" && (
          <fieldset className="space-y-5">
            <legend className="font-display text-brand-900 text-[17px] leading-snug font-bold tracking-[-0.02em]">
              {labels.travellers.title}
            </legend>
            <p className="text-brand-800/50 -mt-4 text-[12.5px]">
              {byPerson ? labels.travellers.peopleHelp : labels.travellers.help}
            </p>

            <NumberStepper
              name="riders"
              label={byPerson ? labels.travellers.people : labels.travellers.riders}
              hint={byPerson ? labels.travellers.peopleHint : labels.travellers.ridersHint}
              min={1}
              max={maxRiders}
              value={riders}
              onValueChange={changeRiders}
              decreaseLabel={labels.decrease}
              increaseLabel={labels.increase}
            />

            {!byPerson && (
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
            )}
          </fieldset>
        )}

        {current === "vehicle" && (
          <fieldset className="space-y-5">
            <legend className="font-display text-brand-900 text-[17px] leading-snug font-bold tracking-[-0.02em]">
              {labels.vehicle.title}
            </legend>
            <p className="text-brand-800/50 -mt-4 text-[12.5px]">
              {labels.vehicle.help.replace("{days}", String(days))}
            </p>

            <div className="border-brand-900/10 space-y-3 border-b pb-6">
              <p className="text-brand-800/55 text-[11px] font-bold tracking-[0.14em] uppercase">
                {labels.vehicle.title}
              </p>
              <p className="text-brand-800/50 -mt-1 text-[12.5px]">
                {labels.vehicle.help.replace("{days}", String(days))}
              </p>

              <div className="grid gap-2.5">
                <button
                  type="button"
                  onClick={() => setVehicle(OWN_CAR)}
                  aria-pressed={vehicle === OWN_CAR}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-200 ${
                    vehicle === OWN_CAR
                      ? "border-brand-800 bg-brand-800 text-cream-100"
                      : "border-brand-900/15 text-brand-900 hover:border-brand-800/50 bg-white"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-semibold">{labels.vehicle.own}</span>
                    <span
                      className={`block text-[11.5px] ${
                        vehicle === OWN_CAR ? "text-cream-100/60" : "text-brand-800/50"
                      }`}
                    >
                      {labels.vehicle.ownHint}
                    </span>
                  </span>

                  <span className="shrink-0 text-[13px] font-bold">{labels.vehicle.noCharge}</span>
                </button>

                {fleet.map((option) => {
                  const selected = vehicle === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setVehicle(selected ? null : option.id)}
                      aria-pressed={selected}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-200 ${
                        selected
                          ? "border-brand-800 bg-brand-800 text-cream-100"
                          : "border-brand-900/15 text-brand-900 hover:border-brand-800/50 bg-white"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block text-[13.5px] font-semibold">{option.name}</span>
                        <span
                          className={`block text-[11.5px] ${
                            selected ? "text-cream-100/60" : "text-brand-800/50"
                          }`}
                        >
                          {labels.vehicle.seats.replace("{count}", String(option.seats))} ·{" "}
                          {price(option.perDay)} {labels.vehicle.perDay}
                        </span>
                      </span>

                      <span className="shrink-0 text-[13px] font-bold tabular-nums">
                        {price(option.perDay * days)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </fieldset>
        )}

        {current === "extras" && (
          <fieldset className="space-y-5">
            <legend className="font-display text-brand-900 text-[17px] leading-snug font-bold tracking-[-0.02em]">
              {labels.extras.title}
            </legend>
            <p className="text-brand-800/50 -mt-4 text-[12.5px]">
              {labels.extras.help} {labels.extras.none}
            </p>

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
          </fieldset>
        )}

        {current === "summary" && (
          <div>
            <h3 className="font-display text-brand-900 text-[17px] leading-snug font-bold tracking-[-0.02em]">
              {labels.summary.title}
            </h3>
            <p className="text-brand-800/50 mt-1.5 text-[12.5px]">{labels.summary.help}</p>

            <dl className="divide-brand-900/10 border-brand-900/10 mt-5 divide-y border-y">
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
                <dt className={labelClass}>
                  {byPerson ? labels.summary.people : labels.summary.riders}
                </dt>
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
              {vehicle && (
                <div className={rowClass}>
                  <dt className={labelClass}>{labels.summary.vehicle}</dt>
                  <dd className={valueClass}>
                    {picked ? `${picked.name} · ${price(vehicleCost)}` : labels.vehicle.own}
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
              <span className="text-brand-800/45 text-[10.5px] font-bold tracking-[0.16em] uppercase">
                {labels.summary.total}
              </span>
              <span className="font-display text-brand-900 text-[24px] leading-none font-extrabold tracking-[-0.03em] tabular-nums">
                {price(total)}
              </span>
            </div>

            <p className="text-brand-800/45 mt-4 text-[11px] leading-relaxed">
              {labels.summary.note}
            </p>

            <Link
              href="/how-booking-works"
              className="group/g text-brand-800 hover:text-brand-900 mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-semibold underline decoration-[var(--color-ember-500)]/40 underline-offset-[3px]"
            >
              {labels.summary.guide}
              <ArrowRight className="transition-transform duration-300 group-hover/g:translate-x-1" />
            </Link>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="border-brand-900/12 flex gap-2.5 border-t pt-5">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((current) => current - 1)}
            className="border-brand-900/20 text-brand-800 hover:border-brand-800 hover:bg-brand-800 hover:text-cream-100 flex h-12 flex-1 items-center justify-center rounded-full border text-[11px] font-bold tracking-[0.12em] uppercase transition-colors duration-300"
          >
            {labels.back}
          </button>
        )}

        {noDates ? (
          // Nothing to price this year, so the way on is the custom expedition form.
          <Link
            href="/custom-expeditions"
            className="group bg-brand-800 text-cream-100 hover:bg-brand-900 flex h-12 flex-1 items-center justify-center gap-2.5 rounded-full px-4 text-[11px] font-bold tracking-[0.1em] text-nowrap uppercase transition-colors duration-300"
          >
            {labels.date.custom}
            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        ) : step < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((current) => current + 1)}
            disabled={!canContinue}
            className="group bg-brand-800 text-cream-100 hover:bg-brand-900 flex h-12 flex-1 items-center justify-center gap-2.5 rounded-full text-[11px] font-bold tracking-[0.12em] uppercase transition-colors duration-300 disabled:pointer-events-none disabled:opacity-40"
          >
            {labels.next}
            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        ) : chosen?.id ? (
          <Link
            href={{ pathname: "/booking/checkout", query: checkoutQuery(chosen.id) }}
            className="group bg-brand-800 text-cream-100 hover:bg-brand-900 flex h-12 flex-1 items-center justify-center gap-2.5 rounded-full text-[11px] font-bold tracking-[0.12em] uppercase transition-colors duration-300"
          >
            {labels.summary.book}
            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        ) : (
          <Link
            href="/custom-expeditions"
            className="group bg-brand-800 text-cream-100 hover:bg-brand-900 flex h-12 flex-1 items-center justify-center gap-2.5 rounded-full text-[11px] font-bold tracking-[0.12em] uppercase transition-colors duration-300"
          >
            {labels.summary.enquire}
            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        )}
      </div>
    </div>
  );
}
