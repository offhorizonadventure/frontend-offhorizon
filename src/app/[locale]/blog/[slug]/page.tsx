import Image from "next/image";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";

import { RichBody } from "@/components/blog/RichBody";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { ArrowRight } from "@/components/ui/icons";
import { Topo } from "@/components/ui/Topo";
import { getPost, imageUrl, listPosts, plainText, readingMinutes, wordCount } from "@/lib/blog";
import { locales } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata, siteName, siteUrl } from "@/lib/seo";

/**
 * Built on first request and cached, rather than enumerated at build time.
 *
 * Posts are written after the site is deployed, and a list baked at build time
 * would mean a redeploy for every article. `dynamicParams` lets an unknown slug
 * render once and then be served from the cache like any other.
 */
export const revalidate = 600;
export const dynamicParams = true;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale, slug: "" })).filter(() => false);
}

export async function generateMetadata({ params }: PageProps<"/[locale]/blog/[slug]">) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return buildMetadata({
    locale,
    path: `/blog/${post.slug}`,
    title: post.title,
    description: post.excerpt ?? "",
    type: "article",
    publishedTime: post.published_at ?? post.updated_at,
    modifiedTime: post.updated_at,
    readingMinutes: readingMinutes(post.body),
  });
}

export default async function PostPage({ params }: PageProps<"/[locale]/blog/[slug]">) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: "blog" });
  const format = await getFormatter({ locale });

  const url = `${siteUrl}/${locale}/blog/${post.slug}`;
  const others = (await listPosts()).filter((item) => item.slug !== post.slug).slice(0, 3);

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? plainText(post.body).slice(0, 200),
    image: imageUrl(post.cover_path) ?? undefined,
    datePublished: post.published_at ?? post.updated_at,
    dateModified: post.updated_at,
    wordCount: wordCount(post.body),
    inLanguage: locale,
    author: { "@type": "Organization", name: siteName },
    publisher: { "@type": "Organization", name: siteName },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const publishedAt = post.published_at ?? post.updated_at;
  const published = format.dateTime(new Date(publishedAt), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <ReadingProgress target="#post-body" />

      <article>
        <header className="relative overflow-hidden bg-brand-950 pt-32 pb-14 text-cream-100 sm:pt-40 sm:pb-16">
          <Topo className="text-cream-100/12" rings={15} seed={16.2} />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_0%,rgba(180,95,43,0.22),transparent_72%)]"
          />

          <div className="relative mx-auto max-w-4xl px-5 sm:px-8">
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2.5 text-[10.5px] font-bold tracking-[0.16em] text-cream-100/50 uppercase transition-colors hover:text-cream-100"
            >
              <ArrowRight className="rotate-180 transition-transform duration-300 group-hover:-translate-x-1" />
              {t("backToBlog")}
            </Link>

            <div className="mt-8 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.16em] uppercase">
              <span className="text-ember-500">
                <time dateTime={publishedAt}>{published}</time>
              </span>
              <span aria-hidden className="size-1 rounded-full bg-cream-100/30" />
              <span className="text-cream-100/45">
                {t("readingTime", { minutes: readingMinutes(post.body) })}
              </span>
            </div>

            <h1 className="font-display mt-5 text-[clamp(2rem,4.8vw,3.4rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-balance">
              {post.title}
            </h1>

            <p className="mt-6 max-w-2xl text-[16px] leading-[1.8] text-pretty text-cream-100/60 sm:text-[17px]">
              {post.excerpt}
            </p>

          </div>
        </header>

        {/* Cover straddles the header and the body. */}
        <div className="relative bg-cream-50">
          <div aria-hidden className="absolute inset-x-0 top-0 h-1/2 bg-brand-950" />
          <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
            <div className="relative aspect-[16/9] overflow-hidden rounded-[24px] bg-brand-100 ring-1 ring-brand-950/10">
              {imageUrl(post.cover_path) && (
                <Image
                  src={imageUrl(post.cover_path)!}
                  alt={post.cover_alt ?? ""}
                  fill
                  priority
                  sizes="(max-width: 1023px) 92vw, 900px"
                  className="object-cover"
                />
              )}
            </div>
          </div>
        </div>

        <div id="post-body" className="bg-cream-50 py-14 sm:py-20">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <RichBody doc={post.body} />

          </div>
        </div>
      </article>

      {others.length > 0 && (
        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <h2 className="font-display text-[11px] font-bold tracking-[0.2em] text-brand-700 uppercase">
              {t("moreReading")}
            </h2>
            <ul data-anim-group className="mt-7 grid gap-8 md:grid-cols-3">
              {others.map((item) => (
                <li key={item.slug}>
                  <Link href={`/blog/${item.slug}`} className="group block">
                    <div className="relative aspect-[16/11] overflow-hidden rounded-[18px] bg-brand-100">
                      {imageUrl(item.cover_path) && (
                        <Image
                          src={imageUrl(item.cover_path)!}
                          alt={item.cover_alt ?? ""}
                          fill
                          sizes="(max-width: 767px) 92vw, 360px"
                          className="object-cover transition-transform duration-[900ms] ease-out-expo group-hover:scale-[1.05]"
                        />
                      )}
                    </div>
                    <h3 className="font-display mt-4 text-[16px] leading-tight font-bold tracking-[-0.02em] text-brand-900">
                      {item.title}
                    </h3>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
