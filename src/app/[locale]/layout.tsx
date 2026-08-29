import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";

import "../globals.css";

import { MetaPixel, MetaPixelFrame } from "@/components/analytics/MetaPixel";
import { TagManager, TagManagerFrame } from "@/components/analytics/TagManager";
import { Termly } from "@/components/analytics/Termly";
import { ScrollMotion } from "@/components/motion/ScrollMotion";
import { SiteSchema } from "@/components/seo/SiteSchema";
import { CountryProbe } from "@/components/ui/CountryProbe";
import { Navbar } from "@/components/layout/Navbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { QuickEnquiryButton } from "@/components/ui/QuickEnquiry";
import { locales } from "@/i18n/config";
import { resolveLocale } from "@/i18n/params";
import { fontVariables } from "@/lib/fonts";
import { SUPABASE_URL } from "@/lib/supabase/env";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta" });

  return buildMetadata({
    locale,
    title: t("title"),
    description: t("description"),
    alternates: false,
  });
}

const CLIENT_NAMESPACES = ["custom"] as const;

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const locale = await resolveLocale(params);
  const all = await getMessages({ locale });
  const messages = Object.fromEntries(
    CLIENT_NAMESPACES.filter((name) => name in all).map((name) => [name, all[name]]),
  );

  return (
    <html lang={locale} className={`${fontVariables} h-full`}>
      <head>
        {}
        <link rel="preconnect" href={SUPABASE_URL} crossOrigin="" />
        <link rel="preconnect" href="https://flagcdn.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />

        {}
        <Termly />
        <TagManager />
        <MetaPixel />
      </head>
      <body className="bg-cream-50 flex min-h-full flex-col">
        <TagManagerFrame />
        <MetaPixelFrame />
        <NextIntlClientProvider messages={messages}>
          <SiteSchema locale={locale} />
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
