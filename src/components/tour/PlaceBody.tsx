"use client";

import { useState } from "react";

import { parseRich, richToText, RichText, truncateRich } from "@/lib/rich-text";

export function PlaceBody({
  text,
  more,
  less,
  limit = 80,
}: {
  text: string;
  more: string;
  less: string;
  limit?: number;
}) {
  const [open, setOpen] = useState(false);

  const nodes = parseRich(text);
  const words = richToText(nodes).trim().split(/\s+/).filter(Boolean);
  const long = words.length > limit + 20;

  // Cut around the formatting rather than through it, so a shortened
  // description never ends halfway inside a link.
  const shown = !long || open ? nodes : truncateRich(nodes, limit).nodes;

  return (
    <>
      <p className="text-brand-800/65 mt-7 text-[15px] leading-[1.85] text-pretty sm:text-[16.5px]">
        <RichText nodes={shown} />
        {long && !open ? "…" : null}
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
