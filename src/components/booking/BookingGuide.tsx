import { getTranslations } from "next-intl/server";

import { CtaBand } from "@/components/destinations/CtaBand";
import { ArrowRight } from "@/components/ui/icons";
import { Topo } from "@/components/ui/Topo";
import type { Locale } from "@/i18n/config";

import guideImage from "../../../public/destinations/pages/manali-to-leh.jpg";

type Step = { title: string; body: string };
type Clause = { title: string; body: string[] };

/** The page a rider reads before paying anything. */
export async function BookingGuide({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "bookingGuide" });

  const steps = t.raw("steps") as Step[];
  const clauses = t.raw("sections") as Clause[];
  const deadline = t.raw("deadline.body") as string[];

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HowTo",
        name: t("title"),
        description: t("lead"),
        step: steps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.title,
          text: step.body,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: t("deadline.title"),
            acceptedAnswer: { "@type": "Answer", text: deadline.join(" ") },
          },
          ...clauses.map((clause) => ({
            "@type": "Question",
            name: clause.title,
            acceptedAnswer: { "@type": "Answer", text: clause.body.join(" ") },
          })),
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />

      <section className="bg-brand-950 text-cream-100 relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
        <Topo className="text-cream-100/12" rings={13} seed={51.7} />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
            <span aria-hidden className="bg-ember-500/60 h-px w-8" />
            {t("eyebrow")}
          </span>

          <h1 className="font-display mt-5 text-[clamp(2rem,4.6vw,3rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-balance">
            {t("title")}
          </h1>

          <p className="text-cream-100/60 mt-5 text-[15px] leading-[1.8] text-pretty">
            {t("lead")}
          </p>
        </div>
      </section>

      <section className="bg-cream-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="font-display text-brand-900 text-[clamp(1.6rem,3.2vw,2.3rem)] leading-[1.12] font-extrabold tracking-[-0.03em] text-balance">
            {t("stepsTitle")}
          </h2>

          <ol
            data-anim-group
            className="border-brand-900/12 mt-10 grid border-t border-l sm:grid-cols-2 lg:grid-cols-3"
          >
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="border-brand-900/12 border-r border-b p-7 transition-colors duration-500 hover:bg-white/70"
              >
                <span className="font-display text-ember-500 block text-[12px] font-extrabold tracking-[0.14em] tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-brand-900 mt-4 text-[16.5px] leading-tight font-bold tracking-[-0.015em]">
                  {step.title}
                </h3>
                <p className="text-brand-800/65 mt-2.5 text-[13.5px] leading-[1.75] text-pretty">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The one thing a rider must not skim. */}
      <section className="bg-brand-900 text-cream-100 relative overflow-hidden py-16 sm:py-20">
        <Topo className="text-cream-100/10" rings={11} seed={52.4} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_0%,rgba(180,95,43,0.28),transparent_70%)]"
        />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
            <span aria-hidden className="bg-ember-500/60 h-px w-8" />
            {t("deadline.eyebrow")}
          </span>

          <h2 className="font-display mt-5 text-[clamp(1.6rem,3.4vw,2.4rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance">
            {t("deadline.title")}
          </h2>

          <div className="mt-6 space-y-4">
            {deadline.map((paragraph) => (
              <p
                key={paragraph}
                className="text-cream-100/70 text-[15px] leading-[1.8] text-pretty"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <ol className="space-y-12">
            {clauses.map((clause) => (
              <li key={clause.title}>
                <h2 className="font-display text-brand-900 flex gap-3 text-[19px] font-bold tracking-[-0.02em]">
                  <ArrowRight className="text-ember-500 mt-1.5 shrink-0" />
                  {clause.title}
                </h2>

                <div className="mt-4 space-y-4">
                  {clause.body.map((paragraph) => (
                    <p key={paragraph} className="text-brand-900/75 text-[15px] leading-[1.8]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand
        title={t("cta.title")}
        body={t("cta.body")}
        image={guideImage}
        imageAlt=""
        primary={{ label: t("cta.primary"), href: "/calendar" }}
        secondary={{ label: t("cta.secondary"), href: "/terms-of-service" }}
      />
    </>
  );
}
