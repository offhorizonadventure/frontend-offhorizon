"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { BookingWizard, type BookingProps } from "@/components/tour/BookingWizard";
import { ChevronDown, Close } from "@/components/ui/icons";

type Phase = "closed" | "open" | "closing";

/** Departure dates in a slide-over. */
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
        className="group bg-brand-800 text-cream-100 hover:bg-brand-900 flex h-12 w-full items-center justify-center gap-2.5 rounded-full text-[11px] font-bold tracking-[0.12em] uppercase transition-colors duration-300"
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
              className={`bg-brand-950/60 absolute inset-0 cursor-default backdrop-blur-sm ${
                phase === "closing" ? "animate-fade-out" : "animate-fade-in"
              }`}
            />

            <aside
              className={`bg-cream-50 absolute inset-y-0 right-0 flex w-full max-w-[26rem] flex-col shadow-2xl ${
                phase === "closing" ? "animate-drawer-out" : "animate-drawer-in"
              }`}
            >
              <header className="border-brand-900/12 flex items-center justify-between gap-4 border-b px-6 py-5">
                <h2 className="font-display text-brand-900 text-[17px] leading-none font-bold tracking-[-0.02em]">
                  {title}
                </h2>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setPhase("closing")}
                  className="text-brand-800 ring-brand-900/15 hover:bg-brand-900/6 flex size-10 items-center justify-center rounded-full ring-1 transition-colors duration-300"
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
