import { getTranslations } from "next-intl/server";

import { Panel, Pill } from "@/components/account/parts";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/params";
import { listMyPayments } from "@/lib/booking/read";
import { formatMoney } from "@/lib/currency";

const head = "px-4 py-3 text-[10px] font-bold tracking-[0.14em] text-brand-800/45 uppercase";
const cell = "px-4 py-4 align-top text-[13.5px] text-brand-900/80";

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
        <div className="ring-brand-900/10 overflow-x-auto rounded-[18px] ring-1">
          <table className="w-full min-w-[46rem] border-collapse bg-white text-left">
            <thead className="bg-brand-900/4">
              <tr>
                <th className={head}>{t("colBooking")}</th>
                <th className={head}>{t("colTour")}</th>
                <th className={head}>{t("colDate")}</th>
                <th className={`${head} text-right`}>{t("colAmount")}</th>
                <th className={head}>{t("colReceipt")}</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-brand-900/8 hover:bg-brand-900/3 border-t transition-colors"
                >
                  <td className={`${cell} font-mono text-[12.5px] whitespace-nowrap`}>
                    <Link
                      href={`/account/bookings/${payment.booking.reference}`}
                      className="hover:text-brand-900 underline underline-offset-2"
                    >
                      {payment.booking.reference}
                    </Link>
                  </td>

                  <td className={cell}>
                    {payment.booking.tour.title}
                    <span className="text-brand-800/45 mt-1 block text-[12px]">
                      {payment.kind}
                      {payment.method ? ` · ${payment.method}` : ""}
                    </span>
                  </td>

                  <td className={`${cell} whitespace-nowrap`}>
                    {day(payment.paid_at ?? payment.created_at)}
                  </td>

                  <td className={`${cell} text-right font-semibold whitespace-nowrap tabular-nums`}>
                    {formatMoney(payment.amount, payment.currency as never, locale)}
                    <span className="mt-1.5 block">
                      <Pill tone={payment.status === "paid" ? "confirmed" : "pending"}>
                        {payment.status === "refunded"
                          ? t("refunded")
                          : payment.status === "paid"
                            ? t("paid")
                            : t("processing")}
                      </Pill>
                    </span>
                  </td>

                  <td className={cell}>
                    {/* Only a settled payment has anything to show a receipt for. */}
                    {payment.status === "paid" ? (
                      <Link
                        href={`/account/payments/${payment.id}/receipt`}
                        className="text-brand-900 decoration-ember-500/50 hover:decoration-ember-500 text-[12.5px] font-semibold underline underline-offset-[3px] transition-colors"
                      >
                        {t("receipt.download")}
                      </Link>
                    ) : (
                      <span className="text-brand-800/35 text-[12.5px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-brand-800/45 mt-5 text-[12px] leading-[1.7]">{t("receipts")}</p>
    </Panel>
  );
}
