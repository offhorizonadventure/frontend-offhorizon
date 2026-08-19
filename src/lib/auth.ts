"use client";

import type { Provider } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

/**
 * Signing in, joining, and the two password journeys.
 *
 * Run in the browser rather than through server actions, because Supabase sets
 * the session on the client and the SSR helper syncs it to cookies from there.
 * That also means an OAuth redirect comes back to a page rather than to an
 * action, which is what the callback route is for.
 *
 * Every function returns the same small result: an error message a person can
 * read, or nothing. Supabase's own messages are passed through, since they are
 * already written for the person typing rather than for the log.
 */

export type AuthResult = { error: string | null };

/** Where OAuth and the emailed links come back to. */
const callback = (next: string) =>
  `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  return { error: error?.message ?? null };
}

export async function signUp(
  email: string,
  password: string,
  profile: { name: string; phone: string },
): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Carried in metadata only so the database trigger can copy it into the
      // profile row the moment the account is created. Nothing here is trusted
      // for permissions: roles live in `app_metadata`, which a user cannot
      // write to, and the profile is what the site reads afterwards.
      data: { full_name: profile.name, phone: profile.phone },
      emailRedirectTo: callback("/account"),
    },
  });

  return { error: error?.message ?? null };
}

/**
 * Google and Facebook.
 *
 * The provider has to be enabled in the Supabase dashboard first, with the
 * callback below registered on its side. Nothing about the button changes
 * between the two; only the provider name does.
 */
export async function signInWith(provider: Provider): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callback("/account") },
  });

  return { error: error?.message ?? null };
}

/**
 * Sends the reset link.
 *
 * The answer is the same whether or not the address has an account: telling a
 * stranger which addresses are registered is a way of enumerating your users.
 */
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callback("/account?reset=1"),
  });

  return { error: error?.message ?? null };
}

export async function updatePassword(password: string): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });

  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

/**
 * Saves the account holder's own details.
 *
 * Written to `profiles`, which is ours and which row level security limits to
 * the row belonging to the signed in account. The auth metadata is updated too,
 * only so the name is there for anything reading the session directly; the
 * profile is what the site reads.
 */
export async function updateProfile(profile: {
  name: string;
  phone: string;
}): Promise<AuthResult> {
  const supabase = createClient();

  const { data, error: sessionError } = await supabase.auth.getUser();
  if (sessionError || !data.user) return { error: "You are not signed in." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: profile.name, phone: profile.phone || null })
    .eq("id", data.user.id);

  if (error) return { error: error.message };

  await supabase.auth.updateUser({ data: { full_name: profile.name } });

  return { error: null };
}
