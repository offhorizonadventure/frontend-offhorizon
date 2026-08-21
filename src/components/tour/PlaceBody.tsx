"use client";

import { useState } from "react";

/** A long description, shortened until asked. */
export function PlaceBody({
  text,
  more,
  less,
  limit = 80,
}: {
  text: string;
  more: string;
  less: string;
  /** Words shown before the toggle appears. */
  limit?: number;
}) {
  const [open, setOpen] = useState(false);

  const words = text.trim().split(/\s+/);
  // Twenty words of slack: below that the toggle hides less than it costs.
  const long = words.length > limit + 20;

  const shown = !long || open ? text : `${words.slice(0, limit).join(" ")}…`;

  return (
    <>
      <p className="text-brand-800/65 mt-7 text-[15px] leading-[1.85] text-pretty sm:text-[16.5px]">
        {shown}
      </p>

      {long && (
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          className="group text-brand-800 hover:text-brand-900 mt-4 inline-flex items-center gap-2.5 text-[10.5px] font-bold tracking-[0.14em] uppercase transition-colors"
        >
          {open ? less : more}
          <span
            aria-hidden
            className="bg-brand-800 ease-out-expo h-px w-8 transition-all duration-500 group-hover:w-14"
          />
        </button>
      )}
    </>
  );
}
