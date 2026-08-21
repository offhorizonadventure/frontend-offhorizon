import { Topo } from "@/components/ui/Topo";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/params";
import { buildMetadata } from "@/lib/seo";

/** The public account deletion page. */
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
      <section className="bg-brand-950 text-cream-100 relative overflow-hidden pt-32 pb-14 sm:pt-40 sm:pb-16">
        <Topo className="text-cream-100/12" rings={13} seed={9.2} />
        <div className="relative mx-auto max-w-3xl px-5 sm:px-8">
          <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
            <span aria-hidden className="bg-ember-500/60 h-px w-8" />
            Your data
          </span>

          <h1 className="font-display mt-5 text-[clamp(2rem,4.6vw,3rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-balance">
            Delete your account.
          </h1>

          <p className="text-cream-100/60 mt-5 max-w-xl text-[15px] leading-[1.8] text-pretty">
            You can remove your account and the data attached to it at any time, from inside your
            account or by asking us.
          </p>
        </div>
      </section>

      <section className="bg-cream-50 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-12 px-5 sm:px-8">
          <div>
            <h2 className="font-display text-brand-900 text-[19px] font-bold tracking-[-0.02em]">
              From your account
            </h2>
            <ol className="mt-5 space-y-3">
              {STEPS.map((step, index) => (
                <li key={step} className="text-brand-900/75 flex gap-3.5 text-[15px] leading-[1.8]">
                  <span className="bg-brand-800 text-cream-100 grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <p className="text-brand-800/65 mt-5 text-[14px] leading-[1.8]">
              Prefer to ask? Email{" "}
              <a
                href="mailto:hello@offhorizon.com?subject=Account%20deletion"
                className="text-brand-900 decoration-ember-500/50 font-semibold underline underline-offset-[3px]"
              >
                hello@offhorizon.com
              </a>{" "}
              from the address on the account and we will do it within 30 days.
            </p>
          </div>

          <div>
            <h2 className="font-display text-brand-900 text-[19px] font-bold tracking-[-0.02em]">
              What is deleted
            </h2>
            <ul className="mt-5 space-y-3">
              {REMOVED.map((item) => (
                <li key={item} className="text-brand-900/75 flex gap-3.5 text-[15px] leading-[1.8]">
                  <span
                    aria-hidden
                    className="bg-ember-500 mt-[0.7em] size-1.5 shrink-0 rounded-full"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-brand-900 text-[19px] font-bold tracking-[-0.02em]">
              What we have to keep
            </h2>
            <ul className="mt-5 space-y-3">
              {KEPT.map((item) => (
                <li key={item} className="text-brand-900/75 flex gap-3.5 text-[15px] leading-[1.8]">
                  <span
                    aria-hidden
                    className="bg-brand-300 mt-[0.7em] size-1.5 shrink-0 rounded-full"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="border-brand-900/10 text-brand-800/60 border-t pt-8 text-[14px]">
            Questions about any of this go to{" "}
            <a
              href="mailto:hello@offhorizon.com"
              className="text-brand-900 decoration-ember-500/50 font-semibold underline underline-offset-[3px]"
            >
              hello@offhorizon.com
            </a>
            , or through the{" "}
            <Link
              href="/contact-us"
              className="text-brand-900 decoration-ember-500/50 font-semibold underline underline-offset-[3px]"
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
