"use client";

import { useState, type ReactNode } from "react";

export function MoreLines({
  children,
  visible,
  moreLabel,
  lessLabel,
}: {
  children: ReactNode[];
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
