import { getTranslations } from "next-intl/server";

import { ArrowRight, Compass } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";

/**
 * What a list shows when the database has nothing in it yet.
 *
 * A blank space reads as a broken page. This says plainly that there are no
 * dated departures here and points at the one thing that is always available,
 * which is asking us to build the trip around your own dates.
 */
export async function EmptyTours({ title, body }: { title?: string; body?: string }) {
  const t = await getTranslations("catalogue.empty");

  return (
    <div className="rounded-[26px] bg-cream-100/70 px-6 py-14 text-center ring-1 ring-brand-900/10 sm:px-10 sm:py-16">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-800 text-cream-100">
        <Compass />
      </span>

      <h3 className="font-display mt-5 text-[clamp(1.2rem,2.4vw,1.6rem)] leading-tight font-extrabold tracking-[-0.03em] text-balance text-brand-900">
        {title ?? t("title")}
      </h3>

      <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-[1.8] text-pretty text-brand-800/60">
        {body ?? t("body")}
      </p>

      <Link
        href="/custom-expeditions"
        className="group mt-7 inline-flex h-12 items-center gap-2.5 rounded-full bg-brand-800 px-7 text-[11px] font-bold tracking-[0.14em] text-cream-100 uppercase transition-colors duration-300 hover:bg-brand-900"
      >
        {t("cta")}
        <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
