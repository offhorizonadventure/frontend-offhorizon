import "server-only";

import { NextResponse } from "next/server";

import { cancelOverdue } from "@/lib/booking/overdue";

export const dynamic = "force-dynamic";

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

export const GET = POST;
