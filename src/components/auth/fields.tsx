"use client";

import { useId, useState } from "react";

import { GoogleMark } from "@/components/ui/BrandMarks";

export const fieldClass =
  "h-12 w-full rounded-xl border border-brand-900/15 bg-white px-4 text-[14px] text-brand-900 outline-none transition-[border-color,box-shadow] placeholder:text-brand-800/35 focus:border-brand-800 focus:ring-[3px] focus:ring-brand-800/10";

export const labelClass =
  "block text-[10.5px] font-bold tracking-[0.16em] text-brand-600 uppercase";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: (id: string) => React.ReactNode;
}) {
  const id = useId();

  return (
    <div className="space-y-2">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children(id)}
      {hint && <p className="text-brand-800/50 text-[12px]">{hint}</p>}
    </div>
  );
}

/** A password box with a reveal. */
export function PasswordField({
  label,
  name,
  hint,
  autoComplete,
  showLabel,
  hideLabel,
  placeholder,
}: {
  label: string;
  name: string;
  hint?: string;
  autoComplete: string;
  showLabel: string;
  hideLabel: string;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <Field label={label} hint={hint}>
      {(id) => (
        <div className="relative">
          <input
            id={id}
            name={name}
            type={visible ? "text" : "password"}
            autoComplete={autoComplete}
            placeholder={placeholder}
            className={`${fieldClass} pr-16`}
          />
          <button
            type="button"
            onClick={() => setVisible((on) => !on)}
            className="text-brand-700 hover:text-brand-900 absolute top-1/2 right-3 -translate-y-1/2 text-[11px] font-bold tracking-[0.12em] uppercase transition-colors"
          >
            {visible ? hideLabel : showLabel}
          </button>
        </div>
      )}
    </Field>
  );
}

export function PrimaryButton({
  children,
  pending,
}: {
  children: React.ReactNode;
  pending?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-brand-800 text-cream-100 hover:bg-brand-900 h-12 w-full rounded-full text-[11px] font-bold tracking-[0.14em] uppercase transition-colors duration-300 disabled:pointer-events-none disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/**
 * Google, above the email form rather than below it.
 *
 * Only providers that are actually enabled in Supabase belong here.
 * signInWithOAuth sends the browser to Supabase before any error can come
 * back, so a provider that is not switched on does not fail inside the modal:
 * it drops the visitor onto a raw JSON error page on supabase.co.
 *
 * Facebook is written and commented out below rather than deleted. It needs
 * App Review and Business Verification before it can be turned on, and this is
 * the whole of what changes when it is.
 */
export function SocialButtons({
  google,
  divider,
  onProvider,
  disabled,
}: {
  google: string;
  /** Kept for when the Facebook button comes back. */
  facebook: string;
  divider: string;
  onProvider: (provider: "google" | "facebook") => void;
  disabled?: boolean;
}) {
  const button =
    "flex h-12 flex-1 items-center justify-center gap-2.5 rounded-full border border-brand-900/15 bg-white text-[12.5px] font-semibold text-brand-900 transition-colors hover:border-brand-900/30 hover:bg-brand-50 disabled:pointer-events-none disabled:opacity-50";

  return (
    <>
      <div className="flex gap-3">
        <button
          type="button"
          className={button}
          disabled={disabled}
          onClick={() => onProvider("google")}
        >
          <GoogleMark className="size-[18px]" />
          {google}
        </button>

        {/*
          Facebook. To bring it back once Meta has approved the app, restore
          FacebookMark to the import at the top of this file and uncomment:

          <button
            type="button"
            className={button}
            disabled={disabled}
            onClick={() => onProvider("facebook")}
          >
            <FacebookMark className="size-[18px]" />
            {facebook}
          </button>
        */}
      </div>

      <div className="flex items-center gap-4">
        <span aria-hidden className="bg-brand-900/12 h-px flex-1" />
        <span className="text-brand-800/40 text-[10.5px] font-bold tracking-[0.16em] uppercase">
          {divider}
        </span>
        <span aria-hidden className="bg-brand-900/12 h-px flex-1" />
      </div>
    </>
  );
}
