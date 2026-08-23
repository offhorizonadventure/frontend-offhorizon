"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AccountMenu } from "@/components/auth/AccountMenu";
import { AuthModal, type AuthLabels } from "@/components/auth/AuthModal";
import { signOut } from "@/lib/auth";

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
