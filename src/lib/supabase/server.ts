import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

/** Supabase on the server, reading the session from cookies. */
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

/** The signed in visitor, or null. */
export async function getUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return data.user ?? null;
}
