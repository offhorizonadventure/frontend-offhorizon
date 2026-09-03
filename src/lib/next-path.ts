import { locales, type Locale } from "@/i18n/config";

/**
 * Where to send somebody after they sign in.
 *
 * Only a path on this site, and never back to the sign in page itself. An open
 * redirect would turn a link out of one of our own emails into a way of
 * bouncing somebody onto somebody else's page, and a `next` pointing at sign
 * in would sign a rider in and then ask them to sign in again.
 */
export function safeNext(value: unknown, fallback = "/account"): string {
  const next = typeof value === "string" ? value.trim() : "";

  // A protocol relative address, //evil.example, is a full URL to a browser.
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  if (next.includes("\\")) return fallback;
  if (next.split("?")[0].includes("/sign-in")) return fallback;

  return next;
}

/**
 * The same path without its locale prefix.
 *
 * Links are built with the locale aware `Link`, which adds the prefix itself,
 * so handing it one that already has it produces /en/en/account.
 */
export function withoutLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split("/");

  return (locales as readonly string[]).includes(first) ? `/${rest.join("/")}` : pathname;
}

/** The sign in address for a page that needs an account, carrying the way back. */
export const signInPath = (pathname: string) =>
  `/sign-in?next=${encodeURIComponent(withoutLocale(pathname))}`;

export type { Locale };

/**
 * The header the proxy puts the requested address in.
 *
 * Named rather than typed out in two files, because the two have to agree and
 * a typo in either is a gate that silently sends everybody to the home page.
 */
export const PATH_HEADER = "x-offhorizon-path";
