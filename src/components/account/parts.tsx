import type { ReactNode } from "react";

/** The pieces the four account screens share. */

export function Panel({
  title,
  lead,
  action,
  children,
}: {
  title: string;
  lead?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="bg-paper ring-brand-900/10 rounded-[24px] p-6 ring-1 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-brand-900 text-[19px] leading-tight font-bold tracking-[-0.02em]">
            {title}
          </h2>
          {lead && <p className="text-brand-800/60 mt-2 text-[13.5px]">{lead}</p>}
        </div>
        {action}
      </div>

      <div className="mt-7">{children}</div>
    </section>
  );
}

export const fieldClass =
  "h-12 w-full rounded-xl border border-brand-900/15 bg-white px-4 text-[14px] text-brand-900 outline-none transition-[border-color,box-shadow] placeholder:text-brand-800/35 focus:border-brand-800 focus:ring-[3px] focus:ring-brand-800/10";

export const labelClass =
  "block text-[10.5px] font-bold tracking-[0.16em] text-brand-600 uppercase";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

export function PrimaryButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="bg-brand-800 text-cream-100 hover:bg-brand-900 h-12 rounded-full px-8 text-[11px] font-bold tracking-[0.14em] uppercase transition-colors duration-300"
    >
      {children}
    </button>
  );
}

const TONES = {
  confirmed: "bg-brand-800 text-cream-100",
  pending: "bg-ember-500/15 text-ember-700",
  paid: "bg-brand-800 text-cream-100",
  refunded: "bg-brand-900/8 text-brand-800/70",
  past: "bg-brand-900/8 text-brand-800/70",
} as const;

export function Pill({ tone, children }: { tone: keyof typeof TONES; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] uppercase ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/** Every screen here is a mock, and says so rather than looking live. */
