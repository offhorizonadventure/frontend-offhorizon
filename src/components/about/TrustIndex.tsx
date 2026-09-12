"use client";

import { useEffect, useRef, useState } from "react";

const LOADER = "https://cdn.trustindex.io/loader.js?9760b397813d982b0366a95fa48";

/** Two more goes, backing off, before giving up on it. */
const ATTEMPTS = 3;
const BACKOFF = [0, 1200, 3000];

/**
 * The reviews, from Trustindex.
 *
 * It used to wait for the section to come near the viewport before it began
 * fetching, which on a long page meant the widget started loading only once
 * somebody had scrolled to where it should already have been, and appeared to
 * arrive late or not at all. It now starts as soon as the browser is idle, and
 * tries again if the request fails, which it sometimes does.
 *
 * The mount keeps a minimum height so the page does not jump when the reviews
 * land.
 */
export function TrustIndex() {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;

    let attempt = 0;
    let timer: number | undefined;
    let cancelled = false;

    const load = () => {
      if (cancelled || !container.current) return;

      const script = document.createElement("script");
      script.src = `${LOADER}${attempt ? `&retry=${attempt}` : ""}`;
      script.async = true;

      script.addEventListener("error", () => {
        script.remove();
        attempt += 1;

        if (attempt < ATTEMPTS) timer = window.setTimeout(load, BACKOFF[attempt]);
        else setFailed(true);
      });

      container.current.appendChild(script);
    };

    // Off the critical path, but not waiting to be scrolled to.
    //
    // The timeout used to be 1500ms, which is a promise to load the widget
    // whether the browser is idle or not, and on a phone it is never idle that
    // early. It forced four requests to a review service into the same second
    // the visitor was waiting for the page. Six seconds is long enough that a
    // busy main thread is left alone and short enough that the reviews are
    // there before anybody scrolls to them.
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(load, { timeout: 6000 })
      : window.setTimeout(load, 2500);

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      if (window.cancelIdleCallback && typeof idle === "number") window.cancelIdleCallback(idle);
    };
  }, []);

  return (
    <div
      ref={container}
      // Held open so the page does not jump when the reviews arrive, and
      // collapsed if they never do.
      className={`ti-widget-mount mt-12 sm:mt-14 ${failed ? "" : "min-h-[16rem]"}`}
    />
  );
}
