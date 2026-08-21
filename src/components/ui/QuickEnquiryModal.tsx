"use client";

import { useLocale } from "next-intl";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Close } from "@/components/ui/icons";
import { PhoneField } from "@/components/ui/PhoneField";
import { cn } from "@/lib/cn";
import { submitQuickEnquiry } from "@/lib/enquiries";

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
  countryLabel: string;
  searchLabel: string;
};

type Phase = "closed" | "open" | "closing";

/** Quick enquiry dialog. */
export function QuickEnquiryModal({
  labels,
  className,
  children,
}: {
  labels: Labels;
  className?: string;
  children?: ReactNode;
}) {
  const locale = useLocale();
  const [phase, setPhase] = useState<Phase>("closed");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    const form = event.currentTarget;
    const data = new FormData(form);

    setPending(true);
    setError(null);

    const result = await submitQuickEnquiry({
      source: "Quick enquiry",
      locale,
      fullName: String(data.get("fullName") ?? ""),
      email: String(data.get("email") ?? ""),
      // The dial code is a separate control, so the two halves are joined here rather than stored apart.
      phone: [data.get("dialCode"), data.get("phone")].filter(Boolean).join(" ").trim(),
      message: String(data.get("message") ?? ""),
    });

    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSent(true);
  }

  const field =
    "h-12 w-full rounded-xl border border-brand-900/15 bg-white px-4 text-[14px] text-brand-900 outline-none transition-[border-color,box-shadow] placeholder:text-brand-800/35 focus:border-brand-800 focus:ring-[3px] focus:ring-brand-800/10";
  const label = "block text-[10.5px] font-bold tracking-[0.16em] text-brand-600 uppercase";

  const overlay =
    phase === "closed" ? null : (
      <div className="fixed inset-0 z-9999 flex items-end justify-center p-0 sm:items-center sm:p-6">
        <div
          onClick={() => setPhase("closing")}
          className={cn(
            "bg-brand-950/60 absolute inset-0 backdrop-blur-md",
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
            "bg-paper relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[28px] p-6 sm:rounded-[28px] sm:p-8",
            isOpen ? "animate-modal-in" : "animate-modal-out",
          )}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={() => setPhase("closing")}
            aria-label={labels.close}
            className="bg-brand-900/6 text-brand-800 hover:bg-brand-900/12 absolute top-5 right-5 flex size-9 items-center justify-center rounded-full transition-colors"
          >
            <Close />
          </button>

          {sent ? (
            <div className="py-10 text-center">
              <h2
                id={`${formId}-title`}
                className="font-display text-brand-900 text-[22px] font-extrabold tracking-[-0.02em]"
              >
                {labels.successTitle}
              </h2>
              <p className="text-brand-800/60 mx-auto mt-3 max-w-xs text-[14px] leading-relaxed">
                {labels.successBody}
              </p>
            </div>
          ) : (
            <>
              <h2
                id={`${formId}-title`}
                className="font-display text-brand-900 pr-10 text-[22px] leading-tight font-extrabold tracking-[-0.025em] sm:text-[25px]"
              >
                {labels.title}
              </h2>
              <p className="text-brand-800/55 mt-2 text-[13.5px] leading-relaxed">
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

                <div className="space-y-4">
                  <div>
                    <label htmlFor={`${formId}-phone`} className={label}>
                      {labels.phone}
                    </label>
                    <div className="mt-2">
                      <PhoneField
                        id={`${formId}-phone`}
                        name="phone"
                        required
                        countryLabel={labels.countryLabel}
                        searchLabel={labels.searchLabel}
                      />
                    </div>
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
                    className="border-brand-900/15 text-brand-900 placeholder:text-brand-800/35 focus:border-brand-800 focus:ring-brand-800/10 mt-2 w-full resize-none rounded-xl border bg-white p-4 text-[14px] leading-relaxed transition-[border-color,box-shadow] outline-none focus:ring-[3px]"
                  />
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-600/25 bg-red-600/8 px-4 py-3 text-[13px] leading-snug text-red-800"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="bg-brand-800 text-cream-100 hover:bg-brand-900 flex h-13 w-full items-center justify-center rounded-full text-[11.5px] font-bold tracking-[0.13em] uppercase transition-colors disabled:opacity-60"
                >
                  {pending ? labels.sending : labels.submit}
                </button>

                <p className="text-brand-800/40 text-center text-[11px]">{labels.required}</p>
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
