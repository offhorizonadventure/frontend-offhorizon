"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { BookingWizard, type BookingProps } from "@/components/tour/BookingWizard";
import { ChevronDown, Close } from "@/components/ui/icons";

type Phase = "closed" | "open" | "closing";

/**
 * Departure dates in a slide-over.
 *
 * Portalled to <body> for the same reason the nav drawer is: an ancestor with
 * `backdrop-filter` becomes the containing block for fixed descendants, so an
 * overlay rendered in place would size itself to that ancestor rather than the
 * viewport. It is only in the DOM while open, and the exit keyframe unmounts it
 * on `animationend`.
 *
 * Holds the booking wizard, which is why it is a slide-over rather than a
 * disclosure in the card: the steps need room and a scroll of their own.
 */
export function DatesDrawer({
  label,
  title,
  booking,
}: {
  label: string;
  title: string;
  booking: BookingProps;
}) {
  const [phase, setPhase] = useState<Phase>("closed");
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isOpen = phase === "open";

  useEffect(() => {
    if (!isOpen) return;

    const { style } = document.body;
    const previousOverflow = style.overflow;
    style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPhase("closing");
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setPhase("open")}
        className="group flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-brand-800 text-[11px] font-bold tracking-[0.12em] text-cream-100 uppercase transition-colors duration-300 hover:bg-brand-900"
      >
        {label}
        <ChevronDown className="-rotate-90" />
      </button>

      {phase !== "closed" &&
        createPortal(
          <div
            className="fixed inset-0 z-100"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onAnimationEnd={() => {
              if (phase === "closing") {
                setPhase("closed");
                triggerRef.current?.focus();
              }
            }}
          >
            <button
              type="button"
              aria-label={title}
              onClick={() => setPhase("closing")}
              className={`absolute inset-0 cursor-default bg-brand-950/60 backdrop-blur-sm ${
                phase === "closing" ? "animate-fade-out" : "animate-fade-in"
              }`}
            />

            <aside
              className={`absolute inset-y-0 right-0 flex w-full max-w-[26rem] flex-col bg-cream-50 shadow-2xl ${
                phase === "closing" ? "animate-drawer-out" : "animate-drawer-in"
              }`}
            >
              <header className="flex items-center justify-between gap-4 border-b border-brand-900/12 px-6 py-5">
                <h2 className="font-display text-[17px] leading-none font-bold tracking-[-0.02em] text-brand-900">
                  {title}
                </h2>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setPhase("closing")}
                  className="flex size-10 items-center justify-center rounded-full text-brand-800 ring-1 ring-brand-900/15 transition-colors duration-300 hover:bg-brand-900/6"
                >
                  <Close />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto px-6 py-6">
                <BookingWizard {...booking} />
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </>
  );
}
