"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  Field,
  PasswordField,
  PrimaryButton,
  SocialButtons,
  fieldClass,
} from "@/components/auth/fields";
import { signIn, signInWith } from "@/lib/auth";

export type SignInLabels = {
  email: string;
  emailPlaceholder: string;
  password: string;
  submit: string;
  show: string;
  hide: string;
  or: string;
  google: string;
  facebook: string;
};

/**
 * Signing in on a page of its own, and going back where you were headed.
 *
 * A rider follows "view your booking" out of an email, is not signed in, and
 * used to be dropped on the home page with the address they were sent thrown
 * away. Here the address is carried through sign in and they land on it. The
 * social buttons carry it too, through the callback, because the round trip to
 * Google is exactly where a destination gets lost.
 */
export function SignInPanel({ next, labels }: { next: string; labels: SignInLabels }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);

    const result = await signIn(
      String(form.get("email") ?? "").trim(),
      String(form.get("password") ?? ""),
    );

    if (result.error) {
      setPending(false);
      setError(result.error);
      return;
    }

    // replace, not push: the back button should not walk into a sign in page
    // for an account that is now signed in.
    router.replace(next);
    router.refresh();
  }

  async function handleProvider(provider: "google" | "facebook") {
    setPending(true);
    setError(null);

    const result = await signInWith(provider, next);
    if (result.error) {
      setPending(false);
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label={labels.email}>
        {(id) => (
          <input
            id={id}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder={labels.emailPlaceholder}
            className={fieldClass}
          />
        )}
      </Field>

      <PasswordField
        label={labels.password}
        name="password"
        autoComplete="current-password"
        showLabel={labels.show}
        hideLabel={labels.hide}
      />

      {error && (
        <p role="alert" className="text-[13px] leading-relaxed text-red-700">
          {error}
        </p>
      )}

      <PrimaryButton pending={pending}>{labels.submit}</PrimaryButton>

      <SocialButtons
        divider={labels.or}
        google={labels.google}
        facebook={labels.facebook}
        disabled={pending}
        onProvider={handleProvider}
      />
    </form>
  );
}
