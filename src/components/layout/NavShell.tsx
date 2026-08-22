"use client";

import { useEffect, useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";

/** Floating glass bar. */
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
        "ease-out-expo fixed inset-x-0 top-0 z-50 transition-[padding] duration-500",
        scrolled ? "px-2.5 pt-2.5 sm:px-5 sm:pt-3" : "px-3 pt-3 sm:px-6 sm:pt-5",
      )}
    >
      <div
        className={cn(
          "ease-out-expo mx-auto flex w-full max-w-6xl items-center justify-between gap-3 rounded-full border transition-all duration-500 sm:gap-6",
          "bg-white/75 supports-[backdrop-filter]:bg-white/30",
          "backdrop-blur-2xl backdrop-saturate-[180%]",
          "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.75),inset_0_-1px_0_0_rgba(255,255,255,0.25)]",
          scrolled
            ? "h-14 border-white/50 pr-2.5 pl-4 supports-[backdrop-filter]:bg-white/45 sm:pr-3 sm:pl-5"
            : "h-16 border-white/45 pr-2.5 pl-4 sm:pr-4 sm:pl-6",
        )}
      >
        {children}
      </div>
    </header>
  );
}
