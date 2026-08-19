import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

/**
 * Supabase on the server, reading the session from cookies.
 *
 * The `setAll` catch is deliberate: a Server Component may not write cookies,
 * and the proxy has already refreshed the session for this request, so there is
 * nothing to do and nothing to report.
 */
export async function createClient() {
  const store = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies are read only.
        }
      },
    },
  });
}

/**
 * The signed in visitor, or null.
 *
 * `getUser()` rather than `getSession()`: it revalidates the token with the
 * auth server, where `getSession` only decodes whatever cookie was sent.
 */
export async function getUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return data.user ?? null;
}
