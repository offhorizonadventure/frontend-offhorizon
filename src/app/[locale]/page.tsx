import { getTranslations } from "next-intl/server";

import { Experiences } from "@/components/home/Experiences";
import { Hero } from "@/components/home/Hero";
import { Partners } from "@/components/home/Partners";
import { UpcomingTours } from "@/components/home/UpcomingTours";
import { WhyDifferent } from "@/components/home/WhyDifferent";
import { BookConfidence } from "@/components/home/BookConfidence";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "meta" });

  return buildMetadata({ locale, path: "/", title: t("title"), description: t("description") });
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  await resolveLocale(params);

  return (
    <>
      <Hero />
      <Partners />
      <Experiences />
      <UpcomingTours />
      <WhyDifferent />
      <BookConfidence />
    </>
  );
}
