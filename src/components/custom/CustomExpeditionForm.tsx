"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId, useState } from "react";

import { ArrowRight } from "@/components/ui/icons";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { submitCustomEnquiry, vehiclesFor } from "@/lib/enquiries";
import { currencyFor, type Locale } from "@/i18n/config";
import { PhoneField } from "@/components/ui/PhoneField";

type Option = { value: string; label: string };

export type FormLabels = {
  sections: { route: string; group: string; budget: string; adventure: string; details: string };
  destination: string;
  destinationPlaceholder: string;
  startDate: string;
  endDate: string;
  company: string;
  companyPlaceholder: string;
  riders: string;
  ridersHint: string;
  pillions: string;
  pillionsHint: string;
  travelMode: string;
  modeMotorcycle: string;
  modeVehicle: string;
  vehicleChoice: string;
  vehicleOwn: string;
  vehicleOwnHint: string;
  vehicleOurs: string;
  vehicleOursHint: string;
  people: string;
  peopleHint: string;
  decrease: string;
  increase: string;
  budgetLabel: string;
  budgetHint: string;
  message: string;
  messagePlaceholder: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryLabel: string;
  searchLabel: string;
  submit: string;
  sending: string;
  successTitle: string;
  successBody: string;
  required: string;
};

type Props = {
  labels: FormLabels;
  destinations: Option[];
  company: Option[];
  currencySymbol: string;
};

/**
 * Custom expedition enquiry.
 *
 * Grouped into numbered fieldsets rather than one long column. Thirteen
 * fields in a flat list reads as paperwork; in five short groups it reads as
 * a conversation, and each group maps to something the operations team
 * actually needs to quote.
 */
