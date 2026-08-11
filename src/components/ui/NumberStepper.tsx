"use client";

import { useId, useState } from "react";

type NumberStepperProps = {
  name: string;
  label: string;
  hint?: string;
  min?: number;
  max?: number;
  defaultValue?: number;
  decreaseLabel: string;
  increaseLabel: string;
};

/**
 * Increment and decrement control.
 *
 * The count is a real focusable input rather than a plain span, so it can be
 * typed into and read by assistive tech, with `role="spinbutton"` semantics
 * coming from the native number type. The buttons disable at the bounds
 * instead of silently refusing, so the limit is visible.
 */
export function NumberStepper({
  name,
  label,
  hint,
  min = 0,
  max = 20,
  defaultValue = 0,
  decreaseLabel,
  increaseLabel,
}: NumberStepperProps) {
  const [value, setValue] = useState(defaultValue);
  const id = useId();

  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  const button =
    "flex size-10 shrink-0 items-center justify-center rounded-full border border-brand-900/15 text-brand-800 transition-colors hover:border-brand-800 hover:bg-brand-800 hover:text-cream-100 disabled:pointer-events-none disabled:opacity-30";

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[10.5px] font-bold tracking-[0.16em] text-brand-600 uppercase"
      >
        {label}
      </label>
      {hint && <p className="mt-1 text-[12px] text-brand-800/45">{hint}</p>}

      <div className="mt-2.5 flex h-12 items-center justify-between rounded-xl border border-brand-900/15 bg-white px-2 transition-[border-color,box-shadow] focus-within:border-brand-800 focus-within:ring-[3px] focus-within:ring-brand-800/10">
        <button
          type="button"
          onClick={() => setValue((current) => clamp(current - 1))}
          disabled={value <= min}
          aria-label={decreaseLabel}
          className={button}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden className="stroke-current">
            <path d="M3 8h10" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>

        <input
          id={id}
          name={name}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          onChange={(event) => setValue(clamp(Number(event.target.value) || min))}
          className="w-full min-w-0 [appearance:textfield] bg-transparent text-center text-[15px] font-semibold text-brand-900 outline-none tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />

        <button
          type="button"
          onClick={() => setValue((current) => clamp(current + 1))}
          disabled={value >= max}
          aria-label={increaseLabel}
          className={button}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden className="stroke-current">
            <path d="M8 3v10M3 8h10" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
