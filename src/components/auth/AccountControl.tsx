"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AccountMenu } from "@/components/auth/AccountMenu";
import { AuthModal, type AuthLabels } from "@/components/auth/AuthModal";
import { signOut } from "@/lib/auth";

/**
 * Asks the bar to open its sign in dialog.
 *
 * The dialog belongs to the navigation, and the checkout needs to raise it
 * without either of them knowing about the other. An event on the window is
 * the whole of the contract.
 */
export const SIGN_IN_EVENT = "offhorizon:sign-in";

/** The navigation bar's account control and the dialog it opens. */
export function AccountControl({
  labels,
  menu,
  signedIn,
}: {
  labels: AuthLabels;
  menu: {
    signIn: string;
    account: string;
    bookings: string;
    payments: string;
    signOut: string;
  };
  /** Resolved on the server, so the first paint is already correct. */
  signedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Anywhere on the site can ask for the dialog. Nothing opens it for someone
  // already signed in, which would be a modal over a page they can use.
  useEffect(() => {
    if (signedIn) return;

    const show = () => setOpen(true);
    window.addEventListener(SIGN_IN_EVENT, show);

    return () => window.removeEventListener(SIGN_IN_EVENT, show);
  }, [signedIn]);

  return (
    <>
      <AccountMenu
        signedIn={signedIn}
        onSignIn={() => setOpen(true)}
        onSignOut={async () => {
          await signOut();
          // The bar and the account pages are server rendered, so they notice a sign out on refresh.
          router.refresh();
        }}
        signIn={menu.signIn}
        account={menu.account}
        bookings={menu.bookings}
        payments={menu.payments}
        signOutLabel={menu.signOut}
      />

      {/**
       * Mounted only while open: nothing inside is reachable by tab or scroll when
       * it is shut, and the dialog starts from a clean slate each time.
       */}
      {open && <AuthModal labels={labels} onClose={() => setOpen(false)} />}
    </>
  );
}
