import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";

import "../globals.css";

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

/**
 * The namespaces a client component reads for itself.
 *
 * Everything else is translated on the server and handed over as plain props,
 * so the whole catalogue does not have to travel with every page. Sending all
 * of it put 90KB of terms and itineraries into the HTML of the home page.
 */
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
        {/* The photographs and the flags come from these, so the handshake
            happens while the page is still parsing. */}
        <link rel="preconnect" href={SUPABASE_URL} crossOrigin="" />
        <link rel="preconnect" href="https://flagcdn.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
      </head>
      <body className="bg-cream-50 flex min-h-full flex-col">
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
