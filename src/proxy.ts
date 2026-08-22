import { NextResponse, type NextRequest } from "next/server";

import { COUNTRY_COOKIE, LOCALE_COOKIE, isLocale, localeFor } from "@/i18n/config";
import { refreshSession } from "@/lib/supabase/proxy";

/** Where the visitor is, according to whoever is in front of the app. */
const GEO_HEADERS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "cloudfront-viewer-country",
  "x-country-code",
];

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
/** Shorter than the locale: people travel, and a stale country misprices. */
const COUNTRY_MAX_AGE = 60 * 60 * 24 * 30;

/** The country, from a header or from the language header as a last resort. */
function detectCountry(request: NextRequest): string | null {
  for (const header of GEO_HEADERS) {
    const country = request.headers.get(header);
    // Cloudflare answers XX for anonymised or unknown addresses.
    if (country && country.length === 2 && country !== "XX") return country.toUpperCase();
  }

  const region = request.headers.get("accept-language")?.match(/^[a-z]{2,3}-([A-Z]{2})/);
  return region?.[1] ?? null;
}

function detectLocale(request: NextRequest) {
  const preferred = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(preferred)) return preferred;

  return localeFor(detectCountry(request));
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // On a locale path already: no redirect, but the session still needs refreshing.
  if (isLocale(pathname.split("/")[1])) {
    const response = await refreshSession(request, NextResponse.next({ request }));
    rememberCountry(request, response);
    return response;
  }

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  // 307, not 308: the target depends on the visitor and must not be cached.
  const response = NextResponse.redirect(url, 307);
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
  });
  rememberCountry(request, response);
  return response;
}

/** Writes the country cookie once, and leaves it alone afterwards. */
function rememberCountry(request: NextRequest, response: NextResponse) {
  if (request.cookies.has(COUNTRY_COOKIE)) return;

  const country = detectCountry(request);
  if (!country) return;

  response.cookies.set(COUNTRY_COOKIE, country, {
    path: "/",
    maxAge: COUNTRY_MAX_AGE,
    sameSite: "lax",
  });
}

export const config = {
  /** `auth` is excluded along with the API. */
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
