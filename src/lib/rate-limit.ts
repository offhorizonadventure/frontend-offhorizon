import "server-only";

import { headers } from "next/headers";

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

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

export async function withinLimit(scope: string, limit: number, minutes = 10) {
  return allow(await callerKey(scope), limit, minutes * 60_000);
}
