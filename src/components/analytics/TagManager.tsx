import Script from "next/script";

const CONTAINER = process.env.NEXT_PUBLIC_GTM_ID ?? "";

/**
 * Google Tag Manager, loaded after the page is interactive.
 *
 * Consent Mode starts granted, so every tag in the container fires on the first
 * page view. It started denied, which is the safe default, but nothing on the
 * site could ever grant it: analytics and advertising storage stayed denied for
 * every visitor and the tags never ran. This was asked for deliberately.
 *
 * What that means, plainly: visitors are measured before they agree to be. For
 * the EEA, the UK and Switzerland that is what GDPR and ePrivacy are about, and
 * the site is published in French, German, Italian and Spanish. The lawful
 * version of this is to grant everywhere except those regions, which Consent
 * Mode supports with a second default carrying a `region` list, and to let the
 * banner grant them. One line, whenever you want it.
 */
export function TagManager() {
  if (!CONTAINER) return null;

  return (
    <>
      {/* Ahead of the container, so consent is settled before any tag reads it. */}
      <Script id="consent-defaults" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('consent','default',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted',functionality_storage:'granted',personalization_storage:'granted',security_storage:'granted'});`}
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
