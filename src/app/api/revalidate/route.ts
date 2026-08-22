import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { CATALOGUE_TAG } from "@/lib/catalogue";

/** Lets the admin clear the catalogue cache the moment something is saved. */
export async function POST(request: NextRequest) {
  const secret = process.env.SITE_REVALIDATE_SECRET;

  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // "max" is the Next 16 two-argument form: mark the tag stale, refresh on the next visit.
  revalidateTag(CATALOGUE_TAG, "max");

  return NextResponse.json({ ok: true, cleared: CATALOGUE_TAG });
}
