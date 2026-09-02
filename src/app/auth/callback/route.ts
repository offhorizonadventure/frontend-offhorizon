import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/seo";

const TYPES: EmailOtpType[] = [
  "recovery",
  "invite",
  "signup",
  "magiclink",
  "email_change",
  "email",
];

const isType = (value: string | null): value is EmailOtpType =>
  Boolean(value) && TYPES.includes(value as EmailOtpType);

/**
 * Where an email link comes back to.
 *
 * Two shapes arrive here, and which one depends on how the link was made
 * rather than on anything the visitor did. A reset the rider asked for on the
 * site is PKCE: the verifier is already in their cookies and the link returns
 * a `code` to swap for a session. A link Supabase's own email template built
 * carries `token_hash` and a `type` instead, and is verified in one call. The
 * second used to fall straight through to the error branch, which is how a
 * "set your password" link ended up on a page saying the link had expired.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const next = searchParams.get("next") ?? "/";
  const target = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (!code && !tokenHash) {
    return NextResponse.redirect(`${siteUrl}${target}?error=auth`);
  }

  const supabase = await createClient();

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : isType(type)
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash as string })
      : // A recovery link is the only one sent without a type on it, and it is
        // the one this route exists for.
        await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash as string });

  return NextResponse.redirect(`${siteUrl}${error ? `${target}?error=auth` : target}`);
}
