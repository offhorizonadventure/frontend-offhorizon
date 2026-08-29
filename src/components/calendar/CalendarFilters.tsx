"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { ChevronDown } from "@/components/ui/icons";

export type Option = { value: string; label: string };

export function CalendarFilters({
  countries,
  years,
  labels,
}: {
  countries: Option[];
  years: Option[];
  labels: {
    trips: string;
    destination: string;
    allDestinations: string;
    year: string;
    allYears: string;
  };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);

    startTransition(() => {
      router.replace(next.size ? `${pathname}?${next}` : pathname, { scroll: false });
    });
  };

  const field =
    "peer h-12 w-full cursor-pointer appearance-none rounded-xl border border-brand-900/15 bg-white pl-4 pr-10 text-[14px] text-brand-900 outline-none transition-colors focus:border-brand-800";

  return (
    <div
      data-pending={pending || undefined}
      className="grid gap-4 data-pending:opacity-60 sm:grid-cols-2"
    >
      <label className="block">
        <span className="text-brand-800/55 block text-[10.5px] font-bold tracking-[0.14em] uppercase">
          {labels.destination}
        </span>
        <span className="relative mt-2 block">
          <select
            value={params.get("country") ?? ""}
            onChange={(event) => set("country", event.target.value)}
            className={field}
          >
            <option value="">{labels.allDestinations}</option>
            {countries.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
          <span className="text-brand-800/45 pointer-events-none absolute inset-y-0 right-4 flex items-center">
            <ChevronDown />
          </span>
        </span>
      </label>

      <label className="block">
        <span className="text-brand-800/55 block text-[10.5px] font-bold tracking-[0.14em] uppercase">
          {labels.year}
        </span>
        <span className="relative mt-2 block">
          <select
            value={params.get("year") ?? ""}
            onChange={(event) => set("year", event.target.value)}
            className={field}
          >
            <option value="">{labels.allYears}</option>
            {years.map((year) => (
              <option key={year.value} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>
          <span className="text-brand-800/45 pointer-events-none absolute inset-y-0 right-4 flex items-center">
            <ChevronDown />
          </span>
        </span>
      </label>
    </div>
  );
}
