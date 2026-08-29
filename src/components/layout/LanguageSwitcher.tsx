"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";

import { Flag } from "@/components/ui/Flag";
import { ChevronDown } from "@/components/ui/icons";
import { locales, marketFor, type Locale } from "@/i18n/config";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

const NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  es: "Español",
};

type LanguageSwitcherProps = {
  label: string;
  variant?: "menu" | "row";
};

export function LanguageSwitcher({ label, variant = "menu" }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const active = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (variant === "row") {
    return (
      <ul className="flex items-center gap-1.5" aria-label={label}>
        {locales.map((locale) => (
          <li key={locale}>
            <Link
              href={pathname}
              locale={locale}
              hrefLang={locale}
              lang={locale}
              aria-current={locale === active ? "true" : undefined}
              className={cn(
                "flex size-9 items-center justify-center rounded-full border transition-colors",
                locale === active
                  ? "border-brand-800 bg-brand-800/8"
                  : "border-brand-900/10 hover:bg-white",
              )}
            >
              <Flag country={marketFor(locale).flag} alt={NAMES[locale]} />
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        className="hover:bg-cream-100 flex h-9 items-center gap-1.5 rounded-full px-2.5 transition-colors"
      >
        <Flag country={marketFor(active).flag} />
        <span className="text-brand-800 hidden text-[11px] font-bold tracking-[0.1em] uppercase sm:inline">
          {active}
        </span>
        <ChevronDown
          className={cn(
            "text-brand-700 hidden transition-transform duration-300 sm:block",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        role="menu"
        className={cn(
          "border-brand-900/10 ease-out-expo absolute right-0 z-50 mt-3 w-48 origin-top-right rounded-2xl border bg-white p-1.5 transition-all duration-200",
          open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0",
        )}
      >
        {locales.map((locale) => (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            hrefLang={locale}
            lang={locale}
            role="menuitem"
            aria-current={locale === active ? "true" : undefined}
            onClick={() => setOpen(false)}
            className={cn(
              "hover:bg-cream-100 flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] transition-colors",
              locale === active ? "text-brand-800 font-bold" : "text-brand-900/80 font-medium",
            )}
          >
            <Flag country={marketFor(locale).flag} />
            {NAMES[locale]}
          </Link>
        ))}
      </div>
    </div>
  );
}
