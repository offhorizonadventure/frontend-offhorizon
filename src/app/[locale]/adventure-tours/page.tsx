import { permanentRedirect } from "next/navigation";

import { resolveLocale } from "@/i18n/params";
import { locales } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function AdventureToursPage({
  params,
}: PageProps<"/[locale]/adventure-tours">) {
  const locale = await resolveLocale(params);

  permanentRedirect(`/${locale}/calendar`);
}
