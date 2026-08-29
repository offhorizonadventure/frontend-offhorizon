import Script from "next/script";

const TERMLY_ID = process.env.NEXT_PUBLIC_TERMLY_ID ?? "";

export function Termly() {
  if (!TERMLY_ID) return null;

  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script
      id="termly"
      strategy="beforeInteractive"
      src={`https://app.termly.io/resource-blocker/${TERMLY_ID}?autoBlock=on`}
    />
  );
}
