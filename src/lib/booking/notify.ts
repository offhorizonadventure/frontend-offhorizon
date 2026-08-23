import "server-only";

import { sendMail } from "@/lib/mail";
import { siteName, siteUrl } from "@/lib/seo";
import { createAdminClient } from "@/lib/supabase/admin";

const money = (amount: number, currency: string) => `${currency} ${amount.toLocaleString("en-US")}`;

const day = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(`${value}T00:00:00Z`),
  );

/**
 * Tells the rider their money arrived and what is left.
 *
 * Written in English whatever the reader chose on the site: this is sent from
 * a webhook, which has no locale, and a receipt that says the wrong thing in
 * the right language is worse than a plain one.
 *
 * Never throws. A booking is confirmed by the database, not by an email.
 */
export async function sendPaymentEmail(paymentId: string) {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("payments")
    .select(
      `amount, currency, kind, booking_id,
       booking:bookings(
         reference, status, currency, total_amount, paid_amount, balance_due_on,
         tour:tours(title),
         departure:departures(start_date, end_date)
       )`,
    )
    .eq("id", paymentId)
    .maybeSingle();

  if (!data?.booking) return;

  const booking = data.booking as unknown as {
    reference: string;
    status: string;
    currency: string;
    total_amount: number;
    paid_amount: number;
    balance_due_on: string;
    tour: { title: string };
    departure: { start_date: string; end_date: string };
  };

  const { data: lead } = await supabase
    .from("booking_travellers")
    .select("email, full_name")
    .eq("booking_id", data.booking_id as string)
    .eq("is_lead", true)
    .maybeSingle();

  const to = lead?.email;
  if (!to) return;

  const left = Math.max(0, Math.round((booking.total_amount - booking.paid_amount) * 100) / 100);
  const settled = left <= 0;

  const lines = [
    `Hello ${lead?.full_name?.split(" ")[0] ?? "there"},`,
    "",
    `We have received ${money(data.amount, data.currency)} towards your expedition. Your place is confirmed.`,
    "",
    `Expedition: ${booking.tour.title}`,
    `Dates: ${day(booking.departure.start_date)} to ${day(booking.departure.end_date)}`,
    `Booking reference: ${booking.reference}`,
    `Paid so far: ${money(booking.paid_amount, booking.currency)} of ${money(booking.total_amount, booking.currency)}`,
    "",
    settled
      ? "Nothing is outstanding. Your documents form is now open in your account, and we need it back before you travel."
      : `Still to pay: ${money(left, booking.currency)}, and all of it is due by ${day(booking.balance_due_on)}. You can pay any amount, as many times as you like, from your account.`,
    "",
    `Your booking: ${siteUrl}/en/account/bookings/${booking.reference}`,
    "",
    "If anything here looks wrong, reply to this email and we will sort it out.",
    "",
    siteName,
  ];

  await sendMail({
    to,
    subject: settled
      ? `${booking.tour.title} is paid in full (${booking.reference})`
      : `Payment received for ${booking.tour.title} (${booking.reference})`,
    text: lines.join("\n"),
  });
}
