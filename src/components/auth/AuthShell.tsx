"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Close } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export type Phase = "closed" | "open" | "closing";

/**
 * The frame the four account dialogs share.
 *
 * Portalled to <body> for the same reason the enquiry modal is: an ancestor
 * with `backdrop-filter` becomes the containing block for a fixed overlay and
 * shrinks it to that ancestor's box. Mounted only while open, so nothing inside
 * is reachable by tab or scroll when it is shut.
 *
 * It owns the chrome and the behaviour. What goes inside is the only thing that
 * differs between signing in, joining, and the two password screens.
 */
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
          "absolute inset-0 bg-brand-950/60 backdrop-blur-md",
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
          "relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-paper p-6 sm:rounded-[28px] sm:p-8",
          isOpen ? "animate-modal-in" : "animate-modal-out",
        )}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={() => onPhaseChange("closing")}
          aria-label={closeLabel}
          className="absolute top-5 right-5 grid size-9 place-items-center rounded-full text-brand-800/50 transition-colors hover:bg-brand-900/6 hover:text-brand-900"
        >
          <Close />
        </button>

        <span className="flex items-center gap-2.5 text-[10px] font-bold tracking-[0.2em] text-ember-600 uppercase">
          <span aria-hidden className="h-px w-6 bg-ember-500/60" />
          {eyebrow}
        </span>

        <h2
          id={titleId}
          className="font-display mt-4 text-[clamp(1.4rem,3.4vw,1.8rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance text-brand-900"
        >
          {title}
        </h2>

        <p className="mt-3 text-[13.5px] leading-[1.7] text-pretty text-brand-800/60">{lead}</p>

        <div className="mt-7">{children}</div>

        {footer && (
          <div className="mt-7 border-t border-brand-900/10 pt-5 text-center text-[13px] text-brand-800/60">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
