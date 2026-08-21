"use client";

import { useEffect, useState } from "react";

/** Thin progress bar pinned under the navbar. */
export function ReadingProgress({ target }: { target: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const article = document.querySelector<HTMLElement>(target);
    if (!article) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const start = article.offsetTop;
      const distance = article.offsetHeight - window.innerHeight;
      if (distance <= 0) return setProgress(0);

      const scrolled = (window.scrollY - start) / distance;
      setProgress(Math.min(1, Math.max(0, scrolled)));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [target]);

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-40 h-[3px] bg-transparent">
      <div
        className="bg-ember-500 h-full origin-left transition-transform duration-150 ease-out"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
