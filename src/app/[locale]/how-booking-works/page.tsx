import { getTranslations } from "next-intl/server";

import { BookingGuide } from "@/components/booking/BookingGuide";
import { locales } from "@/i18n/config";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/how-booking-works">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "bookingGuide" });

  return buildMetadata({
    locale,
    path: "/how-booking-works",
    title: t("meta.title"),
    description: t("meta.description"),
  });
}

export default async function HowBookingWorksPage({
  params,
}: PageProps<"/[locale]/how-booking-works">) {
  const locale = await resolveLocale(params);

  return <BookingGuide locale={locale} />;
}
