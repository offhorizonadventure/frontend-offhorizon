"use client";

import { useEffect } from "react";

import { SIGN_IN_EVENT } from "@/components/auth/AccountControl";

/**
 * Opens the sign in dialog as soon as the page appears.
 *
 * The checkout is the one place where being signed out stops everything: the
 * choices are made, the price is agreed, and the only thing left is an account.
 * Asking the reader to find the account button in the bar is a step they should
 * not have to work out.
 *
 * Rendered only when the server has already established there is no session.
 */
export function AskToSignIn() {
  useEffect(() => {
    // After paint, so the page behind the dialog is already drawn.
    const raised = window.setTimeout(() => window.dispatchEvent(new Event(SIGN_IN_EVENT)), 250);

    return () => window.clearTimeout(raised);
  }, []);

  return null;
}
