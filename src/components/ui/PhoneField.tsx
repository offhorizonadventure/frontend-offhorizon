"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";

import { Flag } from "@/components/ui/Flag";
import { ChevronDown } from "@/components/ui/icons";
import { countryCodes, dialCodes } from "@/config/dial-codes";
import { marketFor, type Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";

type PhoneFieldProps = {
  id: string;
  /** Name of the hidden field carrying the combined `+<code><number>` value. */
  name: string;
  required?: boolean;
  searchLabel: string;
  countryLabel: string;
};

/**
 * Phone input with a country dial-code picker.
 *
 * Country names come from `Intl.DisplayNames`, so the list is translated into
 * whichever language the visitor is browsing without shipping five name
 * tables. The dial codes are generated from libphonenumber-js at build time
 * (see `config/dial-codes.ts`), so only about 4kb of data reaches the browser
 * instead of the library's full metadata.
 *
 * The visible input holds the national number; a hidden field carries the full
 * `+<code><number>` string, which is what a form handler actually wants.
 */
export function PhoneField({
  id,
  name,
  required,
  searchLabel,
  countryLabel,
}: PhoneFieldProps) {
  const locale = useLocale() as Locale;
  const [country, setCountry] = useState(() => marketFor(locale).flag.toUpperCase());
  const [number, setNumber] = useState("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const wrapper = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const names = useMemo(() => new Intl.DisplayNames([locale], { type: "region" }), [locale]);

  const countries = useMemo(
    () =>
      countryCodes
        .map((code) => ({ code, name: names.of(code) ?? code, dial: dialCodes[code] }))
        .sort((a, b) => a.name.localeCompare(b.name, locale)),
    [names, locale],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return countries;
    return countries.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.code.toLowerCase().includes(term) ||
        item.dial.includes(term.replace(/^\+/, "")),
    );
  }, [countries, query]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open]);

  const dial = dialCodes[country] ?? "";

  return (
    <div ref={wrapper} className="relative">
      <div className="flex h-12 items-stretch overflow-hidden rounded-xl border border-brand-900/15 bg-white transition-colors focus-within:border-brand-800">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={countryLabel}
          className="flex shrink-0 items-center gap-2 border-r border-brand-900/12 px-3 transition-colors hover:bg-cream-50"
        >
          <Flag country={country} />
          <span className="text-[13px] font-semibold text-brand-900 tabular-nums">+{dial}</span>
          <ChevronDown
            className={cn("text-brand-500 transition-transform duration-300", open && "rotate-180")}
          />
        </button>

        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required={required}
          value={number}
          onChange={(event) => setNumber(event.target.value.replace(/[^\d\s-]/g, ""))}
          className="min-w-0 flex-1 bg-transparent px-3.5 text-[14px] text-brand-900 outline-none placeholder:text-brand-800/35"
          placeholder="00000 00000"
        />
      </div>

      {/* What the form handler receives. */}
      <input type="hidden" name={name} value={number ? `+${dial}${number.replace(/\D/g, "")}` : ""} />

      <div
        role="listbox"
        aria-label={countryLabel}
        className={cn(
          "absolute z-50 mt-2 max-h-72 w-full origin-top overflow-hidden rounded-2xl border border-brand-900/12 bg-white shadow-[0_20px_50px_-20px_rgba(42,16,2,0.35)] transition-all duration-200 ease-out-expo",
          open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0",
        )}
      >
        <div className="border-b border-brand-900/8 p-2">
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchLabel}
            aria-label={searchLabel}
            className="h-9 w-full rounded-lg bg-cream-50 px-3 text-[13px] text-brand-900 outline-none placeholder:text-brand-800/35"
          />
        </div>

        <ul className="max-h-56 overflow-y-auto overscroll-contain py-1">
          {filtered.map((item) => (
            <li key={item.code}>
              <button
                type="button"
                role="option"
                aria-selected={item.code === country}
                onClick={() => {
                  setCountry(item.code);
                  setOpen(false);
                  setQuery("");
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-cream-50",
                  item.code === country ? "font-semibold text-brand-800" : "text-brand-900/80",
                )}
              >
                <Flag country={item.code} />
                <span className="min-w-0 flex-1 truncate">{item.name}</span>
                <span className="shrink-0 text-brand-500 tabular-nums">+{item.dial}</span>
              </button>
            </li>
          ))}

          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-[13px] text-brand-800/40">{searchLabel}</li>
          )}
        </ul>
      </div>
    </div>
  );
}
