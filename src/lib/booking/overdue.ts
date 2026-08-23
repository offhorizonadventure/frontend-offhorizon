import "server-only";

import { sendMail } from "@/lib/mail";
import { siteName } from "@/lib/seo";
import { createAdminClient } from "@/lib/supabase/admin";

/** Cancels every booking that still owes money past its deadline. */
export async function cancelOverdue() {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: overdue } = await supabase
    .from("bookings")
    .select(
      `id, reference, riders, departure_id, seats_counted, total_amount, paid_amount, currency,
       tour:tours(title)`,
    )
    .lt("balance_due_on", today)
    .in("status", ["pending", "confirmed"]);

  if (!overdue?.length) return 0;

  let closed = 0;

  for (const booking of overdue) {
    if (booking.paid_amount >= booking.total_amount) continue;

    const { error } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        cancel_reason: "Balance not paid by the deadline.",
      })
      .eq("id", booking.id)
      .in("status", ["pending", "confirmed"]);

    if (error) continue;

    // The places go back on sale, which is the point of the deadline.
    if (booking.seats_counted) {
      const { data: departure } = await supabase
        .from("departures")
        .select("seats_taken")
        .eq("id", booking.departure_id)
        .maybeSingle();

      if (departure) {
        await supabase
          .from("departures")
          .update({ seats_taken: Math.max(0, departure.seats_taken - booking.riders) })
          .eq("id", booking.departure_id);
      }

      await supabase.from("bookings").update({ seats_counted: false }).eq("id", booking.id);
    }

    closed += 1;

    const { data: lead } = await supabase
      .from("booking_travellers")
      .select("email, full_name")
      .eq("booking_id", booking.id)
      .eq("is_lead", true)
      .maybeSingle();

    const tour = booking.tour as unknown as { title: string } | null;

    if (lead?.email) {
      await sendMail({
        to: lead.email,
        subject: `Your booking ${booking.reference} has been cancelled`,
        text: [
          `Hello ${lead.full_name?.split(" ")[0] ?? "there"},`,
          "",
          `The balance on ${tour?.title ?? "your expedition"} (${booking.reference}) was not settled by the deadline, which is 14 days before departure, so the booking has been cancelled and the place has gone back on sale.`,
          "",
          "As set out in the terms you accepted when booking, money already paid is not refundable.",
          "",
          "If you believe this is a mistake, reply to this email today and we will look at it.",
          "",
          siteName,
        ].join("\n"),
      });
    }
  }

  return closed;
}
