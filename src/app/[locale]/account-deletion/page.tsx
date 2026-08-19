import { Topo } from "@/components/ui/Topo";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata } from "@/lib/seo";

/**
 * The public account deletion page.
 *
 * Meta requires a URL anyone can reach without signing in, explaining how to
 * delete an account and what happens to the data. It is the address given in
 * the app dashboard as the data deletion instructions, so it must stay live and
 * must not sit behind the sign in wall.
 *
 * English only: it is the address given to Meta, and one canonical wording is
 * easier to keep true than five.
 */
export async function generateMetadata({ params }: PageProps<"/[locale]/account-deletion">) {
  const locale = await resolveLocale(params);

  return buildMetadata({
    locale,
    path: "/account-deletion",
    title: "Delete your account | Offhorizon Adventures",
    description:
      "How to delete your Offhorizon Adventures account, what is removed, and what we are required to keep.",
  });
}

const STEPS = [
  "Sign in and open My profile.",
  "Scroll to Delete my account.",
  "Type DELETE to confirm.",
];

const REMOVED = [
  "Your name, email address and phone number",
  "Enquiries you have sent us",
  "Your saved expeditions and preferences",
  "Any connected Google or Facebook sign in",
];

const KEPT = [
  "Invoices and payment records for expeditions already paid for, which tax law requires us to keep for the statutory period",
  "Anything already anonymised, which can no longer be traced back to you",
];

export default function AccountDeletionPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-brand-950 pt-32 pb-14 text-cream-100 sm:pt-40 sm:pb-16">
        <Topo className="text-cream-100/12" rings={13} seed={9.2} />
        <div className="relative mx-auto max-w-3xl px-5 sm:px-8">
          <span className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase">
            <span aria-hidden className="h-px w-8 bg-ember-500/60" />
            Your data
          </span>

          <h1 className="font-display mt-5 text-[clamp(2rem,4.6vw,3rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-balance">
            Delete your account.
          </h1>

          <p className="mt-5 max-w-xl text-[15px] leading-[1.8] text-pretty text-cream-100/60">
            You can remove your account and the data attached to it at any time, from inside your
            account or by asking us.
          </p>
        </div>
      </section>

      <section className="bg-cream-50 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-12 px-5 sm:px-8">
          <div>
            <h2 className="font-display text-[19px] font-bold tracking-[-0.02em] text-brand-900">
              From your account
            </h2>
            <ol className="mt-5 space-y-3">
              {STEPS.map((step, index) => (
                <li key={step} className="flex gap-3.5 text-[15px] leading-[1.8] text-brand-900/75">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-800 text-[11px] font-bold text-cream-100">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <p className="mt-5 text-[14px] leading-[1.8] text-brand-800/65">
              Prefer to ask? Email{" "}
              <a
                href="mailto:hello@offhorizon.com?subject=Account%20deletion"
                className="font-semibold text-brand-900 underline decoration-ember-500/50 underline-offset-[3px]"
              >
                hello@offhorizon.com
              </a>{" "}
              from the address on the account and we will do it within 30 days.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[19px] font-bold tracking-[-0.02em] text-brand-900">
              What is deleted
            </h2>
            <ul className="mt-5 space-y-3">
              {REMOVED.map((item) => (
                <li key={item} className="flex gap-3.5 text-[15px] leading-[1.8] text-brand-900/75">
                  <span aria-hidden className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-ember-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-[19px] font-bold tracking-[-0.02em] text-brand-900">
              What we have to keep
            </h2>
            <ul className="mt-5 space-y-3">
              {KEPT.map((item) => (
                <li key={item} className="flex gap-3.5 text-[15px] leading-[1.8] text-brand-900/75">
                  <span aria-hidden className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-brand-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="border-t border-brand-900/10 pt-8 text-[14px] text-brand-800/60">
            Questions about any of this go to{" "}
            <a
              href="mailto:hello@offhorizon.com"
              className="font-semibold text-brand-900 underline decoration-ember-500/50 underline-offset-[3px]"
            >
              hello@offhorizon.com
            </a>
            , or through the{" "}
            <Link
              href="/contact-us"
              className="font-semibold text-brand-900 underline decoration-ember-500/50 underline-offset-[3px]"
            >
              contact form
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
