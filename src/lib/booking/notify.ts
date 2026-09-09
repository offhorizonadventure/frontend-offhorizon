import "server-only";

import { sendMail } from "@/lib/mail";
import { renderEmail } from "@/lib/email-layout";
import { siteUrl } from "@/lib/seo";
import { createAdminClient } from "@/lib/supabase/admin";

const money = (amount: number, currency: string) => `${currency} ${amount.toLocaleString("en-US")}`;

const day = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(`${value}T00:00:00Z`),
  );

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

  const first = lead?.full_name?.trim().split(/\s+/)[0] ?? "there";
  const bookingUrl = `${siteUrl}/en/account/bookings/${booking.reference}`;

  const { html, text } = renderEmail({
    preheader: settled
      ? `${booking.tour.title} is fully paid.`
      : `We got your payment of ${money(data.amount, data.currency)}.`,
    heading: settled ? "Fully paid. You are all set." : "We have got your money",
    figure: { label: "Money received", value: money(data.amount, data.currency) },
    paragraphs: [
      `Hello ${first},`,
      settled
        ? "Thank you. Your trip is now fully paid. Your seat is booked and nothing more is left to pay."
        : "Thank you. Your seat is booked. What is left to pay is written below.",
    ],
    facts: [
      ["Trip", booking.tour.title],
      ["Dates", `${day(booking.departure.start_date)} to ${day(booking.departure.end_date)}`],
      ["Booking number", booking.reference],
      ["Paid till now", money(booking.paid_amount, booking.currency)],
      ["Total price", money(booking.total_amount, booking.currency)],
      ...(settled
        ? []
        : ([
            ["Left to pay", money(left, booking.currency)],
            ["Pay by", day(booking.balance_due_on)],
          ] as [string, string][])),
    ],
    cta: { label: "See your booking", href: bookingUrl },
    note: settled
      ? "Please open your account and fill the rider form. We need it before you travel. If something here looks wrong, just reply to this email."
      : "You can pay the rest any time from your account. Pay it all at once, or a little at a time. If something here looks wrong, just reply to this email.",
  });

  await sendMail({
    to,
    subject: settled
      ? `${booking.tour.title} is fully paid (${booking.reference})`
      : `We got your payment for ${booking.tour.title} (${booking.reference})`,
    text,
    html,
  });
}
