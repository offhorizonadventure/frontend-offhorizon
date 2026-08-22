"use client";

import { useState } from "react";

/** Copies one rider's invite link. */
export function CopyLink({
  url,
  labels,
}: {
  url: string;
  labels: { copy: string; copied: string };
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(url).then(() => setCopied(true));
      }}
      className="border-brand-900/20 text-brand-800 hover:border-brand-800 hover:bg-brand-800 hover:text-cream-100 inline-flex h-10 shrink-0 cursor-pointer items-center rounded-full border px-4 text-[10.5px] font-bold tracking-[0.12em] uppercase transition-colors"
    >
      {copied ? labels.copied : labels.copy}
    </button>
  );
}
