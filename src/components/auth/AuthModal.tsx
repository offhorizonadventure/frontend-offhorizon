"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

import { AuthShell, type Phase } from "@/components/auth/AuthShell";
import {
  Field,
  PasswordField,
  PrimaryButton,
  SocialButtons,
  fieldClass,
} from "@/components/auth/fields";
import { PhoneField } from "@/components/ui/PhoneField";
import { requestPasswordReset, signIn, signInWith, signUp, updatePassword } from "@/lib/auth";

export type AuthView = "login" | "register" | "forgot" | "update";

export type AuthLabels = {
  close: string;
  show: string;
  hide: string;
  or: string;
  google: string;
  facebook: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  name: string;
  namePlaceholder: string;
  phone: string;
  countryLabel: string;
  searchLabel: string;

  login: {
    eyebrow: string;
    title: string;
    lead: string;
    submit: string;
    forgot: string;
    noAccount: string;
    join: string;
  };
  register: {
    eyebrow: string;
    title: string;
    lead: string;
    submit: string;
    terms: string;
    check: string;
    haveAccount: string;
    signIn: string;
  };
  forgot: {
    eyebrow: string;
    title: string;
    lead: string;
    submit: string;
    back: string;
    sent: string;
  };
  update: {
    eyebrow: string;
    title: string;
    lead: string;
    submit: string;
    password: string;
    confirm: string;
    rule: string;
  };
};

const linkClass =
  "font-semibold text-brand-900 underline decoration-ember-500/50 underline-offset-[3px] transition-colors hover:decoration-ember-500";

export function AuthModal({
  labels,
  onClose,
  view: initialView = "login",
}: {
  labels: AuthLabels;
  onClose: () => void;
  view?: AuthView;
}) {
  const [phase, setPhase] = useState<Phase>("open");
  const [view, setView] = useState<AuthView>(initialView);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const titleId = useId();
  const router = useRouter();

  const copy = labels[view];

  const show = (next: AuthView) => {
    setError(null);
    setDone(null);
    setView(next);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    setPending(true);
    setError(null);

    const result =
      view === "login"
        ? await signIn(email, password)
        : view === "register"
          ? await signUp(email, password, {
              name: String(form.get("name") ?? "").trim(),
              phone: String(form.get("phone") ?? "").trim(),
            })
          : view === "forgot"
            ? await requestPasswordReset(email)
            : await updatePassword(password);

    setPending(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (view === "forgot") {
      setDone(labels.forgot.sent);
      return;
    }

    if (view === "register") {
      setDone(labels.register.check);
      return;
    }

    setPhase("closing");
    router.refresh();
  }

  async function handleProvider(provider: "google" | "facebook") {
    setPending(true);
    setError(null);

    const result = await signInWith(provider);
    if (result.error) {
      setPending(false);
      setError(result.error);
    }
  }

  return (
    <>
      <AuthShell
        phase={phase}
        onPhaseChange={(next) => {
          setPhase(next);
          if (next === "closed") onClose();
        }}
        titleId={titleId}
        eyebrow={copy.eyebrow}
        title={copy.title}
        lead={copy.lead}
        closeLabel={labels.close}
        footer={
          view === "login" ? (
            <>
              {labels.login.noAccount}{" "}
              <button type="button" className={linkClass} onClick={() => show("register")}>
                {labels.login.join}
              </button>
            </>
          ) : view === "register" ? (
            <>
              {labels.register.haveAccount}{" "}
              <button type="button" className={linkClass} onClick={() => show("login")}>
                {labels.register.signIn}
              </button>
            </>
          ) : view === "forgot" ? (
            <button type="button" className={linkClass} onClick={() => show("login")}>
              {labels.forgot.back}
            </button>
          ) : null
        }
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          {(view === "login" || view === "register") && (
            <SocialButtons
              google={labels.google}
              facebook={labels.facebook}
              divider={labels.or}
              onProvider={handleProvider}
              disabled={pending}
            />
          )}

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-600/10 px-4 py-3 text-[13px] leading-relaxed text-red-700"
            >
              {error}
            </p>
          )}

          {done && (
            <p className="bg-brand-800/8 text-brand-900/75 rounded-xl px-4 py-3 text-[13px] leading-relaxed">
              {done}
            </p>
          )}

          {view === "register" && (
            <Field label={labels.name}>
              {(id) => (
                <input
                  id={id}
                  name="name"
                  autoComplete="name"
                  placeholder={labels.namePlaceholder}
                  className={fieldClass}
                />
              )}
            </Field>
          )}

          {view === "register" && (
            <Field label={labels.phone}>
              {(id) => (
                <PhoneField
                  id={id}
                  name="phone"
                  countryLabel={labels.countryLabel}
                  searchLabel={labels.searchLabel}
                />
              )}
            </Field>
          )}

          {view !== "update" && (
            <Field label={labels.email}>
              {(id) => (
                <input
                  id={id}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={labels.emailPlaceholder}
                  className={fieldClass}
                />
              )}
            </Field>
          )}

          {view === "login" && (
            <PasswordField
              label={labels.password}
              name="password"
              autoComplete="current-password"
              showLabel={labels.show}
              hideLabel={labels.hide}
            />
          )}

          {view === "register" && (
            <PasswordField
              label={labels.password}
              name="password"
              autoComplete="new-password"
              hint={labels.update.rule}
              showLabel={labels.show}
              hideLabel={labels.hide}
            />
          )}

          {view === "update" && (
            <>
              <PasswordField
                label={labels.update.password}
                name="password"
                autoComplete="new-password"
                hint={labels.update.rule}
                showLabel={labels.show}
                hideLabel={labels.hide}
              />
              <PasswordField
                label={labels.update.confirm}
                name="confirm"
                autoComplete="new-password"
                showLabel={labels.show}
                hideLabel={labels.hide}
              />
            </>
          )}

          {view === "login" && (
            <div className="flex justify-end">
              <button type="button" className={linkClass} onClick={() => show("forgot")}>
                {labels.login.forgot}
              </button>
            </div>
          )}

          <PrimaryButton pending={pending}>{copy.submit}</PrimaryButton>

          {view === "register" && (
            <p className="text-brand-800/50 text-center text-[12px] leading-relaxed">
              {labels.register.terms}
            </p>
          )}
        </form>
      </AuthShell>
    </>
  );
}
