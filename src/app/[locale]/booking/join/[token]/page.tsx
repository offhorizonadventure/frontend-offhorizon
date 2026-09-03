import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Topo } from "@/components/ui/Topo";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/params";
import { acceptInvite } from "@/lib/booking/actions";
import { signInPath } from "@/lib/next-path";
import { getUser } from "@/lib/supabase/server";

export function generateMetadata(): Metadata {
  return { title: "Join a booking", robots: { index: false, follow: false } };
}

export default async function JoinPage({ params }: PageProps<"/[locale]/booking/join/[token]">) {
  const locale = await resolveLocale(params);
  const { token } = await params;
  const t = await getTranslations({ locale, namespace: "join" });

  const user = await getUser();
  const result = user ? await acceptInvite(token) : null;

  if (result?.ok) redirect(`/account/bookings/${result.reference}`);

  return (
    <section className="bg-brand-950 text-cream-100 relative flex min-h-[70vh] items-center overflow-hidden pt-32 pb-20 sm:pt-40">
      <Topo className="text-cream-100/12" rings={12} seed={71.2} />
      <div className="relative mx-auto w-full max-w-6xl px-5 sm:px-8">
        <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
          <span aria-hidden className="bg-ember-500/60 h-px w-8" />
          {t("eyebrow")}
        </span>

        <h1 className="font-display mt-5 text-[clamp(2rem,4.6vw,3rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-balance">
          {user ? t("problem") : t("title")}
        </h1>

        <p className="text-cream-100/60 mt-5 text-[15px] leading-[1.8] text-pretty">
          {user && result && !result.ok ? result.error : t("lead")}
        </p>

        {/* The invite is the whole point of the visit, so signing in comes
            back to it and the rider is joined to the booking on arrival,
            rather than being left at the front door holding a used link. */}
        <Link
          href={user ? "/account/bookings" : signInPath(`/booking/join/${token}`)}
          className="border-cream-100/25 text-cream-100 hover:bg-cream-100/10 mt-9 inline-flex h-12 items-center rounded-full border px-7 text-[11px] font-bold tracking-[0.12em] uppercase transition-colors"
        >
          {user ? t("bookings") : t("signIn")}
        </Link>
      </div>
    </section>
  );
}
