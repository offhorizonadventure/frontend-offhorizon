"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AccountMenu } from "@/components/auth/AccountMenu";
import { AuthModal, type AuthLabels } from "@/components/auth/AuthModal";
import { signOut } from "@/lib/auth";

export const SIGN_IN_EVENT = "offhorizon:sign-in";

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
  signedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

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
          router.refresh();
        }}
        signIn={menu.signIn}
        account={menu.account}
        bookings={menu.bookings}
        payments={menu.payments}
        signOutLabel={menu.signOut}
      />

      {}
      {open && <AuthModal labels={labels} onClose={() => setOpen(false)} />}
    </>
  );
}
