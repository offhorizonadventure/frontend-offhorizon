"use client";

import { useId, useState } from "react";

import { ArrowRight } from "@/components/ui/icons";
import { PhoneField } from "@/components/ui/PhoneField";

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

/**
 * Enquiry form.
 *
 * Shares `PhoneField` with the consultation modal so the country picker and
 * the submitted value format stay identical across both entry points.
 */
export function ContactForm({ labels }: { labels: Labels }) {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const id = useId();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    // TODO: post to the real enquiry endpoint. Nothing is sent yet; this only
    // shows the confirmation state so the flow can be reviewed.
    await new Promise((resolve) => setTimeout(resolve, 700));

    setPending(false);
    setSent(true);
  }

  const field =
    "h-12 w-full rounded-xl border border-brand-900/15 bg-white px-4 text-[14px] text-brand-900 outline-none transition-colors placeholder:text-brand-800/35 focus:border-brand-800";
  const label = "block text-[10.5px] font-bold tracking-[0.16em] text-brand-600 uppercase";

  if (sent) {
    return (
      <div className="flex min-h-[26rem] flex-col items-center justify-center rounded-[28px] bg-paper p-10 text-center ring-1 ring-brand-900/10">
        <span className="flex size-14 items-center justify-center rounded-full bg-ember-500/15 text-ember-600">
          <ArrowRight className="size-6 -rotate-45" />
        </span>
        <h2 className="font-display mt-6 text-[24px] font-extrabold tracking-[-0.025em] text-brand-900">
          {labels.successTitle}
        </h2>
        <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-brand-800/60">
          {labels.successBody}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-[28px] bg-paper p-6 ring-1 ring-brand-900/10 sm:p-8"
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

      <div className="grid gap-5 sm:grid-cols-2">
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
          className="mt-2 w-full resize-none rounded-xl border border-brand-900/15 bg-white p-4 text-[14px] leading-relaxed text-brand-900 outline-none transition-colors placeholder:text-brand-800/35 focus:border-brand-800"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="group flex h-13 w-full items-center justify-center gap-2.5 rounded-full bg-brand-800 text-[11.5px] font-bold tracking-[0.13em] text-cream-100 uppercase transition-colors hover:bg-brand-900 disabled:opacity-60"
      >
        {pending ? labels.sending : labels.submit}
        {!pending && (
          <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
        )}
      </button>

      <p className="text-center text-[11.5px] text-brand-800/40">{labels.required}</p>
    </form>
  );
}
