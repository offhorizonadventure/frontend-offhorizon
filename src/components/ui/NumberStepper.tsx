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
  /** Supply with `onValueChange` to drive the control from the parent. */
  value?: number;
  onValueChange?: (value: number) => void;
  decreaseLabel: string;
  increaseLabel: string;
  /** Sits beside the heading, so the row is recognisable before it is read. */
  icon?: ReactNode;
};

/** Increment and decrement control. */
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

  // Controlled when the parent passes a value, uncontrolled otherwise.
  const value = controlled ?? uncontrolled;
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  // Two clicks in one tick read the same prop, so steps count against a mirror.
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
      {/*
        The heading carried the weight of a caption and was the quietest thing
        in the row, under a control that is mostly white space. An icon and a
        larger, darker word make the question recognisable before it is read.
      */}
      <label htmlFor={id} className="text-brand-900 flex items-center gap-2 text-[14px] font-bold">
        {icon}
        {label}
      </label>
      {hint && <p className="text-brand-800/60 mt-1 text-[12.5px]">{hint}</p>}

      <div className="border-brand-900/15 focus-within:border-brand-800 focus-within:ring-brand-800/10 mt-2.5 flex h-13 items-center justify-between rounded-xl border bg-white px-2 transition-[border-color,box-shadow] focus-within:ring-[3px]">
        <button type="button" onClick={() => step(-1)} disabled={value <= min} className={button}>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden className="stroke-current">
            <path d="M3 8h10" strokeWidth="2.25" strokeLinecap="round" />
          </svg>
          {decreaseLabel}
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

        <button type="button" onClick={() => step(1)} disabled={value >= max} className={button}>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden className="stroke-current">
            <path d="M8 3v10M3 8h10" strokeWidth="2.25" strokeLinecap="round" />
          </svg>
          {increaseLabel}
        </button>
      </div>
    </div>
  );
}
