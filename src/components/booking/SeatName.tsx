"use client";

import { useState, useTransition } from "react";

import { setTravellerName } from "@/lib/booking/actions";

export function SeatName({
  travellerId,
  name,
  fallback,
  labels,
}: {
  travellerId: string;
  name: string | null;
  fallback: string;
  labels: { edit: string; save: string; cancel: string; placeholder: string };
}) {
  const [saved, setSaved] = useState(name ?? "");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    const next = draft.trim();
    if (next === saved) return setOpen(false);

    const previous = saved;
    setSaved(next);
    setOpen(false);
    setError(null);

    startTransition(async () => {
      const result = await setTravellerName(travellerId, next);
      if (!result.ok) {
        setSaved(previous);
        setDraft(previous);
        setError(result.error);
      }
    });
  }

  if (!open) {
    return (
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="text-brand-900 text-[13.5px] font-semibold">{saved || fallback}</span>

          <button
            type="button"
            onClick={() => {
              setDraft(saved);
              setOpen(true);
            }}
            disabled={pending}
            aria-label={labels.edit}
            title={labels.edit}
            className="text-brand-800/40 hover:text-brand-900 shrink-0 cursor-pointer transition-colors disabled:opacity-50"
          >
            <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden className="stroke-current">
              <path
                d="M11.5 2.5a1.6 1.6 0 0 1 2.3 2.3L5.6 13 2.5 13.5l.5-3.1z"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </button>
        </span>

        {error && <span className="mt-1 block text-[12px] text-red-700">{error}</span>}
      </span>
    );
  }

  return (
    <span className="flex min-w-0 flex-wrap items-center gap-2">
      <input
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") save();
          if (event.key === "Escape") setOpen(false);
        }}
        maxLength={120}
        placeholder={labels.placeholder}
        aria-label={labels.placeholder}
        className="border-brand-900/20 text-brand-900 focus:border-brand-800 h-10 w-44 rounded-full border bg-white px-4 text-[13.5px] outline-none"
      />

      <button
        type="button"
        onClick={save}
        className="bg-brand-800 text-cream-100 hover:bg-brand-900 h-10 shrink-0 cursor-pointer rounded-full px-4 text-[10.5px] font-bold tracking-[0.12em] uppercase transition-colors"
      >
        {labels.save}
      </button>

      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-brand-800/55 hover:text-brand-900 h-10 shrink-0 cursor-pointer px-1 text-[10.5px] font-bold tracking-[0.12em] uppercase transition-colors"
      >
        {labels.cancel}
      </button>
    </span>
  );
}
