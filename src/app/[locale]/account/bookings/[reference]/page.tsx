import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { DocumentsCard } from "@/components/booking/DocumentsCard";
import { InstalmentForm } from "@/components/booking/InstalmentForm";
import { InviteList } from "@/components/booking/InviteList";
import { Panel, Pill } from "@/components/account/parts";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/params";
import { getMyBooking, outstanding } from "@/lib/booking/read";
import { razorpayConfigured, razorpayKeyId } from "@/lib/booking/razorpay";
import { formatMoney } from "@/lib/currency";
import { getProfile } from "@/lib/profile";
import { siteName, siteUrl } from "@/lib/seo";

export default async function BookingPage({
  params,
}: PageProps<"/[locale]/account/bookings/[reference]">) {
  const locale = await resolveLocale(params);
  const { reference } = await params;

  const found = await getMyBooking(reference);
  if (!found) notFound();

  const { booking, travellers, payments, mine, isLead, formUrl } = found;
  const t = await getTranslations({ locale, namespace: "bookings" });
  const profile = await getProfile();

  const left = outstanding(booking);
  const money = (amount: number) => formatMoney(amount, booking.currency as never, locale);
  const day = (value: string) =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(
      new Date(`${value}T00:00:00Z`),
    );

  const facts = [
    { label: t("detail.reference"), value: booking.reference },
    {
      label: t("detail.dates"),
      value: new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).formatRange(
        new Date(`${booking.departure.start_date}T00:00:00Z`),
        new Date(`${booking.departure.end_date}T00:00:00Z`),
      ),
    },
    {
      label: t("detail.party"),
      value:
        booking.departure.kind === "4x4"
          ? t("partyPeople", { people: booking.riders })
          : t("party", { riders: booking.riders, pillions: booking.pillions }),
    },
    { label: t("detail.total"), value: money(booking.total_amount) },
    { label: t("detail.paid"), value: money(booking.paid_amount) },
    { label: t("detail.outstanding"), value: money(left) },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/account/bookings"
        className="text-brand-800/60 hover:text-brand-900 inline-flex text-[12px] font-semibold tracking-[0.06em] uppercase"
      >
        {t("detail.back")}
      </Link>

      <Panel
        title={booking.tour.title}
        lead={
          booking.status === "cancelled"
            ? t("detail.cancelled")
            : left > 0
              ? t("detail.dueOn", { date: day(booking.balance_due_on) })
              : t("detail.settled")
        }
        action={
          <Pill tone={left > 0 ? "pending" : "confirmed"}>
            {booking.status === "cancelled"
              ? t("status.cancelled")
              : left > 0
                ? t("status.balance")
                : t("status.paid")}
          </Pill>
        }
      >
        <dl className="border-brand-900/10 grid gap-x-8 gap-y-4 border-t pt-6 sm:grid-cols-2">
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-baseline justify-between gap-4">
              <dt className="text-brand-800/45 text-[10.5px] font-bold tracking-[0.16em] uppercase">
                {fact.label}
              </dt>
              <dd className="text-brand-900 text-right text-[13.5px] font-semibold tabular-nums">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </Panel>

      {left > 0 && booking.status !== "cancelled" && (
        <Panel title={t("detail.payTitle")} lead={isLead ? t("detail.payLead") : undefined}>
          {isLead ? (
            <InstalmentForm
              keyId={razorpayConfigured() ? razorpayKeyId() : ""}
              siteName={siteName}
              reference={booking.reference}
              currency={booking.currency}
              outstanding={left}
              profile={{
                name: profile?.full_name ?? "",
                email: profile?.email ?? "",
                phone: profile?.phone ?? "",
              }}
              labels={{
                amount: t("detail.amount"),
                pay: t("detail.pay"),
                paying: t("detail.paying"),
                opening: t("detail.opening"),
                dismissed: t("detail.dismissed"),
                unavailable: t("detail.unavailable"),
              }}
            />
          ) : (
            <p className="text-brand-800/60 text-[13.5px]">{t("detail.leadOnly")}</p>
          )}
        </Panel>
      )}

      <Panel title={t("detail.formTitle")}>
        {formUrl && mine ? (
          <DocumentsCard
            travellerId={mine.id}
            formUrl={formUrl}
            submitted={mine.form_submitted}
            labels={{
              lead: t("detail.formLead"),
              open: t("detail.formOpen"),
              done: t("detail.formDone"),
              saved: t("detail.formSaved"),
            }}
          />
        ) : (
          <p className="text-brand-800/60 text-[13.5px]">{t("detail.formLocked")}</p>
        )}
      </Panel>

      <InviteList
        locale={locale}
        travellers={travellers}
        isLead={isLead}
        byPerson={booking.departure.kind === "4x4"}
        origin={siteUrl}
        joinPath={`/${locale}/booking/join`}
      />

      {payments.length > 0 && (
        <Panel title={t("detail.paymentsTitle")}>
          <ul className="border-brand-900/10 divide-brand-900/10 divide-y border-t">
            {payments.map((payment) => (
              <li key={payment.id} className="flex items-baseline justify-between gap-4 py-3.5">
                <span className="text-brand-900 text-[13.5px] font-semibold">
                  {t(`detail.paymentKind.${payment.kind as "deposit" | "full" | "instalment"}`)}
                  <span className="text-brand-800/45 ml-2 text-[12.5px] font-normal">
                    {payment.paid_at ? day(payment.paid_at.slice(0, 10)) : ""}
                  </span>
                </span>
                <span className="text-brand-900 text-[13.5px] font-semibold tabular-nums">
                  {formatMoney(payment.amount, payment.currency as never, locale)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
