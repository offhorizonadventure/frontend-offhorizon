"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Close } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export type Phase = "closed" | "open" | "closing";

export function AuthShell({
  phase,
  onPhaseChange,
  titleId,
  eyebrow,
  title,
  lead,
  closeLabel,
  footer,
  children,
}: {
  phase: Phase;
  onPhaseChange: (next: Phase) => void;
  titleId: string;
  eyebrow: string;
  title: string;
  lead: string;
  closeLabel: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const isOpen = phase === "open";
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const { style } = document.body;
    const previous = style.overflow;
    style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onPhaseChange("closing");
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onPhaseChange]);

  if (phase === "closed" || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        onClick={() => onPhaseChange("closing")}
        className={cn(
          "bg-brand-950/60 absolute inset-0 backdrop-blur-md",
          isOpen ? "animate-fade-in" : "animate-fade-out",
        )}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onAnimationEnd={() => {
          if (phase === "closing") onPhaseChange("closed");
        }}
        className={cn(
          "bg-paper relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] p-6 sm:rounded-[28px] sm:p-8",
          isOpen ? "animate-modal-in" : "animate-modal-out",
        )}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={() => onPhaseChange("closing")}
          aria-label={closeLabel}
          className="text-brand-800/50 hover:bg-brand-900/6 hover:text-brand-900 absolute top-5 right-5 grid size-9 place-items-center rounded-full transition-colors"
        >
          <Close />
        </button>

        <span className="text-ember-600 flex items-center gap-2.5 text-[10px] font-bold tracking-[0.2em] uppercase">
          <span aria-hidden className="bg-ember-500/60 h-px w-6" />
          {eyebrow}
        </span>

        <h2
          id={titleId}
          className="font-display text-brand-900 mt-4 text-[clamp(1.4rem,3.4vw,1.8rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance"
        >
          {title}
        </h2>

        <p className="text-brand-800/60 mt-3 text-[13.5px] leading-[1.7] text-pretty">{lead}</p>

        <div className="mt-7">{children}</div>

        {footer && (
          <div className="border-brand-900/10 text-brand-800/60 mt-7 border-t pt-5 text-center text-[13px]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
