import Script from "next/script";

/**
 * No fallback id on purpose.
 *
 * It used to fall back to the live pixel, so every local build, every preview
 * and every test run reported itself to Meta as real traffic. An unset
 * variable now means no pixel, which is what an unset variable should mean.
 */
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

/**
 * Meta's pixel, kept off the critical path.
 *
 * It was `afterInteractive`, which means Next runs it as soon as the page has
 * hydrated. On a phone that lands squarely in the two seconds a visitor is
 * waiting for the page, and the pixel is not small: a quarter of a megabyte of
 * JavaScript, which on a mid range Android is most of a second of main thread
 * work nobody asked for.
 *
 * `lazyOnload` waits for the window load event and then for the browser to be
 * idle. Page views are still counted, because the browser gets there within a
 * second or two of the page being usable; they are simply counted after the
 * visitor has their page rather than instead of it.
 */
export function MetaPixel() {
  if (!PIXEL) return null;

  return (
    <Script id="meta-pixel" strategy="lazyOnload">
      {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${PIXEL}');
fbq('track','PageView');`}
    </Script>
  );
}

export function MetaPixelFrame() {
  if (!PIXEL) return null;

  return (
    <noscript>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        alt=""
        aria-hidden
        src={`https://www.facebook.com/tr?id=${PIXEL}&ev=PageView&noscript=1`}
      />
    </noscript>
  );
}
