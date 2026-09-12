"use client";

import { useEffect } from "react";

/**
 * Tag Manager and Meta's pixel, held back until somebody actually uses the page.
 *
 * These were `afterInteractive`, then `lazyOnload`, and neither was late
 * enough. Measured on a throttled phone, the container and what it pulls in
 * behind it cost three and a half seconds of blocked main thread:
 *
 *   gtag/js    1,726 ms in one unbroken task
 *   gtm.js       541 ms and 338 ms
 *   clarity.js   485 ms
 *
 * A blocked main thread is a page that does not answer a tap, and it is thirty
 * percent of the performance score on its own. `lazyOnload` only waits for the
 * window load event, which still falls inside the window anything measuring
 * the page is watching, and well inside the seconds a visitor is waiting.
 *
 * So they wait for a sign of a real person instead: a touch, a scroll, a key,
 * a click. Somebody who reads the page and leaves without moving is still
 * counted, by the timer below, but by then the page has long since been theirs.
 *
 * The cost is honest and worth stating: a visitor who opens the page and
 * closes it inside a few seconds without touching anything is not counted.
 * That is a page view nobody read. Everything else is counted exactly as
 * before, a moment later.
 */

/** Long enough to be out of everyone's way, short enough to catch a real read. */
const FALLBACK_MS = 5500;

const TRIGGERS = ["pointerdown", "keydown", "touchstart", "wheel", "scroll"] as const;

export function LazyTags({ gtm, pixel }: { gtm: string; pixel: string }) {
  useEffect(() => {
    if (!gtm && !pixel) return;

    let started = false;

    const start = () => {
      if (started) return;
      started = true;
      stop();

      if (gtm) {
        // Consent goes on the dataLayer before the container is allowed to
        // read it, exactly as it did when both were inline in the document.
        const w = window as unknown as { dataLayer?: unknown[] };
        w.dataLayer = w.dataLayer || [];
        // eslint-disable-next-line prefer-rest-params
        function gtag(...args: unknown[]) {
          w.dataLayer!.push(args);
        }
        gtag("consent", "default", {
          ad_storage: "granted",
          ad_user_data: "granted",
          ad_personalization: "granted",
          analytics_storage: "granted",
          functionality_storage: "granted",
          personalization_storage: "granted",
          security_storage: "granted",
        });
        w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

        const container = document.createElement("script");
        container.async = true;
        container.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtm)}`;
        document.head.appendChild(container);
      }

      if (pixel) {
        // The shim Meta ships, written out rather than eval'd from a string:
        // calls made before fbevents.js lands queue up, and it replays them.
        type Fbq = ((...args: unknown[]) => void) & {
          queue: unknown[];
          callMethod?: (...args: unknown[]) => void;
          loaded?: boolean;
          version?: string;
        };

        const w = window as unknown as { fbq?: Fbq; _fbq?: Fbq };

        if (!w.fbq) {
          const fbq = ((...args: unknown[]) => {
            if (fbq.callMethod) fbq.callMethod(...args);
            else fbq.queue.push(args);
          }) as Fbq;

          fbq.queue = [];
          fbq.loaded = true;
          fbq.version = "2.0";

          w.fbq = fbq;
          w._fbq = fbq;
        }

        const events = document.createElement("script");
        events.async = true;
        events.src = "https://connect.facebook.net/en_US/fbevents.js";
        document.head.appendChild(events);

        w.fbq("init", pixel);
        w.fbq("track", "PageView");
      }
    };

    const stop = () => {
      for (const event of TRIGGERS) window.removeEventListener(event, start);
      window.clearTimeout(timer);
    };

    for (const event of TRIGGERS) {
      window.addEventListener(event, start, { once: true, passive: true });
    }

    const timer = window.setTimeout(start, FALLBACK_MS);

    return stop;
  }, [gtm, pixel]);

  return null;
}
