"use client";

import { useEffect, useRef, useState } from "react";

import { UserRound } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";

export function AccountMenu({
  signIn,
  account,
  bookings,
  payments,
  signedIn = false,
  onSignIn,
  onSignOut,
  signOutLabel,
}: {
  signIn: string;
  account: string;
  bookings: string;
  payments: string;
  signedIn?: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  signOutLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!signedIn) {
    return (
      <button
        type="button"
        onClick={onSignIn}
        className="border-brand-900/15 text-brand-900 hover:border-brand-900/35 hover:bg-brand-900/5 inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[10.5px] font-bold tracking-[0.09em] whitespace-nowrap uppercase transition-colors duration-200"
      >
        <UserRound />
        <span className="hidden sm:inline">{signIn}</span>
      </button>
    );
  }

  const item =
    "block px-4 py-2.5 text-[13px] text-brand-900/80 transition-colors hover:bg-brand-900/5 hover:text-brand-900";

  return (
    <div ref={wrapper} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((on) => !on)}
        className="bg-brand-800 text-cream-100 hover:bg-brand-900 grid size-9 place-items-center rounded-full transition-colors"
      >
        <UserRound />
      </button>

      {open && (
        <div
          role="menu"
          className="border-brand-900/10 shadow-brand-950/10 absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border bg-white py-1.5 shadow-xl"
          onClick={() => setOpen(false)}
        >
          <Link href="/account" className={item}>
            {account}
          </Link>
          <Link href="/account/bookings" className={item}>
            {bookings}
          </Link>
          <Link href="/account/payments" className={item}>
            {payments}
          </Link>

          <button
            type="button"
            onClick={onSignOut}
            className={`${item} border-brand-900/8 w-full border-t text-left`}
          >
            {signOutLabel}
          </button>
        </div>
      )}
    </div>
  );
}
