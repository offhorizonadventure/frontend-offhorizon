import Script from "next/script";

/**
 * The website's Termly id, from the dashboard.
 *
 * Kept in the environment rather than the source: it is not a secret, but it
 * differs between the live site and anything used to try changes out, and a
 * banner pointed at the wrong site records consent against the wrong site.
 */
const TERMLY_ID = process.env.NEXT_PUBLIC_TERMLY_ID ?? "";

/**
 * The consent banner, and the blocker that makes it mean something.
 *
 * `autoBlock=on` is the part that matters. Termly holds back the scripts that
 * write analytics and advertising cookies until somebody agrees, rather than
 * asking politely after they have already run. That is what makes the banner a
 * consent gate instead of a notice.
 *
 * `beforeInteractive` is deliberate and is the one place it is warranted: a
 * blocker that loads after the tags it is meant to block has blocked nothing.
 * The tag manager stays on `afterInteractive` and starts denied under Consent
 * Mode, so the two agree on the answer before either has to act on it.
 */
export function Termly() {
  if (!TERMLY_ID) return null;

  return (
    // The rule below is a Pages Router rule. In the App Router this strategy is
    // supported, and the root layout is where it is meant to go.
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script
      id="termly"
      strategy="beforeInteractive"
      src={`https://app.termly.io/resource-blocker/${TERMLY_ID}?autoBlock=on`}
    />
  );
}
