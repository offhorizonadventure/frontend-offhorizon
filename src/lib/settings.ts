import "server-only";

import { unstable_cache } from "next/cache";

import { createClient } from "@supabase/supabase-js";

import { CATALOGUE_TAG } from "@/lib/catalogue";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Whether the site is supposed to be serving pages.
 *
 * Read on every render, so it is cached, but only briefly. Half a minute is
 * short enough that the office is not left wondering whether the switch
 * worked, and long enough that a busy page is not asking the database the same
 * question a hundred times a second. The admin also posts to /api/revalidate
 * when it throws the switch, which drops this immediately; the timer is what
 * makes it work anyway when that call cannot get through.
 *
 * A database that cannot be reached, or has never run patch-settings.sql,
 * reads as live. A site that takes itself down because a query failed is worse
 * than one that stays up when it should not.
 */
export const isMaintenance = unstable_cache(
  async (): Promise<boolean> => {
    if (!url || !key) return false;

    const supabase = createClient(url, key, { auth: { persistSession: false } });

    const { data, error } = await supabase
      .from("settings")
      .select("is_maintenance")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) return false;

    return Boolean(data.is_maintenance);
  },
  ["settings-maintenance"],
  { tags: [CATALOGUE_TAG], revalidate: 30 },
);
