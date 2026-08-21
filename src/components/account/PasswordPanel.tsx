"use client";

import { useState, type FormEvent } from "react";

import { Field, Panel, PrimaryButton, fieldClass } from "@/components/account/parts";
import { signIn, updatePassword } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

/** Changing the password. */
export function PasswordPanel() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const current = String(data.get("currentPassword") ?? "");
    const next = String(data.get("newPassword") ?? "");
    const confirm = String(data.get("confirmPassword") ?? "");

    setError(null);
    setSaved(false);

    if (next.length < 8) return setError("A password needs at least eight characters.");
    if (next !== confirm) return setError("The two new passwords do not match.");

    setPending(true);

    const { data: session } = await createClient().auth.getUser();
    const email = session.user?.email ?? "";

    const check = await signIn(email, current);
    if (check.error) {
      setPending(false);
      return setError("That current password is not right.");
    }

    const result = await updatePassword(next);
    setPending(false);

    if (result.error) return setError(result.error);

    form.reset();
    setSaved(true);
  }

  return (
    <Panel
      title="Password"
      lead="Your current password is asked for first, so a left open session cannot be used to take the account."
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <p role="alert" className="rounded-xl bg-red-600/10 px-4 py-3 text-[13px] text-red-700">
            {error}
          </p>
        )}

        {saved && (
          <p className="bg-brand-800/8 text-brand-900/75 rounded-xl px-4 py-3 text-[13px]">
            Password updated.
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Current password">
            <input
              type="password"
              name="currentPassword"
              autoComplete="current-password"
              className={fieldClass}
            />
          </Field>

          <Field label="New password">
            <input
              type="password"
              name="newPassword"
              autoComplete="new-password"
              placeholder="At least eight characters"
              className={fieldClass}
            />
          </Field>

          <Field label="Confirm new password">
            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              className={fieldClass}
            />
          </Field>
        </div>

        <PrimaryButton>{pending ? "Saving…" : "Update password"}</PrimaryButton>
      </form>
    </Panel>
  );
}
