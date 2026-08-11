import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

import { DesktopNav } from "./DesktopNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { MobileDrawer } from "./MobileDrawer";
import { MobileMenu } from "./MobileMenu";
import { NavShell } from "./NavShell";

export async function Navbar() {
  const t = await getTranslations("nav");

  return (
    <NavShell>
      <Logo />

      <div className="flex items-center gap-3 lg:gap-4">
        <DesktopNav />

        <span aria-hidden className="hidden h-5 w-px bg-brand-900/12 lg:block" />

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher label={t("language")} />

          <Link
            href="/contact-us"
            className="hidden h-9 items-center rounded-full bg-brand-800 px-4 text-[10.5px] font-bold tracking-[0.09em] whitespace-nowrap text-cream-100 uppercase transition-colors duration-200 hover:bg-brand-900 lg:inline-flex"
          >
            {t("cta")}
          </Link>

          <MobileDrawer
            labels={{ open: t("openMenu"), close: t("closeMenu"), title: t("primary") }}
          >
            <MobileMenu />
          </MobileDrawer>
        </div>
      </div>
    </NavShell>
  );
}
