"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { ChevronDown } from "@/components/ui/icons";

/**
 * Scroll container for the itinerary.
 *
 * The cards themselves are server rendered and passed in as children, so the
 * whole itinerary is in the HTML; this only owns the scrolling and the two
 * arrows. Arrows disable at the ends rather than wrapping, because a day by
 * day list has a real beginning and end.
 */
export function ProgramRail({
  children,
  previousLabel,
  nextLabel,
}: {
  children: ReactNode;
  previousLabel: string;
  nextLabel: string;
}) {
  const rail = useRef<HTMLOListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const node = rail.current;
    if (!node) return;

    const update = () => {
      // A pixel of slack: fractional scroll widths never land exactly.
      setAtStart(node.scrollLeft <= 1);
      setAtEnd(node.scrollLeft + node.clientWidth >= node.scrollWidth - 1);
    };

    update();
    node.addEventListener("scroll", update, { passive: true });

    const observer = new ResizeObserver(update);
    observer.observe(node);

    return () => {
      node.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  const step = (direction: 1 | -1) => {
    const node = rail.current;
    if (!node) return;
    const card = node.querySelector("li");
    const gap = parseFloat(getComputedStyle(node).columnGap || "16") || 16;
    const distance = (card?.getBoundingClientRect().width ?? node.clientWidth * 0.8) + gap;
    node.scrollBy({ left: distance * direction, behavior: "smooth" });
  };

  const arrow =
    "flex size-11 items-center justify-center rounded-full ring-1 ring-cream-100/25 text-cream-100 transition-colors duration-300 enabled:hover:bg-cream-100/10 disabled:opacity-30";

  return (
    <>
      <ol ref={rail} className="program-rail mt-10">
        {children}
      </ol>

      <div className="mx-auto mt-8 flex max-w-6xl justify-end gap-3 px-5 sm:px-8">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={atStart}
          aria-label={previousLabel}
          className={arrow}
        >
          <ChevronDown className="rotate-90" />
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={atEnd}
          aria-label={nextLabel}
          className={arrow}
        >
          <ChevronDown className="-rotate-90" />
        </button>
      </div>
    </>
  );
}
