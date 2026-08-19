import "server-only";

import { createClient, getUser } from "@/lib/supabase/server";

/**
 * The account holder's own details.
 *
 * Read from `profiles` rather than from the auth user's metadata. Metadata is
 * writable by the account holder through the auth API, which is fine for a
 * display name and wrong for anything the business will later rely on; a
 * profile row is ours, and row level security limits each person to their own.
 */
export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
};

export async function getProfile(): Promise<Profile | null> {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  // The trigger creates the row with the account, so a missing one means the
  // migration has not been run. Falling back to the account itself keeps the
  // page working rather than showing an empty profile.
  return (
    (data as Profile) ?? {
      id: user.id,
      email: user.email ?? null,
      full_name: (user.user_metadata?.full_name as string) ?? null,
      phone: (user.user_metadata?.phone as string) ?? null,
      avatar_url: (user.user_metadata?.avatar_url as string) ?? null,
    }
  );
}
