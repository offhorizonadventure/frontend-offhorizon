"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useId, useState } from "react";

import { ArrowRight } from "@/components/ui/icons";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { vehiclesFor } from "@/lib/enquiries";
import { sendCustomEnquiry } from "@/lib/enquiry-actions";

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
  required: string;
};

type Props = {
  labels: FormLabels;
  destinations: Option[];
  company: Option[];
  currencySymbol: string;
  currency: string;
};

export function CustomExpeditionForm({
  labels,
  destinations,
  company,
  currencySymbol,
  currency,
}: Props) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("custom.fields");
  const currencyCode = currency;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");

  const [mode, setMode] = useState<"motorcycle" | "vehicle">("motorcycle");

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

    const result = await sendCustomEnquiry(
      mode === "motorcycle"
        ? {
            ...shared,
            partyModel: "motorcycle",
            riders,
            pillions,
          }
        : { ...shared, partyModel: "vehicle", vehicleChoice, people },
    );

    if (!result.ok) {
      setPending(false);
      setError(result.error);
      return;
    }

    router.push(`/${locale}/thank-you?from=custom`);
  }

  const field =
    "h-12 w-full rounded-xl border border-brand-900/15 bg-white px-4 text-[14px] text-brand-900 outline-none transition-[border-color,box-shadow] placeholder:text-brand-800/35 focus:border-brand-800 focus:ring-[3px] focus:ring-brand-800/10";
  const label = "block text-[10.5px] font-bold tracking-[0.16em] text-brand-600 uppercase";
  const legend =
    "font-display flex items-center gap-3 text-[11px] font-bold tracking-[0.2em] text-brand-700 uppercase";

  const section = (index: number, title: string, children: React.ReactNode) => (
    <fieldset className="border-brand-900/12 border-t pt-7">
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
      className="bg-paper ring-brand-900/10 space-y-9 rounded-[28px] p-6 ring-1 sm:p-9"
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

          {}
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
                      : "border-brand-900/15 text-brand-900 hover:border-brand-800/40 bg-white"
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
                          : "border-brand-900/15 text-brand-900 hover:border-brand-800/40 bg-white"
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
                    <p className="bg-brand-900/6 text-brand-800/70 rounded-xl px-4 py-3 text-[13px] leading-snug">
                      {t("vehiclesNote", { count: vehicles })}
                    </p>
                  </div>
                )}
              </div>

              {vehicleChoice === "ours" && (
                <p className="border-brand-800/20 bg-brand-800/5 text-brand-800/75 flex gap-2.5 rounded-xl border px-4 py-3 text-[12.5px] leading-relaxed">
                  <span
                    aria-hidden
                    className="bg-brand-800/50 mt-[0.6em] size-1.5 shrink-0 rounded-full"
                  />
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
          <p className="text-brand-800/45 mt-1 text-[12px]">{labels.budgetHint}</p>
          <div className="border-brand-900/15 focus-within:border-brand-800 focus-within:ring-brand-800/10 mt-2.5 flex h-12 items-stretch overflow-hidden rounded-xl border bg-white transition-[border-color,box-shadow] focus-within:ring-[3px]">
            <span
              aria-hidden
              className="border-brand-900/12 text-brand-800 flex shrink-0 items-center border-r px-4 text-[14px] font-semibold"
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
              className="text-brand-900 placeholder:text-brand-800/35 min-w-0 flex-1 bg-transparent px-4 text-[14px] outline-none"
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
            className="border-brand-900/15 text-brand-900 placeholder:text-brand-800/35 focus:border-brand-800 focus:ring-brand-800/10 mt-2 w-full resize-none rounded-xl border bg-white p-4 text-[14px] leading-relaxed transition-[border-color,box-shadow] outline-none focus:ring-[3px]"
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

      {}
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-600/25 bg-red-600/8 px-4 py-3 text-[13px] leading-snug text-red-800"
        >
          {error}
        </p>
      )}

      <div className="border-brand-900/12 border-t pt-7">
        <button
          type="submit"
          disabled={pending}
          className="group bg-brand-800 text-cream-100 hover:bg-brand-900 flex h-13 w-full items-center justify-center gap-2.5 rounded-full text-[11.5px] font-bold tracking-[0.13em] uppercase transition-colors disabled:opacity-60"
        >
          {pending ? labels.sending : labels.submit}
          {!pending && (
            <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          )}
        </button>
        <p className="text-brand-800/40 mt-4 text-center text-[11.5px]">{labels.required}</p>
      </div>
    </form>
  );
}
