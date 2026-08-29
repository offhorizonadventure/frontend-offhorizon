import "server-only";

import { createClient, getUser } from "@/lib/supabase/server";

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
