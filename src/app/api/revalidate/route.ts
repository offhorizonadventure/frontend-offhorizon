import "server-only";

import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { CATALOGUE_TAG } from "@/lib/catalogue";

export async function POST(request: NextRequest) {
  const secret = process.env.SITE_REVALIDATE_SECRET;

  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  revalidateTag(CATALOGUE_TAG, "max");

  return NextResponse.json({ ok: true, cleared: CATALOGUE_TAG });
}
