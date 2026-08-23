import "server-only";

import { headers } from "next/headers";

/**
 * A ceiling on how often one visitor may do something expensive.
 *
 * Held in memory, so it is per instance and resets on deploy. That is enough
 * for what it defends against: someone holding down a submit button, a script
 * hammering the enquiry form, or a loop opening payment orders. It is not a
 * defence against a distributed flood, which belongs at the edge.
 */
type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

/** Dropped occasionally so a long-lived process does not grow a map forever. */
const sweep = (now: number) => {
  if (windows.size < 5_000) return;
  for (const [key, window] of windows) if (window.resetAt <= now) windows.delete(key);
};

export async function callerKey(scope: string) {
  const list = await headers();
  const forwarded = list.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || list.get("x-real-ip") || "unknown";

  return `${scope}:${ip}`;
}

/** True when the caller is inside their allowance. */
export function allow(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  sweep(now);

  const current = windows.get(key);

  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= limit) return false;

  current.count += 1;
  return true;
}

/** The usual shape: a scope, a limit, and a window in minutes. */
export async function withinLimit(scope: string, limit: number, minutes = 10) {
  return allow(await callerKey(scope), limit, minutes * 60_000);
}
