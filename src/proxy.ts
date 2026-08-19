import { NextResponse, type NextRequest } from "next/server";

import { LOCALE_COOKIE, isLocale, localeFor } from "@/i18n/config";
import { refreshSession } from "@/lib/supabase/proxy";

const GEO_HEADERS = ["x-vercel-ip-country", "cf-ipcountry", "cloudfront-viewer-country"];
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function detectLocale(request: NextRequest) {
  const preferred = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(preferred)) return preferred;

  for (const header of GEO_HEADERS) {
    const country = request.headers.get(header);
    if (country) return localeFor(country);
  }
  return localeFor(null);
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Already on a locale path: nothing to redirect, but the session still has to
  // be refreshed, or an expiring token is never rotated while someone browses.
  if (isLocale(pathname.split("/")[1])) {
    return refreshSession(request, NextResponse.next({ request }));
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
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
