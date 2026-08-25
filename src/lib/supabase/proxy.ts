import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from "./env";

/** Refreshes the session on every request. */
/** See supabase/server.ts for why httpOnly is not forced on this one. */
const harden = (options: CookieOptions): CookieOptions => ({
  ...options,
  secure: process.env.NODE_ENV !== "development",
  sameSite: options.sameSite ?? "lax",
});

export async function refreshSession(request: NextRequest, response: NextResponse) {
  if (!supabaseConfigured()) return response;

  const result = response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) =>
          result.cookies.set(name, value, harden(options)),
        );
      },
    },
  });

  await supabase.auth.getUser();

  return result;
}
