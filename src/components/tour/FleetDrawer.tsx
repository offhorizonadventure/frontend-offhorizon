"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Close } from "@/components/ui/icons";

export type FleetCard = {
  id: string;
  name: string;
  url: string | null;
  alt: string;
  seats: string | null;
  notes: string | null;
  perDay: string | null;
  total: string | null;
};

type Phase = "closed" | "open" | "closing";

export function FleetDrawer({
  label,
  title,
  cars,
  perDayLabel,
}: {
  label: string;
  title: string;
  cars: FleetCard[];
  perDayLabel: string;
}) {
  const [phase, setPhase] = useState<Phase>("closed");
  const closeRef = useRef<HTMLButtonElement>(null);

  const isOpen = phase === "open";

  useEffect(() => {
    if (!isOpen) return;

    const { style } = document.body;
    const previous = style.overflow;
    style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPhase("closing");
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setPhase("open")}
        className="border-brand-900/20 text-brand-800 hover:border-brand-800 hover:bg-brand-800 hover:text-cream-100 inline-flex h-12 items-center rounded-full border px-7 text-[11px] font-bold tracking-[0.12em] uppercase transition-colors duration-300"
      >
        {label}
      </button>

      {phase !== "closed" &&
        createPortal(
          <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={title}>
            <button
              type="button"
              aria-hidden
              tabIndex={-1}
              onClick={() => setPhase("closing")}
              className={`bg-brand-950/45 absolute inset-0 ${
                phase === "closing" ? "animate-fade-out" : "animate-fade-in"
              }`}
            />

            <div
              onAnimationEnd={() => phase === "closing" && setPhase("closed")}
              className={`bg-cream-50 absolute inset-y-0 right-0 flex w-full max-w-lg flex-col shadow-2xl ${
                phase === "closing" ? "animate-drawer-out" : "animate-drawer-in"
              }`}
            >
              <div className="border-brand-900/10 flex items-center justify-between gap-4 border-b px-5 py-4 sm:px-7">
                <h2 className="font-display text-brand-900 text-[17px] font-bold tracking-[-0.02em]">
                  {title}
                </h2>

                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setPhase("closing")}
                  aria-label="Close"
                  className="text-brand-800/60 hover:text-brand-900 hover:bg-brand-900/5 flex size-9 items-center justify-center rounded-full transition-colors"
                >
                  <Close />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
                <ul className="space-y-6">
                  {cars.map((car) => (
                    <li key={car.id} className="ring-brand-900/10 rounded-[20px] bg-white ring-1">
                      {car.url && (
                        <div className="bg-brand-100 relative aspect-[4/3] overflow-hidden rounded-t-[20px]">
                          <Image
                            src={car.url}
                            alt={car.alt}
                            fill
                            sizes="(max-width: 639px) 92vw, 420px"
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div className="p-5">
                        <div className="flex flex-wrap items-baseline justify-between gap-3">
                          <h3 className="font-display text-brand-900 text-[16px] font-bold tracking-[-0.02em]">
                            {car.name}
                          </h3>
                          {car.perDay && (
                            <p className="text-brand-900 text-[15px] font-extrabold tabular-nums">
                              {car.perDay}
                              <span className="text-brand-800/55 ml-1 text-[12px] font-normal">
                                {perDayLabel}
                              </span>
                            </p>
                          )}
                        </div>

                        {car.seats && (
                          <p className="text-brand-800/55 mt-1 text-[12.5px]">{car.seats}</p>
                        )}

                        {car.notes && (
                          <p className="text-brand-800/65 mt-3 text-[13.5px] leading-[1.7]">
                            {car.notes}
                          </p>
                        )}

                        {car.total && (
                          <p className="border-brand-900/10 text-brand-800/45 mt-4 border-t pt-3 text-[12.5px]">
                            {car.total}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
