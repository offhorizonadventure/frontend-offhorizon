import Script from "next/script";

const TERMLY_ID = process.env.NEXT_PUBLIC_TERMLY_ID ?? "";

/**
 * The consent blocker, which is currently answering 404.
 *
 * It was `beforeInteractive`, meaning a <link rel="preload"> in the head and a
 * blocking script: the page waited on it before drawing. What it waited for was
 * a 404, visible in the console and in the Best Practices audit, because the id
 * in the environment no longer resolves at Termly.
 *
 * So it was blocking the page to fetch nothing, and blocking no trackers
 * either. It waits for idle now. That is safe whichever way the id goes: the
 * tags it exists to gate do not run until somebody interacts with the page, so
 * this still arrives first.
 *
 * The id needs fixing or the component needs deleting. A consent tool that 404s
 * is not consent.
 */
export function Termly() {
  if (!TERMLY_ID) return null;

  return (
    <Script
      id="termly"
      strategy="lazyOnload"
      src={`https://app.termly.io/resource-blocker/${TERMLY_ID}?autoBlock=on`}
    />
  );
}
