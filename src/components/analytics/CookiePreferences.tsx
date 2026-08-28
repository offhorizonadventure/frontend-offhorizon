"use client";

/**
 * Reopens the consent banner.
 *
 * Consent has to be as easy to take back as it was to give, so this sits in the
 * footer and in the privacy notice. Termly binds it by class name: any element
 * carrying `termly-display-preferences` opens the preference centre, which is
 * why the class is here rather than an onClick of our own.
 *
 * Rendered whether or not the banner is configured. Without it the click does
 * nothing, and a dead control is worse than none, so the id is checked first.
 */
const CONFIGURED = Boolean(process.env.NEXT_PUBLIC_TERMLY_ID);

export function CookiePreferences({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  if (!CONFIGURED) return null;

  return (
    <button
      type="button"
      className={`termly-display-preferences cursor-pointer ${className}`}
      aria-haspopup="dialog"
    >
      {label}
    </button>
  );
}
