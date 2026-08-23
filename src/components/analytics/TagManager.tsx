import Script from "next/script";

const CONTAINER = process.env.NEXT_PUBLIC_GTM_ID ?? "";

/**
 * Google Tag Manager, loaded after the page is interactive.
 *
 * Consent Mode starts denied, so nothing GTM carries can write an analytics or
 * advertising cookie until a visitor agrees. Without a consent banner that
 * means no measurement from the EU or the UK, which is the correct default
 * rather than an oversight.
 */
export function TagManager() {
  if (!CONTAINER) return null;

  return (
    <>
      {/* Ahead of the container, so consent is denied before any tag reads it. */}
      <Script id="consent-defaults" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});`}
      </Script>

      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;
j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${CONTAINER}');`}
      </Script>
    </>
  );
}

/** The fallback for a browser with JavaScript off. Goes first inside the body. */
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
