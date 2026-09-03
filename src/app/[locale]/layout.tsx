import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";

import "../globals.css";

import { MetaPixel, MetaPixelFrame } from "@/components/analytics/MetaPixel";
import { TagManager, TagManagerFrame } from "@/components/analytics/TagManager";
import { Termly } from "@/components/analytics/Termly";
import { ScrollMotion } from "@/components/motion/ScrollMotion";
import { SiteSchema } from "@/components/seo/SiteSchema";
import { CountryProbe } from "@/components/ui/CountryProbe";
import { Maintenance } from "@/components/layout/Maintenance";
import { Navbar } from "@/components/layout/Navbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { QuickEnquiryButton } from "@/components/ui/QuickEnquiry";
import { locales } from "@/i18n/config";
import { resolveLocale } from "@/i18n/params";
import { fontVariables } from "@/lib/fonts";
import { isMaintenance } from "@/lib/settings";
import { SUPABASE_URL } from "@/lib/supabase/env";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta" });

  // Every address answers with the same notice while maintenance is on, and a
  // crawler that reads a few of them would otherwise start replacing real
  // pages in the index with it. Told not to, until the site is back.
  const closed = await isMaintenance();

  return buildMetadata({
    locale,
    title: closed ? t("maintenance") : t("title"),
    description: t("description"),
    alternates: false,
    noIndex: closed,
  });
}

const CLIENT_NAMESPACES = ["custom"] as const;

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const locale = await resolveLocale(params);
  const all = await getMessages({ locale });
  const messages = Object.fromEntries(
    CLIENT_NAMESPACES.filter((name) => name in all).map((name) => [name, all[name]]),
  );

  /**
   * Maintenance is decided here, above every page, so there is exactly one
   * place it can be got wrong.
   *
   * The notice is rendered at whatever address was asked for rather than
   * redirected to a page of its own. A redirect would put every visitor on
   * /maintenance and leave them there when the site came back, and search
   * engines would follow it and start replacing real pages with the notice.
   * This way the address a visitor arrived on is the address they reload, and
   * the moment the switch goes off they are on the page they came for.
   *
   * Only the pages. Everything under /api is outside this layout and keeps
   * running, which is the point: the Razorpay webhook still settles payments
   * taken before the site went down, and the nightly job still releases seats.
   */
  const closed = await isMaintenance();

  return (
    <html lang={locale} className={`${fontVariables} h-full`}>
      <head>
        {}
        <link rel="preconnect" href={SUPABASE_URL} crossOrigin="" />
        <link rel="preconnect" href="https://flagcdn.com" crossOrigin="" />
        {/* The reviews widget. Opening the connection early takes the DNS and
            TLS handshake off the time it takes to appear. */}
        <link rel="preconnect" href="https://cdn.trustindex.io" crossOrigin="" />
        <link rel="dns-prefetch" href="https://cdn.trustindex.io" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />

        {}
        <Termly />
        <TagManager />
        <MetaPixel />
      </head>
      <body className="bg-cream-50 flex min-h-full flex-col">
        <TagManagerFrame />
        <MetaPixelFrame />
        {closed ? (
          <Maintenance locale={locale} />
        ) : (
          <NextIntlClientProvider messages={messages}>
            <SiteSchema locale={locale} />
            <ScrollMotion />
            <CountryProbe />
            <Navbar />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <QuickEnquiryButton locale={locale} />
          </NextIntlClientProvider>
        )}
      </body>
    </html>
  );
}
