import { createBrowserClient } from "@supabase/ssr";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from "./env";

/**
 * Supabase in the browser.
 *
 * Used for signing in and for submitting enquiries. Missing configuration
 * throws rather than failing silently, so a form that cannot reach the database
 * says so instead of pretending to send.
 */
export function createClient() {
  if (!supabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.",
    );
  }

  return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}
