import "server-only";

import { NextResponse } from "next/server";

import { reconcilePayments } from "@/lib/booking/reconcile";

export const dynamic = "force-dynamic";

/**
 * Settles payments the webhook never reported.
 *
 * Run on a schedule. The webhook remains the normal path and this is the net
 * underneath it, for the case where the provider never called at all and
 * therefore never retries either.
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

  const result = await reconcilePayments();

  return NextResponse.json({ ok: true, ...result });
}

/** Some schedulers only send GET, so it is the same job behind the same secret. */
export const GET = POST;
