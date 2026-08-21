"use client";

import { useEffect, useRef, useState } from "react";

const LOADER = "https://cdn.trustindex.io/loader.js?9760b397813d982b0366a95fa48";

/** Trustindex review widget. */
export function TrustIndex() {
  const container = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!element || loaded) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const script = document.createElement("script");
        script.src = LOADER;
        script.defer = true;
        script.async = true;
        element.appendChild(script);
        setLoaded(true);
      },
      // Start fetching a little before it scrolls in.
      { rootMargin: "400px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [loaded]);

  return <div ref={container} className="ti-widget-mount mt-12 sm:mt-14" />;
}
