import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { CATALOGUE_TAG } from "@/lib/catalogue";

/** Lets the admin clear the catalogue cache the moment something is saved. */
export async function POST(request: NextRequest) {
  const secret = process.env.SITE_REVALIDATE_SECRET;

  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // "max" is the two-argument form Next 16 wants: it marks the tag stale and refreshes it on the next visit, rather than expiring it and making whoever arrives first wait for the database.
  revalidateTag(CATALOGUE_TAG, "max");

  return NextResponse.json({ ok: true, cleared: CATALOGUE_TAG });
}
