import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase, for submitting enquiries.
 *
 * The publishable key is safe in the browser. Row level security lets this
 * client insert into the enquiry tables and nothing else: it cannot read back
 * what it wrote, or what anyone else wrote.
 *
 * Missing configuration throws rather than failing silently, so a form that
 * cannot reach the database says so instead of pretending to send.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.",
    );
  }

  return createBrowserClient(url, key);
}
