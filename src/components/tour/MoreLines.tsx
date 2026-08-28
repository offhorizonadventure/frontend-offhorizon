"use client";

import { useState, type ReactNode } from "react";

/**
 * Shows the first few rows of a group and hides the rest behind a link.
 *
 * A 4x4 expedition can run six cars, and six rows of them push the price and
 * the dates off the card. Two is enough to show what kind of thing is on
 * offer; the rest are one click away and stay on the card rather than opening
 * something over the top of it.
 */
export function MoreLines({
  children,
  visible,
  moreLabel,
  lessLabel,
}: {
  children: ReactNode[];
  /** How many rows to show before the link. */
  visible: number;
  moreLabel: string;
  lessLabel: string;
}) {
  const [open, setOpen] = useState(false);

  if (children.length <= visible) return <>{children}</>;

  return (
    <>
      {open ? children : children.slice(0, visible)}

      <li>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          className="text-brand-800/70 hover:text-brand-900 decoration-ember-500/50 cursor-pointer text-[12.5px] font-semibold underline underline-offset-[3px] transition-colors"
        >
          {open ? lessLabel : moreLabel.replace("{count}", String(children.length - visible))}
        </button>
      </li>
    </>
  );
}
