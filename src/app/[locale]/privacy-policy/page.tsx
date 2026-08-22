import { getTranslations } from "next-intl/server";

import { LegalPage } from "@/components/legal/LegalPage";
import { locales } from "@/i18n/config";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy-policy">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "legal" });

  return buildMetadata({
    locale,
    path: "/privacy-policy",
    title: t("privacy.meta.title"),
    description: t("privacy.meta.description"),
  });
}

export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacy-policy">) {
  const locale = await resolveLocale(params);

  return <LegalPage locale={locale} namespace="privacy" />;
}
