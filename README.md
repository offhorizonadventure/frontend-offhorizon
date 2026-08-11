# Offhorizon Adventures

Marketing site for Offhorizon Adventures, a guided motorcycle and self-drive 4x4
expedition operator working across India, Nepal, Bhutan, Sri Lanka and Mongolia.

Built with Next.js 16 (App Router), Tailwind CSS v4, next-intl and GSAP.

## Getting started

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL`. It drives
canonical URLs, `hreflang` alternates, the sitemap and `robots.txt`, so it must
match the deployed origin in production.

```bash
pnpm build   # production build, also runs the type check
pnpm lint
```

## Languages and routing

Five locales: `en`, `fr`, `de`, `it`, `es`. Every page lives under a locale
prefix (`/en`, `/fr`, ...) so each language is a separate indexable URL.

`src/proxy.ts` (Next 16 renamed the middleware convention to `proxy`) resolves a
locale for prefix-less requests in this order:

1. `NEXT_LOCALE` cookie, if the visitor already chose a language
2. CDN geo header, via the table in `src/i18n/config.ts`
3. `en`

**Geo headers only exist in production.** Locally every request falls through to
English; France, Germany, Italy and Spain redirects only appear once deployed
behind Vercel or Cloudflare.

Adding a language means adding it to `locales` in `src/i18n/config.ts` and
creating `messages/<code>.json`. Message keys are type-checked against
`messages/en.json` (see `src/i18n/keys.ts`), so a missing translation fails the
build rather than rendering a raw key.

In development the catalogues are read from disk on each request, because the
bundler caches JSON imports and will otherwise serve stale copy until restart.
Production uses the bundled imports.

## Currency

Prices are authored once in USD (`priceFrom` in `src/config/packages.ts`) and
converted at render time by `src/lib/currency.ts` using the Frankfurter API,
cached for 12 hours. The target currency is derived from the locale, not from a
per-request geo lookup, which is what lets every page stay statically rendered.

## Content and translation

`src/lib/content.ts` resolves CMS fields shaped `{ en: "...", fr: "..." }` with
an English fallback. Nothing uses it yet. Note that translations must be
produced upstream: nothing here translates text at runtime.

Before serving CMS content that is not translated into every language,
`buildMetadata` in `src/lib/seo.ts` should take the list of languages a page
actually has, so untranslated pages stop advertising `hreflang` alternates they
do not have.

## Animation

One engine, `src/components/motion/ScrollMotion.tsx`, mounted once in the
layout. Elements opt in with data attributes:

| Attribute | Effect |
| --- | --- |
| `data-anim="up"` | fade and rise |
| `data-anim="wipe"` | clip-path wipe from the bottom |
| `data-anim-group` | stagger the element's children |
| `data-parallax="8"` | scrubbed drift, value is `yPercent` |

`ScrollTrigger.batch` groups elements entering together into a single tween.
GSAP is imported after mount so it never blocks first paint, and animations use
`gsap.from`, so if the chunk fails to load the content is simply visible rather
than stranded hidden.

## Before launch

- `src/config/site.ts` has a placeholder WhatsApp number.
- `src/config/packages.ts` has placeholder prices, ratings and review counts.
- `src/config/social.ts` has guessed social URLs.
- The consultation form in `src/components/ui/ConsultationModal.tsx` shows a
  success state but does not send anything. It needs a real endpoint.
- Destination photography in `public/destinations/` comes from Wikimedia
  Commons, mostly CC BY-SA, which requires visible attribution on a commercial
  site. Author and licence per image are in
  `public/destinations/credits.json`. Replace these with owned photography.
