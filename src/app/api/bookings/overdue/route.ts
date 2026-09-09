import "server-only";

import { NextResponse } from "next/server";

import { cancelOverdue } from "@/lib/booking/overdue";
import { remindBalances } from "@/lib/booking/remind";

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

  // Warnings first. A booking whose deadline passed today would otherwise be
  // cancelled by the line below before the letter telling it so had gone, and
  // the rider would get the two in the wrong order.
  const reminded = await remindBalances();
  const cancelled = await cancelOverdue();

  return NextResponse.json({ ok: true, reminded, cancelled });
}

export const GET = POST;
