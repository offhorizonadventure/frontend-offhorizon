import { ChevronDown } from "@/components/ui/icons";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { siteUrl } from "@/lib/seo";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({
  crumbs,
  locale,
  tone = "dark",
}: {
  crumbs: Crumb[];
  locale: Locale;
  tone?: "dark" | "light";
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      ...(crumb.href ? { item: `${siteUrl}/${locale}${crumb.href}` } : {}),
    })),
  };

  const muted = tone === "dark" ? "text-cream-100/45" : "text-brand-800/45";
  const active = tone === "dark" ? "text-cream-100/80" : "text-brand-800/80";
  const hover = tone === "dark" ? "hover:text-cream-100" : "hover:text-brand-900";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />

      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] font-bold tracking-[0.14em] uppercase">
          {crumbs.map((crumb, index) => (
            <li key={crumb.label} className="flex items-center gap-2">
              {crumb.href ? (
                <Link href={crumb.href} className={`${muted} ${hover} transition-colors`}>
                  {crumb.label}
                </Link>
              ) : (
                <span className={active} aria-current="page">
                  {crumb.label}
                </span>
              )}

              {index < crumbs.length - 1 && (
                <ChevronDown className={`size-3 -rotate-90 ${muted}`} />
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
