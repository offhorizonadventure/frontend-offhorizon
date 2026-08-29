import { getTranslations } from "next-intl/server";

import type { Locale } from "@/i18n/config";
import type { PricedBooking } from "@/lib/booking/preview";

export async function Summary({ locale, priced }: { locale: Locale; priced: PricedBooking }) {
  const t = await getTranslations({ locale, namespace: "checkout" });

  const byPerson = priced.kind === "4x4";

  const amountFor = (key: string) => priced.lines.find((line) => line.key === key)?.label ?? null;

  const countAnd = (count: number, key: string) => {
    const amount = amountFor(key);
    return amount ? `${count} · ${amount}` : String(count);
  };

  const rows: { label: string; value: string }[] = [
    { label: t("dates"), value: priced.dates },
    {
      label: byPerson ? t("people") : t("riders"),
      value: countAnd(priced.party.riders, "rider"),
    },
  ];

  if (priced.party.pillions) {
    rows.push({ label: t("pillions"), value: countAnd(priced.party.pillions, "pillion") });
  }
  if (priced.party.singleRooms) {
    rows.push({ label: t("rooms"), value: countAnd(priced.party.singleRooms, "room") });
  }
  if (priced.party.damageProtection) {
    rows.push({
      label: t("protection"),
      value: countAnd(priced.party.damageProtection, "protection"),
    });
  }
  if (priced.vehicleName) {
    const amount = amountFor("vehicle");
    rows.push({
      label: t("vehicle"),
      value: amount ? `${priced.vehicleName} · ${amount}` : priced.vehicleName,
    });
  }
  if (priced.party.ownVehicle) {
    rows.push({ label: t("vehicle"), value: t("ownVehicle") });
  }

  return (
    <div className="bg-paper ring-brand-900/10 sticky top-28 rounded-[24px] p-6 ring-1 sm:p-7">
      <h2 className="font-display text-brand-900 text-[17px] leading-tight font-bold tracking-[-0.02em]">
        {priced.tourTitle}
      </h2>

      <dl className="border-brand-900/10 mt-5 space-y-3 border-t pt-5">
        {rows.map((row) => (
          <div key={row.label + row.value} className="flex items-baseline justify-between gap-4">
            <dt className="text-brand-800/45 text-[10.5px] font-bold tracking-[0.16em] uppercase">
              {row.label}
            </dt>
            <dd className="text-brand-900 text-right text-[13.5px] font-semibold">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="border-brand-900/10 mt-5 flex items-baseline justify-between gap-4 border-t pt-5">
        <span className="text-brand-800/45 text-[10.5px] font-bold tracking-[0.16em] uppercase">
          {t("total")}
        </span>
        <span className="font-display text-brand-900 text-[24px] leading-none font-extrabold tracking-[-0.03em] tabular-nums">
          {priced.totalLabel}
        </span>
      </div>

      <p className="text-brand-800/45 mt-4 text-[11px] leading-relaxed">{t("note")}</p>
    </div>
  );
}
