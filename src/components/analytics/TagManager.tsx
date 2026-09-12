import Script from "next/script";

const CONTAINER = process.env.NEXT_PUBLIC_GTM_ID ?? "";

/**
 * Tag Manager, and everything anybody ever put inside it.
 *
 * The container is the door to Analytics, Clarity, Ads and whatever else has
 * been added to it over the years, so its cost is not its own script but every
 * script it decides to fetch. Running that on hydration meant a phone spent the
 * first seconds of the visit executing tags instead of drawing the page.
 *
 * Both parts move together. The consent defaults have to be on the dataLayer
 * before the container reads it, so they stay in front of it in the same
 * strategy rather than being left behind on the old one.
 */
export function TagManager() {
  if (!CONTAINER) return null;

  return (
    <>
      {}
      <Script id="consent-defaults" strategy="lazyOnload">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('consent','default',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted',functionality_storage:'granted',personalization_storage:'granted',security_storage:'granted'});`}
      </Script>

      <Script id="gtm" strategy="lazyOnload">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${CONTAINER}');`}
      </Script>
    </>
  );
}

export function TagManagerFrame() {
  if (!CONTAINER) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${CONTAINER}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
