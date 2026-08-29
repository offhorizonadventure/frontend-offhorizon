"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { PasswordField } from "@/components/auth/fields";
import { updatePassword } from "@/lib/auth";

export function ResetPasswordForm({
  labels,
}: {
  labels: {
    password: string;
    confirm: string;
    rule: string;
    submit: string;
    saving: string;
    mismatch: string;
    tooShort: string;
    show: string;
    hide: string;
  };
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const next = String(data.get("password") ?? "");
    const confirm = String(data.get("confirm") ?? "");

    if (next.length < 8) return setError(labels.tooShort);
    if (next !== confirm) return setError(labels.mismatch);

    setPending(true);
    setError(null);

    const result = await updatePassword(next);
    setPending(false);

    if (result.error) return setError(result.error);

    router.replace("/account?password=changed");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-600/25 bg-red-600/5 px-4 py-3 text-[13px] text-red-700"
        >
          {error}
        </p>
      )}

      <PasswordField
        label={labels.password}
        name="password"
        autoComplete="new-password"
        hint={labels.rule}
        showLabel={labels.show}
        hideLabel={labels.hide}
      />

      <PasswordField
        label={labels.confirm}
        name="confirm"
        autoComplete="new-password"
        showLabel={labels.show}
        hideLabel={labels.hide}
      />

      <button
        type="submit"
        disabled={pending}
        className="bg-brand-800 text-cream-100 hover:bg-brand-900 h-12 w-full rounded-full text-[11px] font-bold tracking-[0.14em] uppercase transition-colors duration-300 disabled:opacity-50"
      >
        {pending ? labels.saving : labels.submit}
      </button>
    </form>
  );
}
