import { getTranslations } from "next-intl/server";

import { Panel, Pill } from "@/components/account/parts";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/params";
import { listMyPayments } from "@/lib/booking/read";
import { formatMoney } from "@/lib/currency";

/** Every payment this rider has made. */
export default async function PaymentsPage({ params }: LayoutProps<"/[locale]">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "payments" });
  const payments = await listMyPayments();

  const day = (value: string) =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(
      new Date(value),
    );

  return (
    <Panel title={t("title")} lead={t("lead")}>
      {payments.length === 0 ? (
        <div className="border-brand-900/12 rounded-[20px] border border-dashed px-6 py-12 text-center">
          <p className="text-brand-900/70 text-[14px]">{t("empty")}</p>
        </div>
      ) : (
        <ul className="border-brand-900/10 divide-brand-900/10 divide-y border-t">
          {payments.map((payment) => (
            <li key={payment.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Pill tone={payment.status === "paid" ? "confirmed" : "pending"}>
                    {payment.status === "refunded"
                      ? t("refunded")
                      : payment.status === "paid"
                        ? t("paid")
                        : t("processing")}
                  </Pill>
                  <Link
                    href={`/account/bookings/${payment.booking.reference}`}
                    className="text-brand-800/55 hover:text-brand-900 font-mono text-[11.5px] underline underline-offset-2"
                  >
                    {payment.booking.reference}
                  </Link>
                </div>

                <p className="text-brand-900 mt-2 text-[14px] font-semibold">
                  {payment.booking.tour.title}
                </p>

                <p className="text-brand-800/50 mt-1 text-[12.5px]">
                  {payment.paid_at ? day(payment.paid_at) : day(payment.created_at)}
                  {" · "}
                  {t(`kind.${payment.kind as "deposit" | "full" | "instalment"}`)}
                  {payment.method ? ` · ${payment.method}` : ""}
                </p>
              </div>

              <span className="font-display text-brand-900 text-[17px] font-extrabold tabular-nums">
                {formatMoney(payment.amount, payment.currency as never, locale)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-brand-800/45 mt-6 text-[12.5px] leading-relaxed">{t("receipts")}</p>
    </Panel>
  );
}
