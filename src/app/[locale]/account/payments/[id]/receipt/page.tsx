import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { resolveLocale } from "@/i18n/params";
import { getMyPayment } from "@/lib/booking/read";
import { formatMoney } from "@/lib/currency";
import { contact } from "@/config/contact";
import { siteName } from "@/lib/seo";

export const dynamic = "force-dynamic";

/**
 * A receipt for one payment.
 *
 * Razorpay emails its own confirmation when it captures a payment, but it has
 * no customer-facing document to link to, and what it does send names the
 * gateway rather than the expedition. This is ours: the booking reference, the
 * trip and the dates, which is what somebody actually needs for a visa
 * application or an expense claim.
 *
 * Built to be printed. The browser's own print to PDF is a better document
 * than anything generated server side, and it needs no library.
 */
export default async function ReceiptPage({
  params,
}: PageProps<"/[locale]/account/payments/[id]/receipt">) {
  const { id } = await params;
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "payments" });

  const payment = await getMyPayment(id);
  if (!payment || payment.status !== "paid") notFound();

  const when = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(payment.paid_at ?? payment.created_at));

  const rows: [string, string][] = [
    [t("receipt.reference"), payment.booking.reference],
    [t("receipt.tour"), payment.booking.tour.title],
    [t("receipt.date"), when],
    [t("receipt.kind"), payment.kind],
    ...(payment.method ? ([[t("receipt.method"), payment.method]] as [string, string][]) : []),
    ...(payment.providerPaymentId
      ? ([[t("receipt.transaction"), payment.providerPaymentId]] as [string, string][])
      : []),
  ];

  return (
    <div className="bg-cream-50 min-h-screen px-5 py-10 print:bg-white print:p-0">
      <article className="ring-brand-900/10 mx-auto max-w-2xl rounded-[20px] bg-white p-8 ring-1 sm:p-10 print:rounded-none print:ring-0">
        <header className="border-brand-900/10 flex flex-wrap items-start justify-between gap-4 border-b pb-6">
          <div>
            <p className="text-brand-800/45 text-[10.5px] font-bold tracking-[0.16em] uppercase">
              {t("receipt.title")}
            </p>
            <h1 className="font-display text-brand-900 mt-2 text-[24px] leading-tight font-extrabold tracking-[-0.03em]">
              {siteName}
            </h1>
            <p className="text-brand-800/55 mt-1.5 text-[12.5px]">{contact.email}</p>
          </div>

          <p className="text-brand-900 text-right text-[26px] font-extrabold tabular-nums">
            {formatMoney(payment.amount, payment.currency as never, locale)}
          </p>
        </header>

        <dl className="mt-6 space-y-3.5">
          {rows.map(([label, value]) => (
            <div key={label} className="flex flex-wrap justify-between gap-4">
              <dt className="text-brand-800/55 text-[13px]">{label}</dt>
              <dd className="text-brand-900 text-right text-[13.5px] font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="text-brand-800/45 border-brand-900/10 mt-8 border-t pt-6 text-[12px] leading-[1.7]">
          {t("receipt.note")}
        </p>
      </article>

      <p className="text-brand-800/45 mx-auto mt-5 max-w-2xl text-center text-[12px] print:hidden">
        {t("receipt.print")}
      </p>
    </div>
  );
}
