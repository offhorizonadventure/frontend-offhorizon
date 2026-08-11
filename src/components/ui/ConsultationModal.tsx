"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Close } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

type Labels = {
  trigger: string;
  title: string;
  subtitle: string;
  fullName: string;
  phone: string;
  email: string;
  message: string;
  messagePlaceholder: string;
  submit: string;
  sending: string;
  successTitle: string;
  successBody: string;
  close: string;
  required: string;
};

type Phase = "closed" | "open" | "closing";

/**
 * Consultation request dialog.
 *
 * Portalled to <body> for the same reason the nav drawer is: an ancestor with
 * `backdrop-filter` would otherwise become the containing block for a fixed
 * overlay and shrink it to that ancestor's box.
 *
 * Mounted only while open, so nothing is reachable by tab or scroll when it is
 * shut, and enter/exit run as keyframes with unmount on `animationend`.
 */
export function ConsultationModal({
  labels,
  className,
  children,
}: {
  labels: Labels;
  className?: string;
  children?: ReactNode;
}) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const formId = useId();

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    // TODO: post to the real enquiry endpoint. Nothing is sent yet; this only
    // shows the confirmation state so the flow can be reviewed.
    await new Promise((resolve) => setTimeout(resolve, 600));

    setPending(false);
    setSent(true);
  }

  const field =
    "h-12 w-full rounded-xl border border-brand-900/15 bg-white px-4 text-[14px] text-brand-900 outline-none transition-colors placeholder:text-brand-800/35 focus:border-brand-800";
  const label = "block text-[10.5px] font-bold tracking-[0.16em] text-brand-600 uppercase";

  const overlay =
    phase === "closed" ? null : (
      <div className="fixed inset-0 z-9999 flex items-end justify-center p-0 sm:items-center sm:p-6">
        <div
          onClick={() => setPhase("closing")}
          className={cn(
            "absolute inset-0 bg-brand-950/60 backdrop-blur-md",
            isOpen ? "animate-fade-in" : "animate-fade-out",
          )}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${formId}-title`}
          onAnimationEnd={() => {
            if (phase === "closing") {
              setPhase("closed");
              triggerRef.current?.focus();
            }
          }}
          className={cn(
            "relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[28px] bg-paper p-6 sm:rounded-[28px] sm:p-8",
            isOpen ? "animate-modal-in" : "animate-modal-out",
          )}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={() => setPhase("closing")}
            aria-label={labels.close}
            className="absolute top-5 right-5 flex size-9 items-center justify-center rounded-full bg-brand-900/6 text-brand-800 transition-colors hover:bg-brand-900/12"
          >
            <Close />
          </button>

          {sent ? (
            <div className="py-10 text-center">
              <h2
                id={`${formId}-title`}
                className="font-display text-[22px] font-extrabold tracking-[-0.02em] text-brand-900"
              >
                {labels.successTitle}
              </h2>
              <p className="mx-auto mt-3 max-w-xs text-[14px] leading-relaxed text-brand-800/60">
                {labels.successBody}
              </p>
            </div>
          ) : (
            <>
              <h2
                id={`${formId}-title`}
                className="font-display pr-10 text-[22px] leading-tight font-extrabold tracking-[-0.025em] text-brand-900 sm:text-[25px]"
              >
                {labels.title}
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-brand-800/55">
                {labels.subtitle}
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate={false}>
                <div>
                  <label htmlFor={`${formId}-name`} className={label}>
                    {labels.fullName}
                  </label>
                  <input
                    id={`${formId}-name`}
                    name="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    className={`${field} mt-2`}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`${formId}-phone`} className={label}>
                      {labels.phone}
                    </label>
                    <input
                      id={`${formId}-phone`}
                      name="phone"
                      type="tel"
                      required
                      inputMode="tel"
                      autoComplete="tel"
                      className={`${field} mt-2`}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${formId}-email`} className={label}>
                      {labels.email}
                    </label>
                    <input
                      id={`${formId}-email`}
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className={`${field} mt-2`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={`${formId}-message`} className={label}>
                    {labels.message}
                  </label>
                  <textarea
                    id={`${formId}-message`}
                    name="message"
                    rows={4}
                    placeholder={labels.messagePlaceholder}
                    className="mt-2 w-full resize-none rounded-xl border border-brand-900/15 bg-white p-4 text-[14px] leading-relaxed text-brand-900 outline-none transition-colors placeholder:text-brand-800/35 focus:border-brand-800"
                  />
                </div>

                <button
                  type="submit"
                  disabled={pending}
                  className="flex h-13 w-full items-center justify-center rounded-full bg-brand-800 text-[11.5px] font-bold tracking-[0.13em] text-cream-100 uppercase transition-colors hover:bg-brand-900 disabled:opacity-60"
                >
                  {pending ? labels.sending : labels.submit}
                </button>

                <p className="text-center text-[11px] text-brand-800/40">{labels.required}</p>
              </form>
            </>
          )}
        </div>
      </div>
    );

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setPhase("open")} className={className}>
        {children ?? labels.trigger}
      </button>

      {/* Safe on the server: `phase` starts closed, so this only runs after a click. */}
      {overlay ? createPortal(overlay, document.body) : null}
    </>
  );
}
