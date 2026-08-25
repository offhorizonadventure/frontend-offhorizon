"use server";

import "server-only";

import { withinLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

/**
 * The credential journeys, run on the server so they can be counted.
 *
 * These used to go straight from the browser to Supabase, which meant our own
 * rate limiting never saw a single login attempt. Supabase has limits of its
 * own, but they are set per project rather than per route, and a password
 * guesser should be stopped at our door rather than at theirs.
 *
 * Signing in through the server client puts the session in cookies exactly as
 * the browser client would, so nothing downstream changes.
 *
 * OAuth is not here on purpose: it is a redirect the browser has to perform,
 * and there is no password to guess.
 */

export type AuthResult = { error: string | null };

const TOO_MANY = "Too many attempts. Wait a few minutes and try again.";

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const callback = (next: string) => `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;

/** Five a minute, which is generous for someone who knows their own password. */
export async function signInAction(email: string, password: string): Promise<AuthResult> {
  if (!(await withinLimit("sign-in", 5, 1))) return { error: TOO_MANY };
  if (!email || !password) return { error: "Enter your email address and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  return { error: error?.message ?? null };
}

export async function signUpAction(
  email: string,
  password: string,
  profile: { name: string; phone: string },
): Promise<AuthResult> {
  if (!(await withinLimit("sign-up", 5, 1))) return { error: TOO_MANY };

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // In metadata so the trigger can copy it into the profile row at sign up.
      data: { full_name: profile.name.slice(0, 120), phone: profile.phone.slice(0, 32) },
      emailRedirectTo: callback("/account"),
    },
  });

  return { error: error?.message ?? null };
}

/**
 * Three an hour.
 *
 * Tighter than the rest because each one sends an email, so an unlimited form
 * is a way to have us deliver mail to somebody who did not ask for it.
 */
export async function requestPasswordResetAction(email: string): Promise<AuthResult> {
  if (!(await withinLimit("password-reset", 3, 60))) return { error: TOO_MANY };

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callback("/reset-password"),
  });

  // The caller says the same thing either way, so a stranger cannot use this
  // form to find out which addresses have accounts.
  return { error: error?.message ?? null };
}

export async function updatePasswordAction(password: string): Promise<AuthResult> {
  if (!(await withinLimit("password-change", 5, 60))) return { error: TOO_MANY };
  if (password.length < 8) return { error: "Use at least eight characters." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  return { error: error?.message ?? null };
}
