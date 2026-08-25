import "server-only";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

/** Supabase on the server, reading the session from cookies. */
/**
 * `secure` outside development, so no cookie travels over plain http.
 *
 * httpOnly is deliberately not forced here. The site uses Supabase's browser
 * client, which reads the session from this cookie, so hiding it from
 * JavaScript would sign everyone out. The admin panel has no browser client
 * and does set httpOnly; see backend/src/lib/supabase/server.ts.
 */
const harden = (options: CookieOptions): CookieOptions => ({
  ...options,
  secure: process.env.NODE_ENV !== "development",
  sameSite: options.sameSite ?? "lax",
});

export async function createClient() {
  const store = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            store.set(name, value, harden(options)),
          );
        } catch {
          // Called from a Server Component, where cookies are read only.
        }
      },
    },
  });
}

/** The signed in visitor, or null. */
export async function getUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return data.user ?? null;
}
