import { getTranslations } from "next-intl/server";

import { MyExpeditions } from "@/components/booking/MyExpeditions";
import { Panel, Pill } from "@/components/account/parts";
import { ArrowRight } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/params";
import { listMyBookings, outstanding } from "@/lib/booking/read";
import { formatMoney } from "@/lib/currency";

/** Every expedition this rider is on. */
export default async function BookingsPage({ params }: LayoutProps<"/[locale]">) {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "bookings" });
  const bookings = await listMyBookings();

  const dates = (start: string, end: string) =>
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).formatRange(new Date(`${start}T00:00:00Z`), new Date(`${end}T00:00:00Z`));

  return (
    <div className="space-y-6">
      <MyExpeditions locale={locale} />

      <Panel title={t("title")} lead={t("lead")}>
        {bookings.length === 0 ? (
          <div className="border-brand-900/12 rounded-[20px] border border-dashed px-6 py-12 text-center">
            <p className="text-brand-900/70 text-[14px]">{t("empty")}</p>
            <Link
              href="/adventure-tours"
              className="group bg-brand-800 text-cream-100 hover:bg-brand-900 mt-6 inline-flex h-11 items-center gap-2.5 rounded-full px-6 text-[10.5px] font-bold tracking-[0.12em] uppercase transition-colors"
            >
              {t("browse")}
              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {bookings.map((booking) => {
              const left = outstanding(booking);

              return (
                <li key={booking.id}>
                  <Link
                    href={`/account/bookings/${booking.reference}`}
                    className="group ring-brand-900/8 hover:ring-brand-900/20 flex flex-wrap items-center justify-between gap-5 rounded-[20px] bg-white p-5 ring-1 transition-shadow"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Pill tone={left > 0 ? "pending" : "confirmed"}>
                          {booking.status === "cancelled"
                            ? t("status.cancelled")
                            : left > 0
                              ? t("status.balance")
                              : t("status.paid")}
                        </Pill>
                        <span className="text-brand-800/45 font-mono text-[11.5px]">
                          {booking.reference}
                        </span>
                      </div>

                      <h3 className="font-display text-brand-900 mt-2.5 text-[17px] leading-tight font-bold tracking-[-0.02em]">
                        {booking.tour.title}
                      </h3>

                      <p className="text-brand-800/60 mt-1.5 text-[13.5px]">
                        {dates(booking.departure.start_date, booking.departure.end_date)} ·{" "}
                        {booking.departure.kind === "4x4"
                          ? t("partyPeople", { people: booking.riders })
                          : t("party", { riders: booking.riders, pillions: booking.pillions })}
                      </p>

                      <p className="text-brand-800/45 mt-1 text-[13px]">
                        {left > 0
                          ? t("left", {
                              amount: formatMoney(left, booking.currency as never, locale),
                              date: new Intl.DateTimeFormat(locale, {
                                day: "numeric",
                                month: "long",
                              }).format(new Date(`${booking.balance_due_on}T00:00:00Z`)),
                            })
                          : t("settled")}
                      </p>
                    </div>

                    <span className="border-brand-900/20 text-brand-800 group-hover:border-brand-800 group-hover:bg-brand-800 group-hover:text-cream-100 inline-flex h-11 items-center gap-2.5 rounded-full border px-5 text-[10.5px] font-bold tracking-[0.12em] uppercase transition-colors">
                      {t("view")}
                      <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
