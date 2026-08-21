"use client";

import { useLocale } from "next-intl";
import { useId, useState } from "react";

import { ArrowRight } from "@/components/ui/icons";
import { PhoneField } from "@/components/ui/PhoneField";
import { submitQuickEnquiry } from "@/lib/enquiries";

type Labels = {
  fullName: string;
  phone: string;
  email: string;
  message: string;
  messagePlaceholder: string;
  submit: string;
  sending: string;
  successTitle: string;
  successBody: string;
  required: string;
  countryLabel: string;
  searchLabel: string;
};

/** Enquiry form. */
export function ContactForm({ labels }: { labels: Labels }) {
  const locale = useLocale();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const id = useId();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setPending(true);
    setError(null);

    const result = await submitQuickEnquiry({
      source: "Contact form",
      locale,
      fullName: String(data.get("fullName") ?? ""),
      email: String(data.get("email") ?? ""),
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

  if (sent) {
    return (
      <div className="bg-paper ring-brand-900/10 flex min-h-[26rem] flex-col items-center justify-center rounded-[28px] p-10 text-center ring-1">
        <span className="bg-ember-500/15 text-ember-600 flex size-14 items-center justify-center rounded-full">
          <ArrowRight className="size-6 -rotate-45" />
        </span>
        <h2 className="font-display text-brand-900 mt-6 text-[24px] font-extrabold tracking-[-0.025em]">
          {labels.successTitle}
        </h2>
        <p className="text-brand-800/60 mt-3 max-w-xs text-[14px] leading-relaxed">
          {labels.successBody}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-paper ring-brand-900/10 space-y-5 rounded-[28px] p-6 ring-1 sm:p-8"
    >
      <div>
        <label htmlFor={`${id}-name`} className={label}>
          {labels.fullName}
        </label>
        <input
          id={`${id}-name`}
          name="fullName"
          type="text"
          required
          autoComplete="name"
          className={`${field} mt-2`}
        />
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor={`${id}-phone`} className={label}>
            {labels.phone}
          </label>
          <div className="mt-2">
            <PhoneField
              id={`${id}-phone`}
              name="phone"
              required
              countryLabel={labels.countryLabel}
              searchLabel={labels.searchLabel}
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${id}-email`} className={label}>
            {labels.email}
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            className={`${field} mt-2`}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${id}-message`} className={label}>
          {labels.message}
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={6}
          placeholder={labels.messagePlaceholder}
          className="border-brand-900/15 text-brand-900 placeholder:text-brand-800/35 focus:border-brand-800 focus:ring-brand-800/10 mt-2 w-full resize-none rounded-xl border bg-white p-4 text-[14px] leading-relaxed transition-[border-color,box-shadow] outline-none focus:ring-[3px]"
        />
      </div>

      {/* A failed send must not look like a successful one. */}
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
        className="group bg-brand-800 text-cream-100 hover:bg-brand-900 flex h-13 w-full items-center justify-center gap-2.5 rounded-full text-[11.5px] font-bold tracking-[0.13em] uppercase transition-colors disabled:opacity-60"
      >
        {pending ? labels.sending : labels.submit}
        {!pending && (
          <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
        )}
      </button>

      <p className="text-brand-800/40 text-center text-[11.5px]">{labels.required}</p>
    </form>
  );
}
