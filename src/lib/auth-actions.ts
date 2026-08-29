"use server";

import "server-only";

import { withinLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

export type AuthResult = { error: string | null };

const TOO_MANY = "Too many attempts. Wait a few minutes and try again.";

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const callback = (next: string) => `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;

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
      data: { full_name: profile.name.slice(0, 120), phone: profile.phone.slice(0, 32) },
      emailRedirectTo: callback("/account"),
    },
  });

  return { error: error?.message ?? null };
}

export async function requestPasswordResetAction(email: string): Promise<AuthResult> {
  if (!(await withinLimit("password-reset", 3, 60))) return { error: TOO_MANY };

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callback("/reset-password"),
  });

  return { error: error?.message ?? null };
}

export async function updatePasswordAction(password: string): Promise<AuthResult> {
  if (!(await withinLimit("password-change", 5, 60))) return { error: TOO_MANY };
  if (password.length < 8) return { error: "Use at least eight characters." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  return { error: error?.message ?? null };
}
