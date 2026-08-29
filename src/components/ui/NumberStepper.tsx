"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";

type NumberStepperProps = {
  name: string;
  label: string;
  hint?: string;
  min?: number;
  max?: number;
  defaultValue?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  decreaseLabel: string;
  increaseLabel: string;
  icon?: ReactNode;
};

export function NumberStepper({
  name,
  label,
  hint,
  min = 0,
  max = 20,
  defaultValue = 0,
  value: controlled,
  onValueChange,
  decreaseLabel,
  increaseLabel,
  icon,
}: NumberStepperProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const id = useId();

  const value = controlled ?? uncontrolled;
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  const pending = useRef(value);
  useEffect(() => {
    pending.current = value;
  }, [value]);

  const setValue = (next: number) => {
    const clamped = clamp(next);
    pending.current = clamped;
    if (controlled === undefined) setUncontrolled(clamped);
    onValueChange?.(clamped);
  };

  const step = (delta: number) => setValue(pending.current + delta);

  const button =
    "flex size-10 shrink-0 items-center justify-center rounded-full border border-brand-900/15 text-brand-800 transition-colors hover:border-brand-800 hover:bg-brand-800 hover:text-cream-100 disabled:pointer-events-none disabled:opacity-30";

  return (
    <div>
      {}
      <label htmlFor={id} className="text-brand-900 flex items-center gap-2 text-[14px] font-bold">
        {icon}
        {label}
      </label>
      {hint && <p className="text-brand-800/60 mt-1 text-[12.5px]">{hint}</p>}

      <div className="border-brand-900/15 focus-within:border-brand-800 focus-within:ring-brand-800/10 mt-2.5 flex h-13 items-center justify-between rounded-xl border bg-white px-2 transition-[border-color,box-shadow] focus-within:ring-[3px]">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={value <= min}
          aria-label={decreaseLabel}
          className={button}
        >
          <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden className="stroke-current">
            <path d="M3 8h10" strokeWidth="2" strokeLinecap="round" />
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
          onChange={(event) => setValue(Number(event.target.value) || min)}
          className="text-brand-900 w-full min-w-0 [appearance:textfield] bg-transparent text-center text-[17px] font-bold tabular-nums outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />

        <button
          type="button"
          onClick={() => step(1)}
          disabled={value >= max}
          aria-label={increaseLabel}
          className={button}
        >
          <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden className="stroke-current">
            <path d="M8 3v10M3 8h10" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
