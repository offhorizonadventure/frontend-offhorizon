"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { setFormSubmitted } from "@/lib/booking/actions";
import { ArrowRight } from "@/components/ui/icons";

/** The rider's own documents form, and the switch that says it is sent. */
export function DocumentsCard({
  travellerId,
  formUrl,
  submitted,
  labels,
}: {
  travellerId: string;
  formUrl: string;
  submitted: boolean;
  labels: { lead: string; open: string; done: string; saved: string };
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(submitted);
  const [saved, setSaved] = useState(false);

  async function toggle(next: boolean) {
    setChecked(next);
    const result = await setFormSubmitted(travellerId, next);

    if (!result.ok) {
      setChecked(!next);
      return;
    }

    setSaved(next);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <p className="text-brand-800/65 text-[13.5px] leading-relaxed">{labels.lead}</p>

      <a
        href={formUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="group bg-brand-800 text-cream-100 hover:bg-brand-900 inline-flex h-11 items-center gap-2.5 rounded-full px-6 text-[10.5px] font-bold tracking-[0.12em] uppercase transition-colors"
      >
        {labels.open}
        <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
      </a>

      <label className="border-brand-900/12 flex cursor-pointer items-start gap-3 rounded-2xl border bg-white p-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => void toggle(event.target.checked)}
          className="accent-brand-800 mt-0.5"
        />
        <span className="text-brand-900 text-[13.5px] font-semibold">
          {labels.done}
          {saved && (
            <span className="text-brand-800/50 mt-1 block text-[12px] font-normal">
              {labels.saved}
            </span>
          )}
        </span>
      </label>
    </div>
  );
}
