import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Instagram, LinkedIn } from "@/components/ui/icons";
import { Topo } from "@/components/ui/Topo";
import { team, type Member } from "@/config/team";
import { cn } from "@/lib/cn";

/** Crew, grouped by function. */
export async function Team() {
  const t = await getTranslations("about.team");

  const [lead, ...groups] = team;

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div data-anim="up" className="max-w-2xl">
          <span className="text-ember-500 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
            <span aria-hidden className="bg-ember-500/60 h-px w-8" />
            {t("eyebrow")}
          </span>
          <h2 className="font-display text-brand-900 mt-5 text-[clamp(1.85rem,3.6vw,2.9rem)] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance">
            {t("title")}
          </h2>
          <p className="text-brand-800/60 mt-4 text-[15px] leading-[1.8] text-pretty">
            {t("body")}
          </p>
        </div>

        {/** Lead card. */}
        <div
          data-anim="up"
          className="bg-cream-50 relative mt-12 overflow-hidden rounded-[32px] sm:mt-16"
        >
          <Topo className="text-brand-800/10" rings={9} seed={12.5} />

          <div className="relative grid gap-8 p-6 sm:p-9 lg:grid-cols-12 lg:items-stretch lg:gap-12 lg:p-10">
            <div className="lg:col-span-5">
              <div className="bg-brand-100 relative aspect-[4/5] overflow-hidden rounded-[24px] lg:aspect-auto lg:h-full lg:min-h-[26rem]">
                <Image
                  src={lead.members[0].photo}
                  alt={lead.members[0].name}
                  fill
                  sizes="(max-width: 1023px) 90vw, 420px"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center lg:col-span-7">
              <span className="text-ember-600 flex items-center gap-3 text-[10.5px] font-bold tracking-[0.2em] uppercase">
                <span aria-hidden className="bg-ember-600/50 h-px w-8" />
                {t("groups.lead")}
              </span>

              <p className="font-display text-brand-900 mt-5 text-[clamp(2rem,5vw,3.4rem)] leading-[0.98] font-extrabold tracking-[-0.04em]">
                {lead.members[0].name}
              </p>

              <p className="text-brand-800/60 mt-6 max-w-lg text-[15px] leading-[1.85] text-pretty sm:text-[16px]">
                {t("leadNote")}
              </p>

              <dl className="bg-brand-900/10 mt-9 grid max-w-md grid-cols-2 gap-px overflow-hidden rounded-2xl">
                <div className="bg-cream-50 p-4">
                  <dt className="text-brand-400 text-[10px] font-bold tracking-[0.16em] uppercase">
                    {t("leadFacts.baseLabel")}
                  </dt>
                  <dd className="font-display text-brand-900 mt-1.5 text-[15px] font-bold">
                    {t("leadFacts.base")}
                  </dd>
                </div>
                <div className="bg-cream-50 p-4">
                  <dt className="text-brand-400 text-[10px] font-bold tracking-[0.16em] uppercase">
                    {t("leadFacts.leadingLabel")}
                  </dt>
                  <dd className="font-display text-brand-900 mt-1.5 text-[15px] font-bold tabular-nums">
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
              className="border-brand-900/12 flex items-center gap-4 border-b pb-4"
            >
              <h3 className="font-display text-brand-700 text-[11px] font-bold tracking-[0.2em] uppercase">
                {t(`groups.${group.key}`)}
              </h3>
              <span aria-hidden className="bg-brand-900/8 h-px flex-1" />
              <span className="text-brand-400 text-[11px] font-semibold tabular-nums">
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
      <div className="bg-brand-100 relative aspect-[3/4] overflow-hidden rounded-2xl">
        <Image
          src={member.photo}
          alt={member.name}
          fill
          sizes="(max-width: 639px) 44vw, (max-width: 1023px) 30vw, 220px"
          className="ease-out-expo object-cover transition-transform duration-[900ms] group-hover:scale-[1.06]"
        />
        <span
          aria-hidden
          className="from-brand-950/45 absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      </div>

      <figcaption className="mt-3">
        <span className="font-display text-brand-900 block text-[14px] leading-tight font-bold tracking-[-0.01em]">
          {member.name}
        </span>

        {member.links ? (
          // Icons only, and only where somebody works in the open. The rest of
          // the crew are not on the internet for a living and are not linked.
          <span className="mt-2 flex items-center gap-2.5">
            {member.links.linkedin && (
              <a
                href={member.links.linkedin}
                target="_blank"
                rel="noopener noreferrer me"
                aria-label={`${member.name} on LinkedIn`}
                className="text-brand-800/45 hover:text-brand-900 transition-colors"
              >
                <LinkedIn />
              </a>
            )}
            {member.links.instagram && (
              <a
                href={member.links.instagram}
                target="_blank"
                rel="noopener noreferrer me"
                aria-label={`${member.name} on Instagram`}
                className="text-brand-800/45 hover:text-brand-900 transition-colors"
              >
                <Instagram />
              </a>
            )}
          </span>
        ) : (
          <span
            aria-hidden
            className="bg-ember-500/60 ease-out-expo mt-2 block h-px w-6 transition-all duration-500 group-hover:w-12"
          />
        )}
      </figcaption>
    </figure>
  );
}
