"use client";

import { useEffect } from "react";

/**
 * The site's single scroll-animation engine.
 *
 * Mounted once in the layout. Every animated element opts in with a data
 * attribute rather than wrapping itself in its own observer component:
 *
 *   data-anim="up"      fade and rise
 *   data-anim="wipe"    clip-path wipe from the bottom edge
 *   data-anim-group     stagger the element's animated children together
 *   data-parallax="8"   scrubbed drift, value is yPercent
 *
 * Why one engine: `ScrollTrigger.batch` groups elements that enter together
 * into a single tween, so a page with dozens of animated blocks still costs
 * one ScrollTrigger pass instead of dozens of IntersectionObservers.
 *
 * Why `gsap.from` rather than a CSS "hidden until seen" class: if the GSAP
 * chunk fails to load, the markup is simply visible. Nothing can strand
 * content in a hidden state.
 *
 * The whole module is imported after mount, so it never blocks first paint,
 * and it is skipped entirely for reduced-motion users.
 */
export function ScrollMotion() {
  useEffect(() => {
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
        ScrollTrigger.batch("[data-anim='up']", {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.from(batch, {
              y: 34,
              opacity: 0,
              duration: 0.9,
              ease: "expo.out",
              stagger: 0.08,
              overwrite: true,
            }),
        });

        ScrollTrigger.batch("[data-anim='wipe']", {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.from(batch, {
              clipPath: "inset(100% 0% 0% 0%)",
              y: 40,
              duration: 1.15,
              ease: "expo.out",
              stagger: 0.1,
              overwrite: true,
            }),
        });

        // Children of a group animate together with a tighter stagger.
        gsap.utils.toArray<HTMLElement>("[data-anim-group]").forEach((group) => {
          const items = Array.from(group.children);
          if (!items.length) return;

          gsap.from(items, {
            y: 28,
            opacity: 0,
            duration: 0.85,
            ease: "expo.out",
            stagger: 0.07,
            scrollTrigger: { trigger: group, start: "top 86%", once: true },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((element) => {
          gsap.to(element, {
            yPercent: Number(element.dataset.parallax) || 8,
            ease: "none",
            scrollTrigger: {
              trigger: element,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.7,
            },
          });
        });
      });

      // Images settle after the first pass and shift every trigger's position.
      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener("load", onLoad);

      cleanup = () => {
        window.removeEventListener("load", onLoad);
        context.revert();
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
