import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Topo } from "@/components/ui/Topo";
import { team, type Member } from "@/config/team";
import { cn } from "@/lib/cn";

/**
 * Crew, grouped by function.
 *
 * The lead sits alone in a wide frame and each group follows under a ruled
 * heading, so the hierarchy is readable without job titles under every face.
 * Photographs were supplied at mixed ratios and are normalised to 3:4.
 */
export async function Team() {
  const t = await getTranslations("about.team");

  const [lead, ...groups] = team;

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div data-anim="up" className="max-w-2xl">
          <span className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-500 uppercase">
            <span aria-hidden className="h-px w-8 bg-ember-500/60" />
            {t("eyebrow")}
          </span>
          <h2 className="font-display mt-5 text-[clamp(1.85rem,3.6vw,2.9rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance text-brand-900">
            {t("title")}
          </h2>
          <p className="mt-4 text-[15px] leading-[1.8] text-pretty text-brand-800/60">
            {t("body")}
          </p>
        </div>

        {/* Lead card. A small portrait next to one short line left the row
            looking half empty, so the portrait carries more width and the name
            is set at display scale to hold the space. */}
        <div data-anim="up" className="relative mt-12 overflow-hidden rounded-[32px] bg-cream-50 sm:mt-16">
          <Topo className="text-brand-800/10" rings={9} seed={12.5} />

          <div className="relative grid gap-8 p-6 sm:p-9 lg:grid-cols-12 lg:items-stretch lg:gap-12 lg:p-10">
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-brand-100 lg:h-full lg:aspect-auto lg:min-h-[26rem]">
                <Image
                  src={lead.members[0].photo}
                  alt={lead.members[0].name}
                  fill
                  placeholder="blur"
                  sizes="(max-width: 1023px) 90vw, 420px"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center lg:col-span-7">
              <span className="flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] text-ember-600 uppercase">
                <span aria-hidden className="h-px w-8 bg-ember-600/50" />
                {t("groups.lead")}
              </span>

              <p className="font-display mt-5 text-[clamp(2rem,5vw,3.4rem)] leading-[0.98] font-extrabold tracking-[-0.04em] text-brand-900">
                {lead.members[0].name}
              </p>

              <p className="mt-6 max-w-lg text-[15px] leading-[1.85] text-pretty text-brand-800/60 sm:text-[16px]">
                {t("leadNote")}
              </p>

              <dl className="mt-9 grid max-w-md grid-cols-2 gap-px overflow-hidden rounded-2xl bg-brand-900/10">
                <div className="bg-cream-50 p-4">
                  <dt className="text-[10px] font-bold tracking-[0.16em] text-brand-400 uppercase">
                    {t("leadFacts.baseLabel")}
                  </dt>
                  <dd className="font-display mt-1.5 text-[15px] font-bold text-brand-900">
                    {t("leadFacts.base")}
                  </dd>
                </div>
                <div className="bg-cream-50 p-4">
                  <dt className="text-[10px] font-bold tracking-[0.16em] text-brand-400 uppercase">
                    {t("leadFacts.leadingLabel")}
                  </dt>
                  <dd className="font-display mt-1.5 text-[15px] font-bold text-brand-900 tabular-nums">
                    {t("leadFacts.leading")}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {groups.map((group) => (
          <div key={group.key} className="mt-14 sm:mt-18">
            <div
              data-anim="up"
              className="flex items-center gap-4 border-b border-brand-900/12 pb-4"
            >
              <h3 className="font-display text-[11px] font-bold tracking-[0.2em] text-brand-700 uppercase">
                {t(`groups.${group.key}`)}
              </h3>
              <span aria-hidden className="h-px flex-1 bg-brand-900/8" />
              <span className="text-[11px] font-semibold text-brand-400 tabular-nums">
                {String(group.members.length).padStart(2, "0")}
              </span>
            </div>

            <ul
              data-anim-group
              className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
              {group.members.map((member) => (
                <li key={member.name}>
                  <MemberCard member={member} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function MemberCard({ member, className }: { member: Member; className?: string }) {
  return (
    <figure className={cn("group", className)}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-brand-100">
        <Image
          src={member.photo}
          alt={member.name}
          fill
          placeholder="blur"
          sizes="(max-width: 639px) 44vw, (max-width: 1023px) 30vw, 220px"
          className="object-cover transition-transform duration-[900ms] ease-out-expo group-hover:scale-[1.06]"
        />
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-brand-950/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      </div>

      <figcaption className="mt-3">
        <span className="font-display block text-[14px] leading-tight font-bold tracking-[-0.01em] text-brand-900">
          {member.name}
        </span>
        <span
          aria-hidden
          className="mt-2 block h-px w-6 bg-ember-500/60 transition-all duration-500 ease-out-expo group-hover:w-12"
        />
      </figcaption>
    </figure>
  );
}
