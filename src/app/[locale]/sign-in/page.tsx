import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { SignInPanel } from "@/components/auth/SignInPanel";
import { Topo } from "@/components/ui/Topo";
import { resolveLocale } from "@/i18n/params";
import { safeNext } from "@/lib/next-path";
import { getUser } from "@/lib/supabase/server";

export function generateMetadata(): Metadata {
  return { title: "Sign in", robots: { index: false, follow: false } };
}

export default async function SignInPage({ params, searchParams }: PageProps<"/[locale]/sign-in">) {
  const locale = await resolveLocale(params);
  const query = await searchParams;
  const next = safeNext(query.next);

  // Already signed in, so there is nothing to ask. This is also what makes the
  // whole thing work on a second click of the same link from the email.
  if (await getUser()) redirect(next);

  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <section className="bg-brand-950 text-cream-100 relative flex min-h-[70vh] items-center overflow-hidden py-28">
      <Topo className="text-cream-100/10" rings={13} seed={52.1} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_55%_at_50%_0%,rgba(180,95,43,0.22),transparent_72%)]"
      />

      <div className="relative mx-auto w-full max-w-md px-5 sm:px-8">
        <div className="bg-paper rounded-[28px] p-7 sm:p-9">
          <span className="text-ember-600 flex items-center gap-2.5 text-[10px] font-bold tracking-[0.2em] uppercase">
            <span aria-hidden className="bg-ember-500/60 h-px w-6" />
            {t("login.eyebrow")}
          </span>

          <h1 className="font-display text-brand-900 mt-4 text-[clamp(1.5rem,3.6vw,1.9rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance">
            {t("login.title")}
          </h1>

          <p className="text-brand-800/60 mt-3 text-[13.5px] leading-[1.7] text-pretty">
            {t("login.protected")}
          </p>

          <div className="mt-7">
            <SignInPanel
              next={next}
              labels={{
                email: t("email"),
                emailPlaceholder: t("emailPlaceholder"),
                password: t("password"),
                submit: t("login.submit"),
                show: t("show"),
                hide: t("hide"),
                or: t("or"),
                google: t("google"),
                facebook: t("facebook"),
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
