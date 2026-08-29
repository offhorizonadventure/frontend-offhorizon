"use client";

import { useEffect } from "react";

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

        gsap.utils.toArray<HTMLElement>("[data-anim-group]").forEach((group) => {
          const items = Array.from(group.children);
          if (!items.length) return;

          if (group.getBoundingClientRect().top < window.innerHeight * 0.86) return;

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

      const onLoad = () => {
        ScrollTrigger.refresh();

        window.setTimeout(() => {
          document.querySelectorAll<HTMLElement>("[data-anim-group] > *").forEach((element) => {
            const box = element.getBoundingClientRect();
            const onScreen = box.top < window.innerHeight && box.bottom > 0;
            if (onScreen && Number(getComputedStyle(element).opacity) < 0.05) {
              gsap.set(element, { clearProps: "opacity,transform" });
            }
          });
        }, 1200);
      };
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
