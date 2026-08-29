"use client";

import { useEffect } from "react";

import { SIGN_IN_EVENT } from "@/components/auth/AccountControl";

export function AskToSignIn() {
  useEffect(() => {
    const raised = window.setTimeout(() => window.dispatchEvent(new Event(SIGN_IN_EVENT)), 250);

    return () => window.clearTimeout(raised);
  }, []);

  return null;
}
