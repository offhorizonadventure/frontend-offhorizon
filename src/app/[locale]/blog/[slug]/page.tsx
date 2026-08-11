import Image from "next/image";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";

import { PostBody } from "@/components/blog/PostBody";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { ArrowRight } from "@/components/ui/icons";
import { Topo } from "@/components/ui/Topo";
import { getPost, posts, sortedPosts } from "@/config/posts";
import { locales } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata, siteName, siteUrl } from "@/lib/seo";

export function generateStaticParams() {
  return locales.flatMap((locale) => posts.map((post) => ({ locale, slug: post.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/blog/[slug]">) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return buildMetadata({
    locale,
    path: `/blog/${post.slug}`,
    title: post.title,
    description: post.excerpt,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt ?? post.publishedAt,
    readingMinutes: post.readingMinutes,
  });
}

export default async function PostPage({ params }: PageProps<"/[locale]/blog/[slug]">) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: "blog" });
  const format = await getFormatter({ locale });

  const url = `${siteUrl}/${locale}/blog/${post.slug}`;
  const others = sortedPosts.filter((item) => item.slug !== post.slug).slice(0, 3);

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: `${siteUrl}${post.cover.src}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    wordCount: post.body.reduce(
      (total, block) => total + ("text" in block ? block.text.split(/\s+/).length : 0),
      0,
    ),
    articleSection: post.category,
    inLanguage: locale,
    author: { "@type": "Person", name: post.author.name, jobTitle: post.author.role },
    publisher: { "@type": "Organization", name: siteName },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const published = format.dateTime(new Date(post.publishedAt), {
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
              <span className="text-ember-500">{post.category}</span>
              <span aria-hidden className="size-1 rounded-full bg-cream-100/30" />
              <span className="text-cream-100/45">
                {t("readingTime", { minutes: post.readingMinutes })}
              </span>
            </div>

            <h1 className="font-display mt-5 text-[clamp(2rem,4.8vw,3.4rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-balance">
              {post.title}
            </h1>

            <p className="mt-6 max-w-2xl text-[16px] leading-[1.8] text-pretty text-cream-100/60 sm:text-[17px]">
              {post.excerpt}
            </p>

            <div className="mt-9 flex items-center gap-3.5 border-t border-cream-100/12 pt-7">
              <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-brand-900">
                <Image
                  src={post.author.photo}
                  alt=""
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </span>
              <span className="text-[13px] leading-tight">
                <span className="block font-semibold text-cream-100">{post.author.name}</span>
                <span className="block text-cream-100/45">
                  {post.author.role} · <time dateTime={post.publishedAt}>{published}</time>
                </span>
              </span>
            </div>
          </div>
        </header>

        {/* Cover straddles the header and the body. */}
        <div className="relative bg-cream-50">
          <div aria-hidden className="absolute inset-x-0 top-0 h-1/2 bg-brand-950" />
          <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
            <div className="relative aspect-[16/9] overflow-hidden rounded-[24px] bg-brand-100 ring-1 ring-brand-950/10">
              <Image
                src={post.cover}
                alt={post.coverAlt}
                fill
                priority
                placeholder="blur"
                sizes="(max-width: 1023px) 92vw, 900px"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div id="post-body" className="bg-cream-50 py-14 sm:py-20">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <PostBody blocks={post.body} />

            <div className="mx-auto mt-16 max-w-[38rem] border-t border-brand-900/12 pt-8">
              <div className="flex items-start gap-4">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-full bg-brand-100">
                  <Image
                    src={post.author.photo}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </span>
                <span>
                  <span className="block text-[10px] font-bold tracking-[0.18em] text-brand-400 uppercase">
                    {t("writtenBy")}
                  </span>
                  <span className="font-display mt-1.5 block text-[17px] font-bold text-brand-900">
                    {post.author.name}
                  </span>
                  <span className="mt-1 block text-[13.5px] text-brand-800/55">
                    {post.author.role}
                  </span>
                </span>
              </div>
            </div>
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
                      <Image
                        src={item.cover}
                        alt={item.coverAlt}
                        fill
                        placeholder="blur"
                        sizes="(max-width: 767px) 92vw, 360px"
                        className="object-cover transition-transform duration-[900ms] ease-out-expo group-hover:scale-[1.05]"
                      />
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
