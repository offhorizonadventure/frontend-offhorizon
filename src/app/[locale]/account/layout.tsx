import type { Metadata } from "next";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AccountNav } from "@/components/account/AccountNav";
import { Topo } from "@/components/ui/Topo";
import { PATH_HEADER, signInPath } from "@/lib/next-path";
import { getProfile } from "@/lib/profile";

export function generateMetadata(): Metadata {
  return { title: "Your account", robots: { index: false, follow: false } };
}

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  /**
   * A signed out visitor is asked to sign in and then put back where they were
   * going, rather than dropped on the home page.
   *
   * Every link in every email we send lands somewhere under here: view your
   * booking, your receipt, the documents form. Sending those to the front door
   * with the address thrown away meant a rider who followed one had to work
   * out for themselves where they had been sent, and most of them will simply
   * have given up.
   */
  if (!profile) {
    const asked = (await headers()).get(PATH_HEADER);

    redirect(asked ? signInPath(asked) : "/sign-in");
  }

  const name = profile.full_name?.trim().split(/\s+/)[0] || profile.email?.split("@")[0] || "there";
  return (
    <>
      <section className="bg-brand-950 text-cream-100 relative overflow-hidden pt-32 pb-14 sm:pt-40 sm:pb-16">
        <Topo className="text-cream-100/12" rings={14} seed={11.4} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_0%,rgba(180,95,43,0.22),transparent_72%)]"
        />

        <div className="relative mx-auto max-w-5xl px-5 sm:px-8">
          <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
            <span aria-hidden className="bg-ember-500/60 h-px w-8" />
            Your account
          </span>

          <h1 className="font-display mt-5 text-[clamp(2rem,4.6vw,3rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-balance">
            Hello, {name}.
          </h1>

          <p className="text-cream-100/60 mt-4 max-w-lg text-[15px] leading-[1.8] text-pretty">
            Your details, the expeditions you have booked, and everything you have paid for.
          </p>
        </div>
      </section>

      <div className="bg-cream-50 pb-20 sm:pb-28">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <AccountNav />
          <div className="mt-10">{children}</div>
        </div>
      </div>
    </>
  );
}
