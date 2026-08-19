"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

import { AuthShell, type Phase } from "@/components/auth/AuthShell";
import { Field, PasswordField, PrimaryButton, SocialButtons, fieldClass } from "@/components/auth/fields";
import { PhoneField } from "@/components/ui/PhoneField";
import {
  requestPasswordReset,
  signIn,
  signInWith,
  signUp,
  updatePassword,
} from "@/lib/auth";

/**
 * Which of the four screens the dialog is showing.
 *
 * One dialog, four views, rather than four dialogs: signing in, joining and
 * resetting a password are the same conversation, and closing one to open
 * another loses whatever was typed and flashes the page behind.
 */
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

  login: { eyebrow: string; title: string; lead: string; submit: string; forgot: string; noAccount: string; join: string };
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
  forgot: { eyebrow: string; title: string; lead: string; submit: string; back: string; sent: string };
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

/**
 * The account dialog.
 *
 * Controlled from outside rather than owning its own trigger: whatever opens it
 * lives in the navigation bar, and a component cannot be handed a render
 * function across the server boundary.
 *
 * Design only for now: nothing is submitted anywhere. The forms are marked up
 * as real forms with the right autocomplete hints, so wiring them to Supabase
 * later is a matter of adding an action, not rebuilding the screen.
 */
export function AuthModal({
  labels,
  onClose,
  view: initialView = "login",
}: {
  labels: AuthLabels;
  /** Called once the exit animation has finished, not when close is asked for. */
  onClose: () => void;
  view?: AuthView;
}) {
  // Mounted only while open, so it starts open and unmounts itself on the way
  // out. Deriving the phase from a prop instead would mean syncing state in an
  // effect, and the exit animation would never get to play.
  const [phase, setPhase] = useState<Phase>("open");
  const [view, setView] = useState<AuthView>(initialView);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const titleId = useId();
  const router = useRouter();

  const copy = labels[view];

  /** Clears whatever the last view was saying before showing another. */
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
      // Deliberately the same message whether or not the address is registered.
      setDone(labels.forgot.sent);
      return;
    }

    if (view === "register") {
      setDone(labels.register.check);
      return;
    }

    // Signed in: the page has to be re-rendered on the server for the navigation
    // bar and the account pages to see the new session.
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
    // On success the browser leaves for the provider, so nothing is reset here.
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
            <p className="rounded-xl bg-brand-800/8 px-4 py-3 text-[13px] leading-relaxed text-brand-900/75">
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
            <p className="text-center text-[12px] leading-relaxed text-brand-800/50">
              {labels.register.terms}
            </p>
          )}


        </form>
      </AuthShell>
    </>
  );
}
