"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createBooking } from "@/lib/booking/actions";
import { openCheckout } from "@/lib/razorpay-checkout";

export type CheckoutLabels = {
  planTitle: string;
  full: string;
  fullNote: string;
  deposit: string;
  depositNote: string;
  depositClosed: string;
  detailsTitle: string;
  name: string;
  email: string;
  phone: string;
  pay: string;
  paying: string;
  opening: string;
  dismissed: string;
  unavailable: string;
  agree: string;
};

type Props = {
  keyId: string;
  siteName: string;
  hidden: Record<string, string>;
  amounts: { full: string; deposit: string };
  depositAllowed: boolean;
  profile: { name: string; email: string; phone: string };
  labels: CheckoutLabels;
};

const field =
  "h-12 w-full rounded-xl border border-brand-900/15 bg-white px-4 text-[14px] text-brand-900 outline-none transition-[border-color,box-shadow] placeholder:text-brand-800/35 focus:border-brand-800 focus:ring-[3px] focus:ring-brand-800/10";

const label = "block text-[10.5px] font-bold tracking-[0.16em] text-brand-600 uppercase";

export function CheckoutForm({
  keyId,
  siteName,
  hidden,
  amounts,
  depositAllowed,
  profile,
  labels,
}: Props) {
  const router = useRouter();
  const [plan, setPlan] = useState<"full" | "deposit">("full");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const formData = new FormData(event.currentTarget);
    setPending(true);
    setNotice(null);

    const result = await createBooking(null, formData);

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
        router.push(`/account/bookings/${result.reference}`);
        router.refresh();
      },
    });

    if (!opened) {
      setPending(false);
      setNotice(labels.unavailable);
    }
  }

  const choice = (value: "full" | "deposit", title: string, note: string, amount: string) => (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
        plan === value
          ? "border-brand-800 bg-brand-800/5"
          : "border-brand-900/15 hover:border-brand-900/30"
      }`}
    >
      <input
        type="radio"
        name="plan"
        value={value}
        checked={plan === value}
        onChange={() => setPlan(value)}
        className="accent-brand-800 mt-1"
      />
      <span className="min-w-0 flex-1">
        <span className="text-brand-900 flex flex-wrap items-baseline justify-between gap-2 text-[14px] font-semibold">
          {title}
          <span className="font-display text-[16px] font-extrabold tabular-nums">{amount}</span>
        </span>
        <span className="text-brand-800/55 mt-1 block text-[12.5px] leading-snug">{note}</span>
      </span>
    </label>
  );

  return (
    <form onSubmit={submit} className="space-y-6">
      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <div className="space-y-4">
        <p className={label}>{labels.detailsTitle}</p>

        <label className="block space-y-2">
          <span className={label}>{labels.name}</span>
          <input name="fullName" defaultValue={profile.name} required className={field} />
        </label>

        <label className="block space-y-2">
          <span className={label}>{labels.email}</span>
          <input
            name="email"
            type="email"
            defaultValue={profile.email}
            required
            className={field}
          />
        </label>

        <label className="block space-y-2">
          <span className={label}>{labels.phone}</span>
          <input name="phone" defaultValue={profile.phone} className={field} />
        </label>
      </div>

      <fieldset className="space-y-2.5">
        <legend className={label}>{labels.planTitle}</legend>
        {choice("full", labels.full, labels.fullNote, amounts.full)}
        {depositAllowed ? (
          choice("deposit", labels.deposit, labels.depositNote, amounts.deposit)
        ) : (
          <p className="text-brand-800/55 border-brand-900/12 rounded-2xl border border-dashed px-4 py-3 text-[12.5px] leading-snug">
            {labels.depositClosed}
          </p>
        )}
      </fieldset>

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
        className="bg-brand-800 text-cream-100 hover:bg-brand-900 flex h-13 w-full items-center justify-center rounded-full text-[11.5px] font-bold tracking-[0.13em] uppercase transition-colors disabled:opacity-60"
      >
        {pending ? labels.paying : labels.pay}
      </button>

      <p className="text-brand-800/45 text-center text-[11px] leading-relaxed">{labels.agree}</p>
    </form>
  );
}
