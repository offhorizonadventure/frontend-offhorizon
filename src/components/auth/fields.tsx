"use client";

import { useId, useState } from "react";

import { FacebookMark, GoogleMark } from "@/components/ui/BrandMarks";

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
      {hint && <p className="text-[12px] text-brand-800/50">{hint}</p>}
    </div>
  );
}

/**
 * A password box with a reveal.
 *
 * Typing a password blind is where most sign in failures come from, and a
 * dialog that cannot show what was typed just sends people back to the reset
 * screen.
 */
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
            className="absolute top-1/2 right-3 -translate-y-1/2 text-[11px] font-bold tracking-[0.12em] text-brand-700 uppercase transition-colors hover:text-brand-900"
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
      className="h-12 w-full rounded-full bg-brand-800 text-[11px] font-bold tracking-[0.14em] text-cream-100 uppercase transition-colors duration-300 hover:bg-brand-900 disabled:pointer-events-none disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/**
 * Google and Facebook, above the email form rather than below it.
 *
 * Someone who has an account with one of these wants it in the first glance;
 * putting them under a password field asks everyone to read the long way first.
 */
export function SocialButtons({
  google,
  facebook,
  divider,
  onProvider,
  disabled,
}: {
  google: string;
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
        <button
          type="button"
          className={button}
          disabled={disabled}
          onClick={() => onProvider("facebook")}
        >
          <FacebookMark className="size-[18px]" />
          {facebook}
        </button>
      </div>

      <div className="flex items-center gap-4">
        <span aria-hidden className="h-px flex-1 bg-brand-900/12" />
        <span className="text-[10.5px] font-bold tracking-[0.16em] text-brand-800/40 uppercase">
          {divider}
        </span>
        <span aria-hidden className="h-px flex-1 bg-brand-900/12" />
      </div>
    </>
  );
}
