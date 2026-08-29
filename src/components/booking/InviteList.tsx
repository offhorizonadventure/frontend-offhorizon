import { getTranslations } from "next-intl/server";

import { Panel } from "@/components/account/parts";
import { CopyLink } from "@/components/booking/CopyLink";
import { SeatName } from "@/components/booking/SeatName";
import type { Locale } from "@/i18n/config";
import type { TravellerRow } from "@/lib/booking/read";

export async function InviteList({
  locale,
  travellers,
  isLead,
  byPerson,
  origin,
  joinPath,
}: {
  locale: Locale;
  travellers: TravellerRow[];
  isLead: boolean;
  byPerson: boolean;
  origin: string;
  joinPath: string;
}) {
  const t = await getTranslations({ locale, namespace: "bookings.detail" });

  const riders = travellers.filter((entry) => entry.role === "rider");
  const pillions = travellers.filter((entry) => entry.role === "pillion");
  const open = riders.filter((entry) => !entry.user_id && entry.invite_token);

  const nameLabels = {
    edit: t("nameEdit"),
    save: t("nameSave"),
    cancel: t("nameCancel"),
    placeholder: t("namePlaceholder"),
  };

  return (
    <Panel title={t("groupTitle")} lead={isLead && open.length > 0 ? t("inviteLead") : undefined}>
      <ul className="border-brand-900/10 divide-brand-900/10 divide-y border-t">
        {riders.map((rider, index) => (
          <li key={rider.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
            <span className="min-w-0">
              {isLead && !rider.user_id ? (
                <SeatName
                  travellerId={rider.id}
                  name={rider.full_name}
                  fallback={`${byPerson ? t("person") : t("rider")} ${index + 1}`}
                  labels={nameLabels}
                />
              ) : (
                <span className="text-brand-900 block text-[13.5px] font-semibold">
                  {rider.full_name || `${byPerson ? t("person") : t("rider")} ${index + 1}`}
                </span>
              )}
              <span className="text-brand-800/50 text-[12.5px]">
                {rider.is_lead ? t("lead") : rider.user_id ? t("joined") : t("unclaimed")}
              </span>
            </span>

            {isLead && !rider.user_id && rider.invite_token && (
              <CopyLink
                url={`${origin}${joinPath}/${rider.invite_token}`}
                labels={{ copy: t("copy"), copied: t("copied") }}
              />
            )}
          </li>
        ))}

        {pillions.map((pillion, index) => (
          <li key={pillion.id} className="py-3.5">
            {isLead ? (
              <SeatName
                travellerId={pillion.id}
                name={pillion.full_name}
                fallback={`${t("pillion")} ${index + 1}`}
                labels={nameLabels}
              />
            ) : (
              <span className="text-brand-900 block text-[13.5px] font-semibold">
                {pillion.full_name || `${t("pillion")} ${index + 1}`}
              </span>
            )}
            <span className="text-brand-800/50 text-[12.5px]">{t("pillion")}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
