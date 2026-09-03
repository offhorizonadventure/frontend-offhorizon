import { NextResponse, type NextRequest } from "next/server";

import { COUNTRY_COOKIE, LOCALE_COOKIE, isLocale, localeFor } from "@/i18n/config";
import { PATH_HEADER } from "@/lib/next-path";
import { refreshSession } from "@/lib/supabase/proxy";

const GEO_HEADERS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "cloudfront-viewer-country",
  "x-country-code",
];

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const COUNTRY_MAX_AGE = 60 * 60 * 24 * 30;

function detectCountry(request: NextRequest): string | null {
  for (const header of GEO_HEADERS) {
    const country = request.headers.get(header);
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

  if (isLocale(pathname.split("/")[1])) {
    /**
     * The address asked for, passed on to the server components.
     *
     * A layout is told which segment it is wrapping but not which page it
     * ended up rendering, so the account gate had nothing to send a signed out
     * visitor back to and dropped them on the home page. A link out of an
     * email is exactly the case that matters, and it is the case that lost the
     * most.
     */
    const headers = new Headers(request.headers);
    headers.set(PATH_HEADER, pathname + request.nextUrl.search);

    const response = await refreshSession(request, NextResponse.next({ request: { headers } }));
    rememberCountry(request, response);
    return response;
  }

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url, 307);
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV !== "development",
  });
  rememberCountry(request, response);
  return response;
}

function rememberCountry(request: NextRequest, response: NextResponse) {
  if (request.cookies.has(COUNTRY_COOKIE)) return;

  const country = detectCountry(request);
  if (!country) return;

  response.cookies.set(COUNTRY_COOKIE, country, {
    path: "/",
    maxAge: COUNTRY_MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV !== "development",
  });
}

export const config = {
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
