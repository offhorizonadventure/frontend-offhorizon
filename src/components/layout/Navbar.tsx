import { getLocale, getTranslations } from "next-intl/server";

import { AccountDialog } from "@/components/auth/AccountDialog";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";

import { DesktopNav } from "./DesktopNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { MobileDrawer } from "./MobileDrawer";
import { MobileMenu } from "./MobileMenu";
import { NavShell } from "./NavShell";

export async function Navbar() {
  const [t, locale] = await Promise.all([getTranslations("nav"), getLocale()]);

  return (
    <NavShell>
      <Logo />

      <div className="flex items-center gap-3 lg:gap-4">
        <DesktopNav />

        <span aria-hidden className="bg-brand-900/12 hidden h-5 w-px lg:block" />

        <div className="flex items-center gap-1 sm:gap-1.5">
          <LanguageSwitcher label={t("language")} />

          <AccountDialog locale={locale as Locale} />

          <Link
            href="/custom-expeditions"
            className="bg-brand-800 text-cream-100 hover:bg-brand-900 hidden h-9 items-center rounded-full px-4 text-[10.5px] font-bold tracking-[0.09em] whitespace-nowrap uppercase transition-colors duration-200 xl:inline-flex"
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
