"use client";

import type { Provider } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

/** Signing in, joining, and the two password journeys. */

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
      // In metadata so the trigger can copy it into the profile row at sign up.
      data: { full_name: profile.name, phone: profile.phone },
      emailRedirectTo: callback("/account"),
    },
  });

  return { error: error?.message ?? null };
}

/** Google and Facebook. */
export async function signInWith(provider: Provider): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callback("/account") },
  });

  return { error: error?.message ?? null };
}

/** Sends the reset link. */
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callback("/reset-password"),
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

/** Saves the account holder's own details. */
export async function updateProfile(profile: { name: string; phone: string }): Promise<AuthResult> {
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
