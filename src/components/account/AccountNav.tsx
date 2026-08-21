"use client";

import { usePathname } from "next/navigation";

import { Link } from "@/i18n/navigation";

const TABS = [
  { href: "/account", label: "My profile" },
  { href: "/account/bookings", label: "My bookings" },
  { href: "/account/payments", label: "My payments" },
] as const;

/** The section nav, marking the deepest match rather than every prefix, so "My profile" does not stay lit while you are on Bookings. */
export function AccountNav() {
  const pathname = usePathname();

  const active = TABS.map((tab) => tab.href)
    .filter((href) => pathname === href || pathname.endsWith(href))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <nav
      aria-label="Account"
      className="border-brand-900/12 -mb-px flex gap-1 overflow-x-auto border-b pt-10"
    >
      {TABS.map((tab) => {
        const current = tab.href === active;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={current ? "page" : undefined}
            className={`border-b-2 px-4 py-3 text-[12px] font-bold tracking-[0.1em] whitespace-nowrap uppercase transition-colors ${
              current
                ? "border-ember-500 text-brand-900"
                : "text-brand-800/45 hover:text-brand-900 border-transparent"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
