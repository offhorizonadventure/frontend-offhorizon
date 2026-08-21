"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Close, Menu } from "@/components/ui/icons";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

import { Logo } from "./Logo";

type MobileDrawerProps = {
  labels: { open: string; close: string; title: string };
  children: ReactNode;
};

type Phase = "closed" | "open" | "closing";

/** Right-hand slide-over menu. */
export function MobileDrawer({ labels, children }: MobileDrawerProps) {
  const [phase, setPhase] = useState<Phase>("closed");
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Navigating away should always dismiss the menu.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setPhase("closed");
  }

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

  const overlay =
    phase === "closed" ? null : (
      <div className="fixed inset-0 z-9999 flex lg:hidden">
        <div
          onClick={() => setPhase("closing")}
          className={cn(
            "bg-brand-950/55 absolute inset-0 backdrop-blur-md",
            isOpen ? "animate-fade-in" : "animate-fade-out",
          )}
        />

        <aside
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label={labels.title}
          onAnimationEnd={() => {
            if (phase === "closing") {
              setPhase("closed");
              triggerRef.current?.focus();
            }
          }}
          className={cn(
            "bg-paper relative ml-auto flex h-dvh w-[90%] max-w-[26rem] flex-col overflow-hidden",
            isOpen ? "animate-drawer-in" : "animate-drawer-out",
          )}
        >
          <div className="relative flex shrink-0 items-center justify-between px-6 py-7">
            <Logo height={36} />
            <button
              ref={closeRef}
              type="button"
              onClick={() => setPhase("closing")}
              aria-label={labels.close}
              className="bg-brand-900/6 text-brand-800 hover:bg-brand-900/12 flex size-10 shrink-0 items-center justify-center rounded-full transition-colors"
            >
              <Close />
            </button>
          </div>

          <div className="border-brand-900/10 mx-6 border-t" />

          <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-8">{children}</div>
        </aside>
      </div>
    );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setPhase("open")}
        aria-label={labels.open}
        aria-expanded={isOpen}
        aria-controls="site-menu"
        className="text-brand-800 hover:bg-cream-100 flex size-9 items-center justify-center rounded-full transition-colors lg:hidden"
      >
        <Menu />
      </button>

      {/* Safe on the server: `phase` starts closed, so this only runs after a click. */}
      {overlay ? createPortal(overlay, document.body) : null}
    </>
  );
}
