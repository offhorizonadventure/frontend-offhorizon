"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { fold, type CountryOption } from "@/lib/countries";

/**
 * Pick a country by typing part of its name.
 *
 * A plain `<select>` with two hundred and forty nine options is a scroll bar
 * and a guess, and it cannot be searched on a phone at all. This is an input
 * that filters as you type, with a hidden field carrying the two letter code
 * that actually gets stored: what the rider reads is a name in their own
 * language, what the office receives is ISO 3166-1.
 *
 * The typed text is never submitted. If it does not resolve to a country the
 * hidden field is empty and the form says so, rather than saving whatever was
 * left in the box.
 */
export function CountrySelect({
  name,
  options,
  defaultValue,
  label,
  placeholder,
  noMatch,
  clearLabel,
  required,
  fieldClass,
  labelClass,
}: {
  name: string;
  options: CountryOption[];
  defaultValue?: string | null;
  label: string;
  placeholder: string;
  noMatch: string;
  clearLabel: string;
  required?: boolean;
  fieldClass: string;
  labelClass: string;
}) {
  const initial = options.find((option) => option.code === defaultValue) ?? null;

  const [chosen, setChosen] = useState<CountryOption | null>(initial);
  const [query, setQuery] = useState(initial?.name ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const listId = useId();
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  // An empty box, or a box still showing the chosen country, lists everything:
  // somebody who opens it to change their mind wants the whole list, not the
  // one country they already picked.
  const matches = useMemo(() => {
    const needle = fold(query.trim());
    if (!needle || (chosen && query === chosen.name)) return options;

    const starts: CountryOption[] = [];
    const contains: CountryOption[] = [];

    for (const option of options) {
      const folded = fold(option.name);
      if (folded.startsWith(needle) || option.code.toLowerCase() === needle) starts.push(option);
      else if (folded.includes(needle)) contains.push(option);
    }

    return [...starts, ...contains];
  }, [options, query, chosen]);

  useEffect(() => setActive(0), [query]);

  // Clicking anywhere else is a decision to stop choosing, so the box goes back
  // to whatever was actually selected rather than keeping half a word in it.
  useEffect(() => {
    if (!open) return;

    const away = (event: MouseEvent) => {
      if (box.current && !box.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery(chosen?.name ?? "");
      }
    };

    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, [open, chosen]);

  const choose = (option: CountryOption) => {
    setChosen(option);
    setQuery(option.name);
    setOpen(false);
  };

  const keys = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) return setOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current) => (current + step + matches.length) % Math.max(1, matches.length));
      return;
    }

    if (event.key === "Enter" && open) {
      // Only swallowed when there is something to pick, so Enter on an empty
      // list still submits the form the way a keyboard user expects.
      const option = matches[active];
      if (!option) return;
      event.preventDefault();
      choose(option);
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      setQuery(chosen?.name ?? "");
    }
  };

  return (
    <div className="block space-y-2" ref={box}>
      <label className={labelClass} htmlFor={`${listId}-input`}>
        {label}
      </label>

      <input type="hidden" name={name} value={chosen?.code ?? ""} />

      <div className="relative">
        <input
          id={`${listId}-input`}
          ref={input}
          type="text"
          autoComplete="country-name"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && matches[active] ? `${listId}-${matches[active].code}` : undefined}
          value={query}
          placeholder={placeholder}
          required={required && !chosen}
          onChange={(event) => {
            setQuery(event.target.value);
            setChosen(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={keys}
          className={fieldClass}
        />

        {chosen && (
          <button
            type="button"
            aria-label={clearLabel}
            onClick={() => {
              setChosen(null);
              setQuery("");
              setOpen(true);
              input.current?.focus();
            }}
            className="text-brand-800/40 hover:text-brand-800 absolute inset-y-0 right-3 flex items-center text-[18px] leading-none"
          >
            &times;
          </button>
        )}

        {open && (
          <ul
            id={listId}
            role="listbox"
            className="border-brand-900/15 absolute z-20 mt-1.5 max-h-60 w-full overflow-y-auto rounded-xl border bg-white py-1 shadow-lg"
          >
            {matches.length === 0 && (
              <li className="text-brand-800/50 px-4 py-2.5 text-[13px]">{noMatch}</li>
            )}

            {matches.map((option, index) => (
              <li key={option.code}>
                <button
                  id={`${listId}-${option.code}`}
                  type="button"
                  role="option"
                  aria-selected={chosen?.code === option.code}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(option)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[13.5px] ${
                    index === active ? "bg-brand-800/8 text-brand-900" : "text-brand-900/80"
                  }`}
                >
                  <span className="min-w-0 truncate">{option.name}</span>
                  <span className="text-brand-800/35 shrink-0 text-[11px] font-semibold tabular-nums">
                    {option.code}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
