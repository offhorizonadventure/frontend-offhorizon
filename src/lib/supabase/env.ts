/**
 * Supabase configuration.
 *
 * The check that refuses to start when these are missing lives in lib/env.ts,
 * which this imports so that importing any Supabase client runs it.
 */
export { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/env";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/env";

export const supabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
