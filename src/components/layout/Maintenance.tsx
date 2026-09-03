import { getTranslations } from "next-intl/server";

import { Topo } from "@/components/ui/Topo";
import type { Locale } from "@/i18n/config";

/**
 * What the whole site is while maintenance is on.
 *
 * No navigation and no footer, on purpose. Every link on them goes to a page
 * that is not there, and a visitor who came for one thing and is offered ten
 * dead ends reads it as broken rather than as briefly closed. One sentence,
 * centred, on the same cream the rest of the site opens on, so it still looks
 * like this company rather than like a server error page.
 */
export async function Maintenance({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "maintenance" });

  return (
    <main className="bg-cream-50 relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-20">
      <Topo className="text-brand-800/10" rings={12} seed={28.3} />

      <div className="relative w-full max-w-lg text-center">
        <span className="text-ember-600 flex items-center justify-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
          <span aria-hidden className="bg-ember-500/50 h-px w-8" />
          {t("eyebrow")}
          <span aria-hidden className="bg-ember-500/50 h-px w-8" />
        </span>

        <h1 className="font-display text-brand-900 mt-6 text-[clamp(1.9rem,5vw,2.9rem)] leading-[1.06] font-extrabold tracking-[-0.04em] text-balance">
          {t("title")}
        </h1>

        <p className="text-brand-800/60 mx-auto mt-5 max-w-md text-[15px] leading-[1.85] text-pretty">
          {t("lead")}
        </p>

        <p className="text-brand-800/45 mt-9 text-[13px] leading-relaxed">
          {t("contact")}{" "}
          <a
            href="mailto:offhorizonadventures@gmail.com"
            className="text-brand-900 decoration-ember-500/50 font-semibold underline underline-offset-[3px]"
          >
            offhorizonadventures@gmail.com
          </a>
        </p>
      </div>
    </main>
  );
}