export function CustomExpeditionForm({ labels, destinations, company, currencySymbol }: Props) {
  const locale = useLocale();
  // Read straight from the catalogue: an ICU plural cannot be prebuilt on the
  // server and handed over, because a function cannot cross into a client
  // component.
  const t = useTranslations("custom.fields");
  const currencyCode = currencyFor(locale as Locale);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [startDate, setStartDate] = useState("");

  // How the party is counted. A motorcycle trip counts riders and pillions; a
  // 4x4 counts people, and the vehicles follow from that.
  const [mode, setMode] = useState<"motorcycle" | "vehicle">("motorcycle");

  // One pillion per machine, so pillions can never exceed riders. Controlled so
  // dropping the riders takes the pillions down with it rather than leaving an
  // impossible pair on screen.
  const [riders, setRiders] = useState(1);
  const [pillions, setPillions] = useState(0);
  const [vehicleChoice, setVehicleChoice] = useState<"own" | "ours">("ours");
  const [people, setPeople] = useState(2);
  const vehicles = vehiclesFor(people);

  const id = useId();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setPending(true);
    setError(null);

    const shared = {
      source: "Custom expeditions",
      locale,
      firstName: String(data.get("firstName") ?? ""),
      lastName: String(data.get("lastName") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: [data.get("dialCode"), data.get("phone")].filter(Boolean).join(" ").trim(),
      message: String(data.get("message") ?? ""),
      destination: String(data.get("destination") ?? ""),
      startDate: String(data.get("startDate") ?? "") || null,
      endDate: String(data.get("endDate") ?? "") || null,
      travellingWith: String(data.get("company") ?? ""),
      budgetAmount: Number(data.get("budget")) || null,
      budgetCurrency: currencyCode,
    };

    const result = await submitCustomEnquiry(
      mode === "motorcycle"
        ? {
            ...shared,
            partyModel: "motorcycle",
            riders,
            pillions,
          }
        : { ...shared, partyModel: "vehicle", vehicleChoice, people },
    );

    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSent(true);
  }

  const field =
    "h-12 w-full rounded-xl border border-brand-900/15 bg-white px-4 text-[14px] text-brand-900 outline-none transition-[border-color,box-shadow] placeholder:text-brand-800/35 focus:border-brand-800 focus:ring-[3px] focus:ring-brand-800/10";
  const label = "block text-[10.5px] font-bold tracking-[0.16em] text-brand-600 uppercase";
  const legend =
    "font-display flex items-center gap-3 text-[11px] font-bold tracking-[0.2em] text-brand-700 uppercase";

  if (sent) {
    return (
      <div className="flex min-h-[30rem] flex-col items-center justify-center rounded-[28px] bg-paper p-10 text-center ring-1 ring-brand-900/10">
        <span className="flex size-14 items-center justify-center rounded-full bg-ember-500/15 text-ember-600">
          <ArrowRight className="size-6 -rotate-45" />
        </span>
        <h2 className="font-display mt-6 text-[24px] font-extrabold tracking-[-0.025em] text-brand-900">
          {labels.successTitle}
        </h2>
        <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-brand-800/60">
          {labels.successBody}
        </p>
      </div>
    );
  }

  const section = (index: number, title: string, children: React.ReactNode) => (
    <fieldset className="border-t border-brand-900/12 pt-7">
      <legend className="sr-only">{title}</legend>
      <p aria-hidden className={legend}>
        <span className="text-brand-400 tabular-nums">{String(index).padStart(2, "0")}</span>
        {title}
      </p>
      <div className="mt-6 space-y-5">{children}</div>
    </fieldset>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-9 rounded-[28px] bg-paper p-6 ring-1 ring-brand-900/10 sm:p-9"
    >
      {section(
        1,
        labels.sections.route,
        <>
          <div>
            <label htmlFor={`${id}-destination`} className={label}>
              {labels.destination}
            </label>
            <select
              id={`${id}-destination`}
              name="destination"
              required
              defaultValue=""
              className={`${field} mt-2 appearance-none bg-[length:11px] bg-[position:right_1rem_center] bg-no-repeat pr-10`}
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none' stroke='%23562101' stroke-width='1.6' stroke-linecap='round'><path d='M2.5 4.5L6 8l3.5-3.5'/></svg>\")",
              }}
            >
              <option value="" disabled>
                {labels.destinationPlaceholder}
              </option>
              {destinations.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={`${id}-start`} className={label}>
                {labels.startDate}
              </label>
              <input
                id={`${id}-start`}
                name="startDate"
                type="date"
                required
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className={`${field} mt-2`}
              />
            </div>
            <div>
              <label htmlFor={`${id}-end`} className={label}>
                {labels.endDate}
              </label>
              <input
                id={`${id}-end`}
                name="endDate"
                type="date"
                required
                // Cannot return before you leave.
                min={startDate || undefined}
                className={`${field} mt-2`}
              />
            </div>
          </div>
        </>,
      )}

      {section(
        2,
        labels.sections.group,
        <>
          <div>
            <label htmlFor={`${id}-company`} className={label}>
              {labels.company}
            </label>
            <select
              id={`${id}-company`}
              name="company"
              required
              defaultValue=""
              className={`${field} mt-2 appearance-none bg-[length:11px] bg-[position:right_1rem_center] bg-no-repeat pr-10`}
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none' stroke='%23562101' stroke-width='1.6' stroke-linecap='round'><path d='M2.5 4.5L6 8l3.5-3.5'/></svg>\")",
              }}
            >
              <option value="" disabled>
                {labels.companyPlaceholder}
              </option>
              {company.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* How the party is counted depends on the machine. A motorcycle
              trip is riders and pillions; a 4x4 is people, and the vehicles
              follow from that rather than being typed in, so four seats per
              vehicle cannot be exceeded. */}
          <div>
            <span className={label}>{labels.travelMode}</span>
            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
              {(
                [
                  ["motorcycle", labels.modeMotorcycle],
                  ["vehicle", labels.modeVehicle],
                ] as const
              ).map(([value, text]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  aria-pressed={mode === value}
                  className={`h-12 rounded-xl border px-4 text-left text-[14px] transition-colors ${
                    mode === value
                      ? "border-brand-800 bg-brand-800 text-cream-100"
                      : "border-brand-900/15 bg-white text-brand-900 hover:border-brand-800/40"
                  }`}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>

          {mode === "motorcycle" ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberStepper
                name="riders"
                label={labels.riders}
                hint={labels.ridersHint}
                min={1}
                max={40}
                value={riders}
                onValueChange={(next) => {
                  setRiders(next);
                  setPillions((current) => Math.min(current, next));
                }}
                decreaseLabel={labels.decrease}
                increaseLabel={labels.increase}
              />
              <NumberStepper
                name="pillions"
                label={labels.pillions}
                hint={labels.pillionsHint}
                min={0}
                max={riders}
                value={pillions}
                onValueChange={setPillions}
                decreaseLabel={labels.decrease}
                increaseLabel={labels.increase}
              />
            </div>
          ) : (
            <>
              <div>
                <span className={label}>{labels.vehicleChoice}</span>
                <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
                  {(
                    [
                      ["ours", labels.vehicleOurs, labels.vehicleOursHint],
                      ["own", labels.vehicleOwn, labels.vehicleOwnHint],
                    ] as const
                  ).map(([value, text, hint]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setVehicleChoice(value)}
                      aria-pressed={vehicleChoice === value}
                      className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                        vehicleChoice === value
                          ? "border-brand-800 bg-brand-800 text-cream-100"
                          : "border-brand-900/15 bg-white text-brand-900 hover:border-brand-800/40"
                      }`}
                    >
                      <span className="block text-[14px] font-semibold">{text}</span>
                      <span
                        className={`mt-0.5 block text-[12px] leading-snug ${
                          vehicleChoice === value ? "text-cream-100/70" : "text-brand-800/50"
                        }`}
                      >
                        {hint}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <NumberStepper
                  name="people"
                  label={labels.people}
                  hint={labels.peopleHint}
                  min={1}
                  max={40}
                  value={people}
                  onValueChange={setPeople}
                  decreaseLabel={labels.decrease}
                  increaseLabel={labels.increase}
                />

                {vehicleChoice === "ours" && (
                  <div className="flex items-end">
                    <p className="rounded-xl bg-brand-900/6 px-4 py-3 text-[13px] leading-snug text-brand-800/70">
                      {t("vehiclesNote", { count: vehicles })}
                    </p>
                  </div>
                )}
              </div>

              {vehicleChoice === "ours" && (
                <p className="flex gap-2.5 rounded-xl border border-brand-800/20 bg-brand-800/5 px-4 py-3 text-[12.5px] leading-relaxed text-brand-800/75">
                  <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-brand-800/50" />
                  {t("vehicleDailyNote")}
                </p>
              )}
            </>
          )}
        </>,
      )}

      {section(
        3,
        labels.sections.budget,
        <div>
          <label htmlFor={`${id}-budget`} className={label}>
            {labels.budgetLabel}
          </label>
          <p className="mt-1 text-[12px] text-brand-800/45">{labels.budgetHint}</p>
          <div className="mt-2.5 flex h-12 items-stretch overflow-hidden rounded-xl border border-brand-900/15 bg-white transition-[border-color,box-shadow] focus-within:border-brand-800 focus-within:ring-[3px] focus-within:ring-brand-800/10">
            <span
              aria-hidden
              className="flex shrink-0 items-center border-r border-brand-900/12 px-4 text-[14px] font-semibold text-brand-800"
            >
              {currencySymbol}
            </span>
            <input
              id={`${id}-budget`}
              name="budget"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="2000"
              className="min-w-0 flex-1 bg-transparent px-4 text-[14px] text-brand-900 outline-none placeholder:text-brand-800/35"
            />
          </div>
        </div>,
      )}

      {section(
        4,
        labels.sections.adventure,
        <div>
          <label htmlFor={`${id}-message`} className={label}>
            {labels.message}
          </label>
          <textarea
            id={`${id}-message`}
            name="message"
            rows={5}
            placeholder={labels.messagePlaceholder}
            className="mt-2 w-full resize-none rounded-xl border border-brand-900/15 bg-white p-4 text-[14px] leading-relaxed text-brand-900 outline-none transition-[border-color,box-shadow] placeholder:text-brand-800/35 focus:border-brand-800 focus:ring-[3px] focus:ring-brand-800/10"
          />
        </div>,
      )}

      {section(
        5,
        labels.sections.details,
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={`${id}-first`} className={label}>
                {labels.firstName}
              </label>
              <input
                id={`${id}-first`}
                name="firstName"
                type="text"
                required
                autoComplete="given-name"
                className={`${field} mt-2`}
              />
            </div>
            <div>
              <label htmlFor={`${id}-last`} className={label}>
                {labels.lastName}
              </label>
              <input
                id={`${id}-last`}
                name="lastName"
                type="text"
                required
                autoComplete="family-name"
                className={`${field} mt-2`}
              />
            </div>
          </div>

          <div>
            <label htmlFor={`${id}-email`} className={label}>
              {labels.email}
            </label>
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              required
              autoComplete="email"
              className={`${field} mt-2`}
            />
          </div>

          <div>
            <label htmlFor={`${id}-phone`} className={label}>
              {labels.phone}
            </label>
            <div className="mt-2">
              <PhoneField
                id={`${id}-phone`}
                name="phone"
                required
                countryLabel={labels.countryLabel}
                searchLabel={labels.searchLabel}
              />
            </div>
          </div>
        </>,
      )}

      {/* A failed send must not look like a successful one. */}
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-600/25 bg-red-600/8 px-4 py-3 text-[13px] leading-snug text-red-800"
        >
          {error}
        </p>
      )}

      <div className="border-t border-brand-900/12 pt-7">
        <button
          type="submit"
          disabled={pending}
          className="group flex h-13 w-full items-center justify-center gap-2.5 rounded-full bg-brand-800 text-[11.5px] font-bold tracking-[0.13em] text-cream-100 uppercase transition-colors hover:bg-brand-900 disabled:opacity-60"
        >
          {pending ? labels.sending : labels.submit}
          {!pending && (
            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          )}
        </button>
        <p className="mt-4 text-center text-[11.5px] text-brand-800/40">{labels.required}</p>
      </div>
    </form>
  );
}
