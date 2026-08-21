import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";

import "../globals.css";

import { ScrollMotion } from "@/components/motion/ScrollMotion";
import { CountryProbe } from "@/components/ui/CountryProbe";
import { Navbar } from "@/components/layout/Navbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { QuickEnquiryButton } from "@/components/ui/QuickEnquiry";
import { locales } from "@/i18n/config";
import { resolveLocale } from "@/i18n/params";
import { fontVariables } from "@/lib/fonts";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta" });

  return buildMetadata({ locale, title: t("title"), description: t("description") });
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const locale = await resolveLocale(params);

  return (
    <html lang={locale} className={`${fontVariables} h-full`}>
      <body className="bg-cream-50 flex min-h-full flex-col">
        <NextIntlClientProvider>
          <ScrollMotion />
          <CountryProbe />
          <Navbar />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <QuickEnquiryButton locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
