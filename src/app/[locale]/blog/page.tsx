import Image from "next/image";
import { getFormatter, getTranslations } from "next-intl/server";

import { ArrowRight } from "@/components/ui/icons";
import { Topo } from "@/components/ui/Topo";
import { imageUrl, listPosts, readingMinutes } from "@/lib/blog";
import { locales } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata, siteName, siteUrl } from "@/lib/seo";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/** Rebuilt at most every ten minutes. */
export const revalidate = 600;

export async function generateMetadata({ params }: PageProps<"/[locale]/blog">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "blog.meta" });

  return buildMetadata({
    locale,
    path: "/blog",
    title: t("title"),
    description: t("description"),
  });
}

export default async function BlogPage({ params }: PageProps<"/[locale]/blog">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "blog" });
  const format = await getFormatter({ locale });

  const posts = await listPosts();
  const [featured, ...rest] = posts;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: t("meta.title"),
    description: t("meta.description"),
    url: `${siteUrl}/${locale}/blog`,
    publisher: { "@type": "Organization", name: siteName },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      datePublished: post.published_at ?? post.updated_at,
      url: `${siteUrl}/${locale}/blog/${post.slug}`,
    })),
  };

  const date = (value: string) =>
    format.dateTime(new Date(value), { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />

      <section className="bg-brand-950 text-cream-100 relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
        <Topo className="text-cream-100/12" rings={16} seed={14.9} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_0%,rgba(180,95,43,0.24),transparent_72%)]"
        />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <span className="hero-rise text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
            <span aria-hidden className="bg-ember-500/60 h-px w-8" />
            {t("hero.eyebrow")}
          </span>

          <h1
            className="hero-rise font-display mt-6 max-w-3xl text-[clamp(2.2rem,5.2vw,3.9rem)] leading-[1.03] font-extrabold tracking-[-0.04em] text-balance"
            style={{ animationDelay: "80ms" }}
          >
            {t("hero.title")}
          </h1>

          <p
            className="hero-rise text-cream-100/60 mt-6 max-w-xl text-[15px] leading-[1.85] text-pretty sm:text-[16px]"
            style={{ animationDelay: "160ms" }}
          >
            {t("hero.lead")}
          </p>
        </div>
      </section>

      <section className="bg-cream-50 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          {!featured && (
            <p className="text-brand-800/55 py-16 text-center text-[15px]">{t("empty")}</p>
          )}

          {/* Latest post gets the full width; the rest fall into a grid. */}
          {featured && (
            <article data-anim="up">
              <Link
                href={`/blog/${featured.slug}`}
                className="group grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12"
              >
                <div className="lg:col-span-7">
                  <div className="bg-brand-100 ring-brand-900/10 relative aspect-[16/11] overflow-hidden rounded-[26px] ring-1">
                    {imageUrl(featured.cover_path) && (
                      <Image
                        src={imageUrl(featured.cover_path)!}
                        alt={featured.cover_alt ?? ""}
                        fill
                        priority
                        sizes="(max-width: 1023px) 92vw, 640px"
                        className="ease-out-expo object-cover transition-transform duration-[1100ms] group-hover:scale-[1.04]"
                      />
                    )}
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.16em] uppercase">
                    <span className="text-ember-600">
                      {date(featured.published_at ?? featured.updated_at)}
                    </span>
                    <span aria-hidden className="bg-brand-300 size-1 rounded-full" />
                    <span className="text-brand-500">
                      {t("readingTime", { minutes: readingMinutes(featured.body) })}
                    </span>
                  </div>

                  <h2 className="font-display text-brand-900 mt-4 text-[clamp(1.6rem,3.2vw,2.4rem)] leading-[1.1] font-extrabold tracking-[-0.035em] text-balance">
                    {featured.title}
                  </h2>

                  <p className="text-brand-800/60 mt-4 text-[15px] leading-[1.8] text-pretty">
                    {featured.excerpt}
                  </p>

                  <span className="text-brand-800 mt-7 inline-flex items-center gap-2.5 text-[11px] font-bold tracking-[0.14em] uppercase">
                    <span
                      aria-hidden
                      className="bg-brand-800 ease-out-expo h-px w-8 transition-all duration-500 group-hover:w-14"
                    />
                    {t("readPost")}
                    <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </article>
          )}

          {rest.length > 0 && (
            <ul
              data-anim-group
              className="border-brand-900/10 mt-16 grid gap-8 border-t pt-12 sm:mt-20 md:grid-cols-2 lg:grid-cols-3"
            >
              {rest.map((post) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className="group block">
                    <div className="bg-brand-100 ring-brand-900/10 relative aspect-[16/11] overflow-hidden rounded-[20px] ring-1">
                      {imageUrl(post.cover_path) && (
                        <Image
                          src={imageUrl(post.cover_path)!}
                          alt={post.cover_alt ?? ""}
                          fill
                          sizes="(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 360px"
                          className="ease-out-expo object-cover transition-transform duration-[900ms] group-hover:scale-[1.05]"
                        />
                      )}
                    </div>

                    <div className="mt-5 flex items-center gap-3 text-[10px] font-bold tracking-[0.16em] uppercase">
                      <span className="text-ember-600">
                        {date(post.published_at ?? post.updated_at)}
                      </span>
                      <span aria-hidden className="bg-brand-300 size-1 rounded-full" />
                      <span className="text-brand-500">
                        {t("readingTime", { minutes: readingMinutes(post.body) })}
                      </span>
                    </div>

                    <h3 className="font-display text-brand-900 mt-3 text-[18px] leading-tight font-bold tracking-[-0.02em] text-balance">
                      {post.title}
                    </h3>

                    <p className="text-brand-800/55 mt-2.5 text-[14px] leading-relaxed">
                      {post.excerpt}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
