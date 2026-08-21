"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { ChevronDown } from "@/components/ui/icons";

/** Horizontal scroll container, used by the itinerary and the highlights. */
export function Rail({
  children,
  className,
  previousLabel,
  nextLabel,
  tone = "dark",
}: {
  children: ReactNode;
  /** Class on the list itself, so each caller keeps its own card sizing. */
  className: string;
  previousLabel: string;
  nextLabel: string;
  /** Arrows sit on a dark band in the itinerary and a light one in highlights. */
  tone?: "dark" | "light";
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

  const arrow = `flex size-11 items-center justify-center rounded-full ring-1 transition-colors duration-300 disabled:opacity-30 ${
    tone === "dark"
      ? "text-cream-100 ring-cream-100/25 enabled:hover:bg-cream-100/10"
      : "text-brand-800 ring-brand-900/20 enabled:hover:bg-brand-900/6"
  }`;

  return (
    <>
      <ol ref={rail} className={className}>
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
