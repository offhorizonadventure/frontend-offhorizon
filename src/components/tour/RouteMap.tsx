import Image, { type StaticImageData } from "next/image";
import { getTranslations } from "next-intl/server";

import { Topo } from "@/components/ui/Topo";
import type { Locale } from "@/i18n/config";

/** Route map. Section title and the artwork, nothing else. */
export async function RouteMap({
  locale,
  image,
  alt,
}: {
  locale: Locale;
  image: StaticImageData;
  alt: string;
}) {
  const t = await getTranslations({ locale, namespace: "tour" });

  return (
    <section className="relative overflow-hidden bg-cream-50 py-18 sm:py-24">
      <Topo className="text-brand-800/12" rings={12} seed={44.7} />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <h2
          data-anim="up"
          className="font-display text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-brand-900"
        >
          {t("route.title")}
        </h2>

        <Image
          data-anim="wipe"
          src={image}
          alt={alt}
          placeholder="blur"
          sizes="(max-width: 1023px) 92vw, 1100px"
          className="mt-8 h-auto w-full object-contain"
        />
      </div>
    </section>
  );
}
