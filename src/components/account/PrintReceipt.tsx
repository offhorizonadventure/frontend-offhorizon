"use client";

export function PrintReceipt({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="border-brand-900/20 text-brand-800 hover:border-brand-800 hover:bg-brand-800 hover:text-cream-100 inline-flex h-11 items-center gap-2.5 rounded-full border px-6 text-[10.5px] font-bold tracking-[0.12em] uppercase transition-colors print:hidden"
    >
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden className="stroke-current">
        <path
          d="M4.5 6V2.5h7V6M4.5 11.5h7v2h-7zM3 6h10a1 1 0 0 1 1 1v3.5a1 1 0 0 1-1 1h-1M4 11.5H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {label}
    </button>
  );
}
