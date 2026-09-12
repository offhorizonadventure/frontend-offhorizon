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
