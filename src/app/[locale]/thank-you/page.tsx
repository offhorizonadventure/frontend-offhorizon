import { getTranslations } from "next-intl/server";

import { ThankYou } from "@/components/ui/ThankYou";
import { locales } from "@/i18n/config";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/thank-you">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "thankYou" });

  return buildMetadata({
    locale,
    path: "/thank-you",
    title: t("meta.title"),
    description: t("meta.description"),
    noIndex: true,
  });
}

export default async function ThankYouPage({
  params,
  searchParams,
}: PageProps<"/[locale]/thank-you">) {
  const locale = await resolveLocale(params);
  const { from } = await searchParams;

  return <ThankYou locale={locale} source={from === "custom" ? "custom" : "quick"} />;
}
