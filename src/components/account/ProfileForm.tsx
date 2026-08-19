"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Field, Panel, PrimaryButton, fieldClass } from "@/components/account/parts";
import { PhoneField } from "@/components/ui/PhoneField";
import { updateProfile } from "@/lib/auth";
import { splitPhone } from "@/lib/phone";

/**
 * Name and phone on the account.
 *
 * The email address is shown but not editable: changing it means confirming the
 * new one before the old one stops working, which is a journey of its own and
 * not a field on a settings page.
 */
export function ProfileForm({
  email,
  name,
  phone,
}: {
  email: string;
  name: string;
  phone: string;
}) {
  // Nothing about an account requires a number, but every departure does: it is
  // how we reach someone about weather, a permit or a changed start time.
  const missingPhone = !phone.trim();

  // The dial code is part of the stored number, so it has to be handed back to
  // the picker: without it the field reopens on the visitor's own country and
  // saving would rewrite a +91 number as +1.
  const dialled = splitPhone(phone);
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setPending(true);
    setError(null);
    setSaved(false);

    const result = await updateProfile({
      name: String(form.get("name") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
    });

    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSaved(true);
    // The heading greets you by name, and it is rendered on the server.
    router.refresh();
  }

  return (
    <Panel title="My profile" lead="The name and number we use when we call about a departure.">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <p role="alert" className="rounded-xl bg-red-600/10 px-4 py-3 text-[13px] text-red-700">
            {error}
          </p>
        )}

        {saved && (
          <p className="rounded-xl bg-brand-800/8 px-4 py-3 text-[13px] text-brand-900/75">
            Saved.
          </p>
        )}

        {missingPhone && !saved && (
          <p className="rounded-xl bg-ember-500/10 px-4 py-3 text-[13px] leading-relaxed text-brand-900/75">
            Add a phone number. It is how we reach you about weather, permits or a changed start
            time, and signing in with Google or Facebook does not give us one.
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Full name">
            <input name="name" defaultValue={name} className={fieldClass} />
          </Field>

          <div className="space-y-2">
            <span className="block text-[10.5px] font-bold tracking-[0.16em] text-brand-600 uppercase">
              Phone
            </span>
            <PhoneField
              id="account-phone"
              name="phone"
              countryLabel="Country code"
              searchLabel="Search countries"
              defaultCountry={dialled.country}
              defaultNumber={dialled.number}
            />
          </div>
        </div>

        <Field label="Email">
          <input
            value={email}
            readOnly
            className={`${fieldClass} cursor-not-allowed bg-brand-900/5 text-brand-800/60`}
          />
        </Field>

        <p className="-mt-3 text-[12px] text-brand-800/50">
          Changing the address on an account means confirming the new one first, so it is not done
          here.
        </p>

        <PrimaryButton>{pending ? "Saving…" : "Save changes"}</PrimaryButton>
      </form>
    </Panel>
  );
}
