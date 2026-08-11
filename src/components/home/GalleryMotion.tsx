"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * GSAP enhancement for the destination gallery.
 *
 * Two effects, both optional: panels wipe in from the bottom with a stagger
 * out from the centre, and the image inside each frame drifts on scroll for
 * parallax. The drift is applied to an inset wrapper, never to the panel
 * itself, so it cannot fight the CSS accordion that owns the layout.
 *
 * GSAP is imported after mount so it stays out of the first load, and the
 * whole thing is skipped for reduced motion.
 */
export function GalleryMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const context = gsap.context(() => {
        gsap.from("[data-dg-item]", {
          clipPath: "inset(100% 0% 0% 0%)",
          y: 48,
          duration: 1.15,
          ease: "expo.out",
          stagger: { each: 0.09, from: "center" },
          scrollTrigger: { trigger: element, start: "top 85%", once: true },
        });

        gsap.to("[data-dg-image]", {
          yPercent: 7,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        });
      }, element);

      cleanup = () => context.revert();
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return <div ref={root}>{children}</div>;
}
