import "server-only";
import { renderEmail } from "@/lib/email-layout";

import { sendMail } from "@/lib/mail";

import { createAdminClient } from "@/lib/supabase/admin";

import { cancelsAutomatically } from "./deadline";
import { BALANCE_DUE_DAYS } from "./types";

export async function cancelOverdue() {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: overdue } = await supabase
    .from("bookings")
    .select(
      `id, reference, riders, departure_id, seats_counted, total_amount, paid_amount, currency,
       balance_due_on,
       tour:tours(title),
       departure:departures(start_date)`,
    )
    .lt("balance_due_on", today)
    .in("status", ["pending", "confirmed"]);

  if (!overdue?.length) return 0;

  let closed = 0;

  for (const booking of overdue) {
    if (booking.paid_amount >= booking.total_amount) continue;

    // A balance due on the day the expedition leaves was never a countdown to
    // a cancellation, it was a thing to settle before riding. The earliest this
    // job could act on one is the morning after the trip started, and
    // cancelling a booking for a trip that has run is not a thing to do.
    //
    // Only Indian expeditions, which take a deposit at the last minute, ever
    // get a deadline like that. Every other booking reaches this line exactly
    // as it did before.
    const departure = booking.departure as unknown as { start_date: string } | null;

    if (departure && !cancelsAutomatically(booking.balance_due_on as string, departure.start_date)) {
      continue;
    }

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

    // In the booking's own history, so the office reading it later can see
    // that the reminders went out and this followed, rather than finding a
    // cancellation with nothing in front of it.
    await supabase.from("booking_events").insert({
      booking_id: booking.id,
      actor_id: null,
      actor_email: null,
      kind: "cancelled",
      message: "Cancelled automatically: the balance was not paid by the deadline.",
    });

    const { data: lead } = await supabase
      .from("booking_travellers")
      .select("email, full_name")
      .eq("booking_id", booking.id)
      .eq("is_lead", true)
      .maybeSingle();

    const tour = booking.tour as unknown as { title: string } | null;

    if (lead?.email) {
      const { html, text } = renderEmail({
        preheader: `Booking ${booking.reference} has been cancelled.`,
        heading: "We have cancelled your booking",
        paragraphs: [
          `Hello ${lead.full_name?.trim().split(/\s+/)[0] ?? "there"},`,
          `We did not get the full money for ${tour?.title ?? "your trip"} by the last date, which is ${BALANCE_DUE_DAYS} days before the trip starts. So we have cancelled your booking and given your seat to someone else.`,
          "The money you paid before will not come back to you. This was written in the terms you agreed to when you booked.",
          "We are sorry. If you still want to ride with us, write to us and we will look for another date.",
        ],
        facts: [
          ["Trip", tour?.title ?? ""],
          ["Booking number", booking.reference],
        ],
        note: "Do you think this is a mistake? Reply to this email today and we will check it.",
      });

      await sendMail({
        to: lead.email,
        subject: `Your booking ${booking.reference} has been cancelled`,
        text,
        html,
      });
    }
  }

  return closed;
}
