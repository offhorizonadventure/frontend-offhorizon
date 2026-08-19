import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Where OAuth and the emailed links land.
 *
 * Supabase sends a one-time code here; exchanging it sets the session cookies,
 * and only then is the visitor sent on. The `next` parameter is checked to be a
 * path on this site: an open redirect on a sign-in callback is how people get
 * phished into handing over a live session.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const target = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (!code) {
    return NextResponse.redirect(`${origin}${target}?error=auth`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  return NextResponse.redirect(`${origin}${error ? `${target}?error=auth` : target}`);
}
