"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { COUNTRY_COOKIE } from "@/i18n/config";

const STORAGE_KEY = "oh_country";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const setCookie = (name: string, value: string, maxAge: number) => {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; samesite=lax`;
};

/** Works out where the visitor is, once, on their first visit. */
export function CountryProbe() {
  const router = useRouter();
  const pathname = usePathname();

  /** Everything the effect needs, without putting it in the dependency list. */
  const latest = useRef({ router, pathname });

  useEffect(() => {
    latest.current = { router, pathname };
  });

  // Strict mode mounts effects twice in development. This asks once.
  const asked = useRef(false);

  useEffect(() => {
    if (asked.current) return;
    asked.current = true;

    const stored = localStorage.getItem(STORAGE_KEY);

    // Already known from an earlier visit.
    if (stored?.length === 2) {
      setCookie(COUNTRY_COOKIE, stored, COOKIE_MAX_AGE);
      latest.current.router.refresh();
      return;
    }

    const lookUp = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) return;

        const data = (await response.json()) as { country_code?: string };
        const country = data.country_code?.toUpperCase();

        if (!country || country.length !== 2) return;

        localStorage.setItem(STORAGE_KEY, country);
        setCookie(COUNTRY_COOKIE, country, COOKIE_MAX_AGE);

        /** Only the currency follows the country. */
        latest.current.router.refresh();
      } catch {
        // Offline, blocked by an ad blocker, or over the free quota.
      }
    };

    void lookUp();

    /** No cleanup, deliberately. */
  }, []);

  return null;
}
