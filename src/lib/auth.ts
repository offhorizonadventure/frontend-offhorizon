"use client";

import type { Provider } from "@supabase/supabase-js";

import {
  requestPasswordResetAction,
  signInAction,
  signUpAction,
  updatePasswordAction,
} from "@/lib/auth-actions";
import { createClient } from "@/lib/supabase/client";

/**
 * Signing in, joining, and the two password journeys.
 *
 * Anything involving a password is a thin wrapper over a server action, so
 * every attempt passes through the rate limiter. What stays in the browser is
 * the OAuth redirect, signing out, and saving a profile: none of them is worth
 * guessing at.
 */

export type AuthResult = { error: string | null };

/** Where OAuth and the emailed links come back to. */
const callback = (next: string) =>
  `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

export async function signIn(email: string, password: string): Promise<AuthResult> {
  return signInAction(email, password);
}

export async function signUp(
  email: string,
  password: string,
  profile: { name: string; phone: string },
): Promise<AuthResult> {
  return signUpAction(email, password, profile);
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
  return requestPasswordResetAction(email);
}

export async function updatePassword(password: string): Promise<AuthResult> {
  return updatePasswordAction(password);
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

  // Generic on purpose: a Postgres message names the table and the column.
  if (error) return { error: "Those details could not be saved. Try again." };

  await supabase.auth.updateUser({ data: { full_name: profile.name } });

  return { error: null };
}
