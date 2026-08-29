"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { ChevronDown, Close } from "@/components/ui/icons";
import { usePathname } from "@/i18n/navigation";

export function DestinationsMenu({
  label,
  closeLabel,
  children,
}: {
  label: string;
  closeLabel: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(96);
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const { style } = document.body;
    const previous = style.overflow;
    style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    const desktop = window.matchMedia("(min-width: 64rem)");
    const onChange = () => {
      if (!desktop.matches) setOpen(false);
    };
    onChange();
    desktop.addEventListener("change", onChange);

    return () => {
      style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onChange);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          const bar = document.querySelector("header > div");
          if (bar) setTop(Math.round(bar.getBoundingClientRect().bottom) + 12);
          setOpen((value) => !value);
        }}
        aria-expanded={open}
        className="nav-link text-brand-900/75 hover:text-brand-800 relative flex h-8 cursor-pointer items-center gap-1 text-[11px] font-semibold tracking-[0.08em] whitespace-nowrap uppercase transition-colors duration-200"
      >
        {label}
        <ChevronDown
          className={`mt-px transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {}
      {open &&
        createPortal(
          <div className="fixed inset-0 top-0 z-40 hidden lg:block">
            <button
              type="button"
              aria-label={closeLabel}
              onClick={() => setOpen(false)}
              className="bg-brand-950/45 absolute inset-0 cursor-default backdrop-blur-sm"
            />

            <div
              style={{ paddingTop: top }}
              className="absolute inset-x-0 top-0 flex justify-center px-3 sm:px-6"
            >
              <div
                style={{ maxHeight: `calc(100dvh - ${top + 24}px)` }}
                className="animate-panel-in bg-paper border-brand-900/8 relative w-full max-w-6xl overflow-y-auto rounded-[28px] border p-7 shadow-[0_30px_70px_-30px_rgba(31,12,4,0.45)] sm:p-9"
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={closeLabel}
                  className="bg-brand-900/6 text-brand-800 hover:bg-brand-900/12 absolute top-6 right-6 flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors"
                >
                  <Close />
                </button>

                {children}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
