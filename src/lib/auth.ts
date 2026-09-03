"use client";

import type { Provider } from "@supabase/supabase-js";

import {
  requestPasswordResetAction,
  signInAction,
  signUpAction,
  updatePasswordAction,
} from "@/lib/auth-actions";
import { createClient } from "@/lib/supabase/client";

export type AuthResult = { error: string | null };

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

/**
 * `next` is where to land afterwards, and it matters most here.
 *
 * Signing in with a password never leaves the page, so the destination is
 * still in hand when it succeeds. A provider takes the browser away to Google
 * and brings it back to a route that knows nothing about where it started, so
 * the address has to travel with it or it is gone.
 */
export async function signInWith(provider: Provider, next = "/account"): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callback(next) },
  });

  return { error: error?.message ?? null };
}

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

export async function updateProfile(profile: { name: string; phone: string }): Promise<AuthResult> {
  const supabase = createClient();

  const { data, error: sessionError } = await supabase.auth.getUser();
  if (sessionError || !data.user) return { error: "You are not signed in." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: profile.name, phone: profile.phone || null })
    .eq("id", data.user.id);

  if (error) return { error: "Those details could not be saved. Try again." };

  await supabase.auth.updateUser({ data: { full_name: profile.name } });

  return { error: null };
}
