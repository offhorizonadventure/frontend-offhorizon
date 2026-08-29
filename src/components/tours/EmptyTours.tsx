import { getTranslations } from "next-intl/server";

import { ArrowRight, Compass } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";

export async function EmptyTours({ title, body }: { title?: string; body?: string }) {
  const t = await getTranslations("catalogue.empty");

  return (
    <div className="bg-cream-100/70 ring-brand-900/10 rounded-[26px] px-6 py-14 text-center ring-1 sm:px-10 sm:py-16">
      <span className="bg-brand-800 text-cream-100 mx-auto grid size-12 place-items-center rounded-full">
        <Compass />
      </span>

      <h3 className="font-display text-brand-900 mt-5 text-[clamp(1.2rem,2.4vw,1.6rem)] leading-tight font-extrabold tracking-[-0.03em] text-balance">
        {title ?? t("title")}
      </h3>

      <p className="text-brand-800/60 mx-auto mt-3 max-w-md text-[14.5px] leading-[1.8] text-pretty">
        {body ?? t("body")}
      </p>

      <Link
        href="/custom-expeditions"
        className="group bg-brand-800 text-cream-100 hover:bg-brand-900 mt-7 inline-flex h-12 items-center gap-2.5 rounded-full px-7 text-[11px] font-bold tracking-[0.14em] uppercase transition-colors duration-300"
      >
        {t("cta")}
        <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
