import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_URL } from "./env";

const SECRET_KEY = process.env.SUPABASE_SECRET_KEY ?? "";

export const adminConfigured = () => Boolean(SUPABASE_URL && SECRET_KEY);

/** Supabase with the secret key. Only for code that decides amounts itself. */
export function createAdminClient() {
  if (!adminConfigured()) {
    throw new Error("SUPABASE_SECRET_KEY is not set, so bookings cannot be written.");
  }

  return createSupabaseClient(SUPABASE_URL, SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
