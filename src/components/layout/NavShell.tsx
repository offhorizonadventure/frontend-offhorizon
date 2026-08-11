"use client";

import { useEffect, useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Floating glass bar. The only client state is whether the page has scrolled,
 * which tightens the pill and firms up the frost.
 *
 * The glass is three layers: a low-opacity fill, a heavy saturated backdrop
 * blur, and a 1px inset highlight along the top edge that catches the light
 * the way real frosted glass does. Falls back to a solid fill where
 * `backdrop-filter` is unsupported.
 */
export function NavShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[padding] duration-500 ease-out-expo",
        scrolled ? "px-2.5 pt-2.5 sm:px-5 sm:pt-3" : "px-3 pt-3 sm:px-6 sm:pt-5",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-6xl items-center justify-between gap-6 rounded-full border transition-all duration-500 ease-out-expo",
          "bg-white/75 supports-[backdrop-filter]:bg-white/30",
          "backdrop-blur-2xl backdrop-saturate-[180%]",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.75),inset_0_-1px_0_0_rgba(255,255,255,0.25)]",
          scrolled
            ? "h-14 border-white/50 pr-2.5 pl-5 supports-[backdrop-filter]:bg-white/45"
            : "h-16 border-white/45 pr-3 pl-6",
        )}
      >
        {children}
      </div>
    </header>
  );
}
