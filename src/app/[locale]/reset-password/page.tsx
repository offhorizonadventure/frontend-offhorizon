import { getTranslations } from "next-intl/server";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Topo } from "@/components/ui/Topo";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata } from "@/lib/seo";
import { getUser } from "@/lib/supabase/server";

/** Where a password reset link lands. */
export async function generateMetadata({ params }: PageProps<"/[locale]/reset-password">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "auth.reset" });

  return buildMetadata({
    locale,
    path: "/reset-password",
    title: t("title"),
    description: t("lead"),
    // A one-time page behind a mailed link has nothing to offer a crawler.
    noIndex: true,
  });
}

export default async function ResetPasswordPage({ params }: PageProps<"/[locale]/reset-password">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "auth" });
  const user = await getUser();

  return (
    <section className="bg-brand-950 text-cream-100 relative flex min-h-[70vh] items-center overflow-hidden py-28">
      <Topo className="text-cream-100/10" rings={13} seed={44.6} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_55%_at_50%_0%,rgba(180,95,43,0.22),transparent_72%)]"
      />

      <div className="relative mx-auto w-full max-w-md px-5 sm:px-8">
        <div className="bg-paper rounded-[28px] p-7 sm:p-9">
          <span className="text-ember-600 flex items-center gap-2.5 text-[10px] font-bold tracking-[0.2em] uppercase">
            <span aria-hidden className="bg-ember-500/60 h-px w-6" />
            {t("update.eyebrow")}
          </span>

          <h1 className="font-display text-brand-900 mt-4 text-[clamp(1.5rem,3.6vw,1.9rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance">
            {user ? t("reset.title") : t("reset.expiredTitle")}
          </h1>

          <p className="text-brand-800/60 mt-3 text-[13.5px] leading-[1.7] text-pretty">
            {user ? t("reset.lead") : t("reset.expiredLead")}
          </p>

          <div className="mt-7">
            {user ? (
              <ResetPasswordForm
                labels={{
                  password: t("update.password"),
                  confirm: t("update.confirm"),
                  rule: t("update.rule"),
                  submit: t("update.submit"),
                  saving: t("reset.saving"),
                  mismatch: t("reset.mismatch"),
                  tooShort: t("reset.tooShort"),
                  show: t("show"),
                  hide: t("hide"),
                }}
              />
            ) : (
              <Link
                href="/"
                className="bg-brand-800 text-cream-100 hover:bg-brand-900 flex h-12 w-full items-center justify-center rounded-full text-[11px] font-bold tracking-[0.14em] uppercase transition-colors duration-300"
              >
                {t("reset.startAgain")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
