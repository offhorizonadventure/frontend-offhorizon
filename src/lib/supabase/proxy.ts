import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from "./env";

/**
 * Refreshes the session on every request.
 *
 * Two rules make this correct, and both are easy to break:
 *
 * 1. The response Supabase wrote its cookies onto has to be the one returned.
 *    Building a fresh `NextResponse` instead silently drops the rotated tokens
 *    and signs people out at random intervals.
 * 2. `getUser()` is called, not `getSession()`. It revalidates with the auth
 *    server, and it is also what triggers the refresh in the first place.
 *
 * The public site does not guard routes here: everything except the account
 * pages is readable signed out, and those check for themselves.
 */
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
          result.cookies.set(name, value, options),
        );
      },
    },
  });

  await supabase.auth.getUser();

  return result;
}
