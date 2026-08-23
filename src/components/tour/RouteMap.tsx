import Image from "next/image";

import { blurOf, type ImageSource } from "@/lib/image-source";
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
  image: ImageSource;
  alt: string;
}) {
  const t = await getTranslations({ locale, namespace: "tour" });

  return (
    <section className="bg-cream-50 relative overflow-hidden py-18 sm:py-24">
      <Topo className="text-brand-800/12" rings={12} seed={44.7} />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <h2
          data-anim="up"
          className="font-display text-brand-900 text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.1] font-extrabold tracking-[-0.03em]"
        >
          {t("route.title")}
        </h2>

        {/** Next needs dimensions, and a storage URL brings none. */}
        <Image
          data-anim="wipe"
          src={image}
          alt={alt}
          {...blurOf(image)}
          width={2000}
          height={1400}
          sizes="(max-width: 1023px) 92vw, 1100px"
          quality={90}
          className="mt-8 h-auto w-full object-contain"
        />
      </div>
    </section>
  );
}
