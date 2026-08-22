"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { payInstalment } from "@/lib/booking/actions";
import { openCheckout } from "@/lib/razorpay-checkout";

type Labels = {
  amount: string;
  pay: string;
  paying: string;
  opening: string;
  dismissed: string;
  unavailable: string;
};

/** Pay any amount towards what is left. */
export function InstalmentForm({
  keyId,
  siteName,
  reference,
  currency,
  outstanding,
  profile,
  labels,
}: {
  keyId: string;
  siteName: string;
  reference: string;
  currency: string;
  outstanding: number;
  profile: { name: string; email: string; phone: string };
  labels: Labels;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const formData = new FormData(event.currentTarget);
    setPending(true);
    setNotice(null);

    const result = await payInstalment(null, formData);

    if (!result.ok) {
      setPending(false);
      setNotice(result.error);
      return;
    }

    setNotice(labels.opening);

    const opened = await openCheckout({
      keyId,
      order: result,
      name: siteName,
      prefill: { name: profile.name, email: profile.email, contact: profile.phone },
      onClose: () => {
        setPending(false);
        setNotice(labels.dismissed);
      },
      onPaid: () => {
        router.refresh();
      },
    });

    if (!opened) {
      setPending(false);
      setNotice(labels.unavailable);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input type="hidden" name="reference" value={reference} />

      <label className="block space-y-2">
        <span className="text-brand-600 block text-[10.5px] font-bold tracking-[0.16em] uppercase">
          {labels.amount}
        </span>
        <div className="flex gap-2.5">
          <span className="border-brand-900/15 text-brand-800/60 flex h-12 items-center rounded-xl border bg-white px-4 text-[13px] font-semibold">
            {currency}
          </span>
          <input
            name="amount"
            type="number"
            inputMode="decimal"
            min="1"
            max={outstanding}
            step="1"
            defaultValue={Math.round(outstanding)}
            required
            className="border-brand-900/15 text-brand-900 focus:border-brand-800 focus:ring-brand-800/10 h-12 w-full rounded-xl border bg-white px-4 text-[14px] tabular-nums transition-[border-color,box-shadow] outline-none focus:ring-[3px]"
          />
        </div>
      </label>

      {notice && (
        <p
          role="status"
          className="border-brand-900/15 bg-brand-900/4 text-brand-800 rounded-xl border px-4 py-3 text-[13px] leading-snug"
        >
          {notice}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-brand-800 text-cream-100 hover:bg-brand-900 flex h-12 w-full items-center justify-center rounded-full text-[11px] font-bold tracking-[0.13em] uppercase transition-colors disabled:opacity-60"
      >
        {pending ? labels.paying : labels.pay}
      </button>
    </form>
  );
}
