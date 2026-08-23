import { NextResponse } from "next/server";

import { cancelOverdue } from "@/lib/booking/overdue";

export const dynamic = "force-dynamic";

/**
 * Closes bookings whose balance passed the deadline.
 *
 * Run once a day. Guarded by the same secret as the revalidate hook, so a
 * scheduler can call it and nobody else can.
 */
export async function POST(request: Request) {
  const secret = process.env.SITE_REVALIDATE_SECRET ?? "";
  const given =
    request.headers.get("x-revalidate-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";

  if (!secret || given !== secret) {
    return NextResponse.json({ error: "not allowed" }, { status: 401 });
  }

  const cancelled = await cancelOverdue();

  return NextResponse.json({ ok: true, cancelled });
}

/** Vercel's scheduler sends GET, so it is the same job behind the same secret. */
export const GET = POST;
