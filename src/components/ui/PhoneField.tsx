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
  /** Two letter country for the dial code, e.g. "IN". Defaults to the market. */
  defaultCountry?: string;
  /** The national part, without the dial code. */
  defaultNumber?: string;
};

/** Phone input with a country dial-code picker. */
export function PhoneField({
  id,
  name,
  required,
  searchLabel,
  countryLabel,
  defaultCountry,
  defaultNumber = "",
}: PhoneFieldProps) {
  const locale = useLocale() as Locale;
  const [country, setCountry] = useState(
    () => defaultCountry?.toUpperCase() ?? marketFor(locale).flag.toUpperCase(),
  );
  const [number, setNumber] = useState(defaultNumber);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  /** The option list is built only once the picker has been opened, which can only happen after a click and therefore only on the client. */
  const [everOpened, setEverOpened] = useState(false);

  const wrapper = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const names = useMemo(() => new Intl.DisplayNames([locale], { type: "region" }), [locale]);

  const countries = useMemo(
    () =>
      !everOpened
        ? []
        : countryCodes
            .map((code) => ({
              code,
              name: names.of(code) ?? code,
              dial: dialCodes[code],
            }))
            .sort((a, b) => a.name.localeCompare(b.name, locale)),
    [everOpened, names, locale],
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
      <div className="border-brand-900/15 focus-within:border-brand-800 focus-within:ring-brand-800/10 flex h-12 items-stretch overflow-hidden rounded-xl border bg-white transition-[border-color,box-shadow] focus-within:ring-[3px]">
        <button
          type="button"
          onClick={() => {
            setEverOpened(true);
            setOpen((value) => !value);
          }}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={countryLabel}
          className="border-brand-900/12 hover:bg-cream-50 flex shrink-0 items-center gap-2 border-r px-3 transition-colors"
        >
          <Flag country={country} />
          <span className="text-brand-900 text-[13px] font-semibold tabular-nums">+{dial}</span>
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
          className="text-brand-900 placeholder:text-brand-800/35 min-w-0 flex-1 bg-transparent px-3.5 text-[14px] outline-none"
          placeholder="00000 00000"
        />
      </div>

      {/* What the form handler receives. */}
      <input
        type="hidden"
        name={name}
        value={number ? `+${dial}${number.replace(/\D/g, "")}` : ""}
      />

      <div
        role="listbox"
        aria-label={countryLabel}
        className={cn(
          "border-brand-900/12 ease-out-expo absolute z-50 mt-2 max-h-72 w-full origin-top overflow-hidden rounded-2xl border bg-white shadow-[0_20px_50px_-20px_rgba(42,16,2,0.35)] transition-all duration-200",
          open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0",
        )}
      >
        <div className="border-brand-900/8 border-b p-2">
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchLabel}
            aria-label={searchLabel}
            className="bg-cream-50 text-brand-900 placeholder:text-brand-800/35 h-9 w-full rounded-lg px-3 text-[13px] outline-none"
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
                  "hover:bg-cream-50 flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors",
                  item.code === country ? "text-brand-800 font-semibold" : "text-brand-900/80",
                )}
              >
                <Flag country={item.code} />
                <span className="min-w-0 flex-1 truncate">{item.name}</span>
                <span className="text-brand-500 shrink-0 tabular-nums">+{item.dial}</span>
              </button>
            </li>
          ))}

          {everOpened && filtered.length === 0 && (
            <li className="text-brand-800/40 px-3 py-6 text-center text-[13px]">{searchLabel}</li>
          )}
        </ul>
      </div>
    </div>
  );
}
