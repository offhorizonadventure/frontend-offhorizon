import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/seo";

/**
 * Where OAuth and the emailed links land.
 *
 * The redirect is built from NEXT_PUBLIC_SITE_URL, not from the request. In
 * production this runs in a container behind Caddy, and Next resolves
 * `request.nextUrl.origin` to the address the process is bound to, which is
 * http://0.0.0.0:3000. Sending a signed-in visitor there is a dead end: the
 * browser reports ERR_ADDRESS_INVALID and the session, which did work, looks
 * like it failed.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  // Relative only, so `?next=` cannot bounce anyone off site.
  const target = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (!code) {
    return NextResponse.redirect(`${siteUrl}${target}?error=auth`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  return NextResponse.redirect(`${siteUrl}${error ? `${target}?error=auth` : target}`);
}
