"use client";

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
