import { getTranslations } from "next-intl/server";

import { AccountControl } from "@/components/auth/AccountControl";
import type { AuthLabels } from "@/components/auth/AuthModal";
import type { Locale } from "@/i18n/config";
import { getUser } from "@/lib/supabase/server";

/**
 * The account control with its labels already resolved.
 *
 * A server component so the copy is translated on the server and the client
 * bundle carries the dialog but not five languages of strings.
 */
export async function AccountDialog({ locale }: { locale: Locale }) {
  const [t, user] = await Promise.all([
    getTranslations({ locale, namespace: "auth" }),
    getUser(),
  ]);

  const labels: AuthLabels = {
    close: t("close"),
    show: t("show"),
    hide: t("hide"),
    or: t("or"),
    google: t("google"),
    facebook: t("facebook"),
    email: t("email"),
    emailPlaceholder: t("emailPlaceholder"),
    password: t("password"),
    name: t("name"),
    namePlaceholder: t("namePlaceholder"),
    phone: t("phone"),
    countryLabel: t("countryLabel"),
    searchLabel: t("searchLabel"),
    login: {
      eyebrow: t("login.eyebrow"),
      title: t("login.title"),
      lead: t("login.lead"),
      submit: t("login.submit"),
      forgot: t("login.forgot"),
      noAccount: t("login.noAccount"),
      join: t("login.join"),
    },
    register: {
      eyebrow: t("register.eyebrow"),
      title: t("register.title"),
      lead: t("register.lead"),
      submit: t("register.submit"),
      terms: t("register.terms"),
      check: t("register.check"),
      haveAccount: t("register.haveAccount"),
      signIn: t("register.signIn"),
    },
    forgot: {
      eyebrow: t("forgot.eyebrow"),
      title: t("forgot.title"),
      lead: t("forgot.lead"),
      submit: t("forgot.submit"),
      back: t("forgot.back"),
      sent: t("forgot.sent"),
    },
    update: {
      eyebrow: t("update.eyebrow"),
      title: t("update.title"),
      lead: t("update.lead"),
      submit: t("update.submit"),
      password: t("update.password"),
      confirm: t("update.confirm"),
      rule: t("update.rule"),
    },
  };

  return (
    <AccountControl
      signedIn={Boolean(user)}
      labels={labels}
      menu={{
        signIn: t("trigger"),
        account: t("menu.account"),
        bookings: t("menu.bookings"),
        payments: t("menu.payments"),
        signOut: t("menu.signOut"),
      }}
    />
  );
}
