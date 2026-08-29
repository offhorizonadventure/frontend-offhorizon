import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import notFoundImage from "../../../public/destinations/pages/manali-to-leh.jpg";

import { ArrowRight } from "@/components/ui/icons";
import { Topo } from "@/components/ui/Topo";
import { Link } from "@/i18n/navigation";

const LINKS = [
  { key: "home", href: "/" },
  { key: "tours", href: "/calendar" },
  { key: "destinations", href: "/destinations" },
  { key: "contact", href: "/contact-us" },
] as const;

/** Shown for any address under a locale that does not exist. */
export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "notFound" });

  return (
    <>
      <section className="bg-brand-950 text-cream-100 relative flex min-h-[78vh] items-center overflow-hidden pt-32 pb-20 sm:pt-40">
        <Image
          src={notFoundImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div
          aria-hidden
          className="from-brand-950 via-brand-950/85 to-brand-950/55 absolute inset-0 bg-gradient-to-r"
        />
        <Topo className="text-cream-100/10" rings={14} seed={44.3} />

        <div className="relative mx-auto w-full max-w-3xl px-5 sm:px-8">
          <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
            <span aria-hidden className="bg-ember-500/60 h-px w-8" />
            {t("eyebrow")}
          </span>

          <h1 className="font-display mt-5 text-[clamp(2rem,5vw,3.2rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-balance">
            {t("title")}
          </h1>

          <p className="text-cream-100/60 mt-5 max-w-xl text-[15px] leading-[1.8] text-pretty">
            {t("lead")}
          </p>

          <ul className="border-cream-100/12 mt-10 grid border-t border-l sm:grid-cols-2">
            {LINKS.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  className="group border-cream-100/12 hover:bg-cream-100/5 flex items-center justify-between border-r border-b px-6 py-5 transition-colors duration-300"
                >
                  <span className="text-[13px] font-semibold tracking-[0.02em]">
                    {t(`links.${link.key}`)}
                  </span>
                  <ArrowRight className="text-ember-500 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
