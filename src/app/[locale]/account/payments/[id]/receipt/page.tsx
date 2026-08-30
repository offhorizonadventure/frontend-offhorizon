import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PrintReceipt } from "@/components/account/PrintReceipt";
import { resolveLocale } from "@/i18n/params";
import { getMyReceipt } from "@/lib/booking/read";
import { formatMoney } from "@/lib/currency";
import { contact } from "@/config/contact";
import { siteName, siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

function Cell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-brand-800/45 text-[9.5px] font-bold tracking-[0.14em] uppercase">
        {label}
      </dt>
      <dd className="text-brand-900 mt-1 text-[13px] font-semibold">{value}</dd>
    </div>
  );
}

export default async function ReceiptPage({
  params,
}: PageProps<"/[locale]/account/payments/[id]/receipt">) {
  const { id } = await params;
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "payments" });

  const receipt = await getMyReceipt(id);
  if (!receipt || receipt.status !== "paid") notFound();

  const { booking } = receipt;

  const day = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(value));

  const money = (amount: number, currency = booking.currency) =>
    formatMoney(amount, currency as never, locale);

  const paidOn = day(receipt.paid_at ?? receipt.created_at);
  const outstanding = Math.max(
    0,
    Math.round((booking.total_amount - booking.paid_amount) * 100) / 100,
  );
  const settled = outstanding <= 0;

  // Short enough to read down a phone line, and unique to this payment.
  const number = `${booking.reference}-${receipt.id.slice(0, 6).toUpperCase()}`;

  const party = [
    t("receipt.riders", { count: booking.riders }),
    booking.pillions ? t("receipt.pillions", { count: booking.pillions }) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="bg-cream-50 px-5 py-10 print:bg-white print:p-0">
      <article
        data-receipt
        className="ring-brand-900/10 mx-auto max-w-2xl rounded-[20px] bg-white p-8 ring-1 sm:p-10 print:max-w-none print:rounded-none print:p-0 print:ring-0"
      >
        <header className="border-brand-900/10 flex flex-wrap items-start justify-between gap-6 border-b pb-6">
          <div>
            <p className="font-display text-brand-900 text-[21px] leading-none font-extrabold tracking-[-0.03em]">
              {siteName}
            </p>
            <p className="text-brand-800/55 mt-2.5 text-[11.5px] leading-[1.6]">
              {contact.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              {contact.email} · {contact.phoneDisplay}
            </p>
          </div>

          <div className="text-right">
            <p className="text-ember-600 text-[10px] font-bold tracking-[0.18em] uppercase">
              {t("receipt.title")}
            </p>
            <p className="text-brand-900 mt-1.5 font-mono text-[12.5px] font-semibold">{number}</p>
            <p className="text-brand-800/50 mt-1 text-[11.5px]">{paidOn}</p>
          </div>
        </header>

        <section className="border-brand-900/10 flex flex-wrap items-end justify-between gap-4 border-b py-6">
          <div>
            <p className="text-brand-800/45 text-[9.5px] font-bold tracking-[0.14em] uppercase">
              {t("receipt.paidBy")}
            </p>
            <p className="text-brand-900 mt-1.5 text-[15px] font-bold">
              {receipt.lead?.full_name ?? "—"}
            </p>
            {receipt.lead?.email && (
              <p className="text-brand-800/55 text-[12px]">{receipt.lead.email}</p>
            )}
          </div>

          <div className="text-right">
            <p className="text-brand-800/45 text-[9.5px] font-bold tracking-[0.14em] uppercase">
              {t("receipt.amountPaid")}
            </p>
            <p className="font-display text-brand-900 mt-1 text-[30px] leading-none font-extrabold tabular-nums">
              {money(receipt.amount, receipt.currency)}
            </p>
          </div>
        </section>

        <section className="border-brand-900/10 border-b py-6">
          <p className="text-brand-800/45 text-[9.5px] font-bold tracking-[0.14em] uppercase">
            {t("receipt.expedition")}
          </p>
          <p className="font-display text-brand-900 mt-1.5 text-[17px] font-extrabold tracking-[-0.02em]">
            {booking.tour.title}
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <Cell label={t("receipt.reference")} value={booking.reference} />
            {booking.departure && (
              <Cell
                label={t("receipt.dates")}
                value={`${day(booking.departure.start_date)} – ${day(booking.departure.end_date)}`}
              />
            )}
            <Cell label={t("receipt.party")} value={party} />
          </dl>
        </section>

        <section className="border-brand-900/10 border-b py-6">
          <p className="text-brand-800/45 text-[9.5px] font-bold tracking-[0.14em] uppercase">
            {t("receipt.thisPayment")}
          </p>

          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <Cell label={t("receipt.date")} value={paidOn} />
            <Cell label={t("receipt.kind")} value={receipt.kind} />
            {receipt.method && <Cell label={t("receipt.method")} value={receipt.method} />}
            {receipt.providerPaymentId && (
              <Cell
                label={t("receipt.transaction")}
                value={<span className="font-mono text-[11.5px]">{receipt.providerPaymentId}</span>}
              />
            )}
          </dl>
        </section>

        <section className="py-6">
          <p className="text-brand-800/45 text-[9.5px] font-bold tracking-[0.14em] uppercase">
            {t("receipt.balance")}
          </p>

          <dl className="mt-4 space-y-2.5">
            <div className="flex justify-between gap-4 text-[13px]">
              <dt className="text-brand-800/60">{t("receipt.total")}</dt>
              <dd className="text-brand-900 font-semibold tabular-nums">
                {money(booking.total_amount)}
              </dd>
            </div>

            <div className="flex justify-between gap-4 text-[13px]">
              <dt className="text-brand-800/60">{t("receipt.paidToDate")}</dt>
              <dd className="text-brand-900 font-semibold tabular-nums">
                {money(booking.paid_amount)}
              </dd>
            </div>

            <div
              className={`border-brand-900/10 flex justify-between gap-4 border-t pt-2.5 text-[14px] font-bold ${
                settled ? "text-brand-900" : "text-ember-600"
              }`}
            >
              <dt>{settled ? t("receipt.settled") : t("receipt.outstanding")}</dt>
              <dd className="tabular-nums">{money(outstanding)}</dd>
            </div>
          </dl>

          {!settled && (
            <p className="text-brand-800/55 mt-3.5 text-[12px]">
              {t("receipt.dueBy", { date: day(booking.balance_due_on) })}
            </p>
          )}
        </section>

        <footer className="border-brand-900/10 border-t pt-5">
          <p className="text-brand-800/45 text-[11px] leading-[1.7]">{t("receipt.note")}</p>
          <p className="text-brand-800/35 mt-2 text-[10.5px]">
            {siteUrl.replace(/^https?:\/\//, "")}
          </p>
        </footer>
      </article>

      <div className="mx-auto mt-6 flex max-w-2xl flex-col items-center gap-3 print:hidden">
        <PrintReceipt label={t("receipt.printButton")} />
        <p className="text-brand-800/45 text-center text-[12px]">{t("receipt.print")}</p>
      </div>
    </div>
  );
}
