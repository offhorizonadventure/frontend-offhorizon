"use client";

import { useEffect, useRef, useState } from "react";

import { UserRound } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";

/**
 * The account control in the navigation bar.
 *
 * Signed out it opens the dialog; signed in it drops a short menu. There is no
 * session yet, so it renders the signed out state and the menu is here for the
 * shape of the thing rather than for use.
 */
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

  /**
   * Closes on a click elsewhere or on Escape, and not on the pointer leaving.
   *
   * It opened on a click, so it has to close on one: a menu that vanishes when
   * the pointer strays cannot be reached with a trackpad, and cannot be used at
   * all from a keyboard or a touchscreen, where there is no leave event to
   * speak of.
   *
   * `pointerdown` rather than `click`, so a press outside dismisses before the
   * thing underneath reacts.
   */
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
        className="inline-flex h-9 items-center gap-2 rounded-full border border-brand-900/15 px-3.5 text-[10.5px] font-bold tracking-[0.09em] whitespace-nowrap text-brand-900 uppercase transition-colors duration-200 hover:border-brand-900/35 hover:bg-brand-900/5"
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
        className="grid size-9 place-items-center rounded-full bg-brand-800 text-cream-100 transition-colors hover:bg-brand-900"
      >
        <UserRound />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-brand-900/10 bg-white py-1.5 shadow-xl shadow-brand-950/10"
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
            className={`${item} w-full border-t border-brand-900/8 text-left`}
          >
            {signOutLabel}
          </button>
        </div>
      )}
    </div>
  );
}
