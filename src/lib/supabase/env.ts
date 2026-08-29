export { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/env";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/env";

export const supabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
