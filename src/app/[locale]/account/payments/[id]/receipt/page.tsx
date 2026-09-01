import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { PrintReceipt } from "@/components/account/PrintReceipt";
import { resolveLocale } from "@/i18n/params";
import { getMyReceipt } from "@/lib/booking/read";
import { formatMoney } from "@/lib/currency";
import { contact } from "@/config/contact";
import { siteName, siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

/** Registered for tax. Printed on every receipt, as it has to be. */
const GST = "02AAFCO2732H1ZU";

const label = "text-brand-800/45 text-[8px] font-bold tracking-[0.16em] uppercase";

function Fact({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className={label}>{title}</dt>
      <dd className="text-brand-900 mt-1 text-[12.5px] leading-snug font-semibold">{value}</dd>
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
        className="ring-brand-900/10 mx-auto flex max-w-2xl flex-col overflow-hidden rounded-[20px] bg-white ring-1 print:max-w-none print:rounded-none print:ring-0"
      >
        {/* The brand carries the top of the page, so the sheet reads as a
            document from a company rather than as a printed web page. */}
        <header className="bg-brand-900 text-cream-100 flex items-start justify-between gap-6 px-8 py-6 sm:px-10 print:px-8">
          <div>
            <Image
              src="/logo/logo-horizontal-cream.png"
              alt={siteName}
              width={2589}
              height={546}
              sizes="220px"
              className="h-8 w-auto"
              priority
            />
            <p className="text-cream-100/55 mt-3 text-[10px] leading-[1.7]">
              {contact.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              {contact.email} · {contact.phoneDisplay}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-ember-400 text-[9px] font-bold tracking-[0.2em] uppercase">
              {t("receipt.title")}
            </p>
            <p className="mt-1.5 font-mono text-[12px] font-semibold">{number}</p>
            <p className="text-cream-100/55 mt-0.5 text-[10.5px]">{paidOn}</p>
            <p className="text-cream-100/45 mt-3 text-[9.5px] tracking-[0.06em]">GSTIN {GST}</p>
          </div>
        </header>

        {/* What was paid, said once and said plainly. */}
        <section className="bg-cream-50 border-brand-900/8 flex flex-wrap items-end justify-between gap-5 border-b px-8 py-6 sm:px-10 print:px-8">
          <div>
            <p className={label}>{t("receipt.paidBy")}</p>
            <p className="text-brand-900 mt-1.5 text-[15px] leading-tight font-bold">
              {receipt.lead?.full_name ?? "—"}
            </p>
            {receipt.lead?.email && (
              <p className="text-brand-800/55 mt-0.5 text-[11.5px]">{receipt.lead.email}</p>
            )}
          </div>

          <div className="text-right">
            <p className={label}>{t("receipt.amountPaid")}</p>
            <p className="font-display text-brand-900 mt-1 text-[30px] leading-none font-extrabold tabular-nums">
              {money(receipt.amount, receipt.currency)}
            </p>
            <p
              className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[8.5px] font-bold tracking-[0.14em] uppercase ${
                settled ? "bg-brand-900 text-cream-100" : "bg-ember-500/15 text-ember-600"
              }`}
            >
              {settled ? t("receipt.settled") : t("receipt.partPayment")}
            </p>
          </div>
        </section>

        <section className="px-8 py-6 sm:px-10 print:px-8">
          <p className={label}>{t("receipt.expedition")}</p>
          <p className="font-display text-brand-900 mt-1.5 text-[17px] leading-tight font-extrabold tracking-[-0.02em]">
            {booking.tour.title}
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
            <Fact title={t("receipt.reference")} value={booking.reference} />
            {booking.departure && (
              <Fact
                title={t("receipt.dates")}
                value={`${day(booking.departure.start_date)} – ${day(booking.departure.end_date)}`}
              />
            )}
            <Fact title={t("receipt.party")} value={party} />
            <Fact title={t("receipt.kind")} value={receipt.kind} />
            {receipt.method && <Fact title={t("receipt.method")} value={receipt.method} />}
            {receipt.providerPaymentId && (
              <Fact
                title={t("receipt.transaction")}
                value={<span className="font-mono text-[11px]">{receipt.providerPaymentId}</span>}
              />
            )}
          </dl>
        </section>

        <section className="px-8 pb-7 sm:px-10 print:px-8">
          <div className="ring-brand-900/10 overflow-hidden rounded-xl ring-1">
            <p className={`${label} bg-cream-50 border-brand-900/8 border-b px-4 py-2.5`}>
              {t("receipt.balance")}
            </p>

            <dl className="px-4 py-3">
              <div className="border-brand-900/8 flex justify-between gap-4 border-b py-2 text-[12.5px]">
                <dt className="text-brand-800/60">{t("receipt.total")}</dt>
                <dd className="text-brand-900 font-semibold tabular-nums">
                  {money(booking.total_amount)}
                </dd>
              </div>

              <div className="border-brand-900/8 flex justify-between gap-4 border-b py-2 text-[12.5px]">
                <dt className="text-brand-800/60">{t("receipt.paidToDate")}</dt>
                <dd className="text-brand-900 font-semibold tabular-nums">
                  {money(booking.paid_amount)}
                </dd>
              </div>

              <div
                className={`flex items-baseline justify-between gap-4 pt-2.5 text-[14px] font-bold ${
                  settled ? "text-brand-900" : "text-ember-600"
                }`}
              >
                <dt>{settled ? t("receipt.settled") : t("receipt.outstanding")}</dt>
                <dd className="font-display text-[17px] tabular-nums">{money(outstanding)}</dd>
              </div>
            </dl>
          </div>

          {!settled && (
            <p className="text-brand-800/55 mt-3 text-[11px]">
              {t("receipt.dueBy", { date: day(booking.balance_due_on) })}
            </p>
          )}
        </section>

        {/* Pushed to the foot of the sheet when it prints, so the blank part of
            the page sits between the figures and the small print rather than
            trailing off the bottom. */}
        <footer className="border-brand-900/10 mt-auto flex items-end justify-between gap-6 border-t px-8 py-5 sm:px-10 print:px-8">
          <p className="text-brand-800/45 max-w-md text-[9.5px] leading-[1.7]">
            {t("receipt.note")}
          </p>
          <p className="text-brand-800/35 shrink-0 text-[9.5px] font-semibold">
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
