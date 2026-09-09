import "server-only";

import { renderEmail, type EmailFact } from "@/lib/email-layout";
import { sendMail } from "@/lib/mail";
import { createAdminClient } from "@/lib/supabase/admin";

import { BALANCE_DUE_DAYS } from "./types";

/**
 * Warnings before the balance deadline.
 *
 * A booking whose balance is not settled by `balance_due_on` is cancelled, the
 * places go back on sale and nothing paid is refunded. That is a hard thing to
 * do to somebody who was never told it was coming, and the first letter they
 * used to get was the one saying it already had.
 *
 * Two go out. The first is a week before the deadline and reads as a reminder.
 * The second is two days before and says plainly what happens if nothing
 * arrives. Neither asks for money the office does not already know about: the
 * figures are read off the booking at the moment of sending.
 */
const STAGES = [
  { stage: 2, daysBefore: 2, final: true },
  { stage: 1, daysBefore: 7, final: false },
] as const;

/** The furthest out any reminder goes, which is how wide the query has to look. */
const WINDOW = Math.max(...STAGES.map((entry) => entry.daysBefore));

const day = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(value),
  );

const money = (value: number, currency: string) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 2 }).format(
    value,
  );

const midnight = (value: string) => new Date(`${value}T00:00:00Z`).getTime();

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "https://offhorizon.com").replace(/\/$/, "");

type Row = {
  id: string;
  reference: string;
  status: string;
  currency: string;
  total_amount: number;
  paid_amount: number;
  balance_due_on: string;
  balance_reminder_stage: number;
  tour: { title: string } | null;
  departure: { start_date: string; end_date: string } | null;
};

/**
 * Sends whatever reminder each booking is due and reports how many went.
 *
 * Safe to run twice in a day, or twice in a minute: a booking only moves
 * forward through the stages, so the second run finds nothing left to say.
 */
export async function remindBalances(): Promise<number> {
  const supabase = createAdminClient();

  const today = new Date();
  const from = today.toISOString().slice(0, 10);
  const to = new Date(today.getTime() + WINDOW * 86_400_000).toISOString().slice(0, 10);

  const { data: due } = await supabase
    .from("bookings")
    .select(
      `id, reference, status, currency, total_amount, paid_amount, balance_due_on,
       balance_reminder_stage,
       tour:tours(title),
       departure:departures(start_date, end_date)`,
    )
    // On the deadline itself a reminder is still worth sending; past it, the
    // overdue job has the floor and a reminder would only muddy the account.
    .gte("balance_due_on", from)
    .lte("balance_due_on", to)
    .lt("balance_reminder_stage", 2)
    .in("status", ["pending", "confirmed"]);

  if (!due?.length) return 0;

  let sent = 0;

  for (const row of due as unknown as Row[]) {
    const left = Math.round((row.total_amount - row.paid_amount) * 100) / 100;
    if (left <= 0) continue;

    const daysLeft = Math.ceil((midnight(row.balance_due_on) - Date.now()) / 86_400_000);

    // The nearest stage this booking has reached and has not been told about.
    // Written this way rather than as a schedule of exact days so that a job
    // that did not run for a week still sends the right letter rather than
    // skipping the one whose day it missed.
    const owed = STAGES.find(
      (entry) => daysLeft <= entry.daysBefore && row.balance_reminder_stage < entry.stage,
    );

    if (!owed) continue;

    const { data: lead } = await supabase
      .from("booking_travellers")
      .select("email, full_name")
      .eq("booking_id", row.id)
      .eq("is_lead", true)
      .maybeSingle();

    if (!lead?.email) continue;

    const first = lead.full_name?.trim().split(/\s+/)[0] ?? "there";
    const title = row.tour?.title ?? "your expedition";
    const deadline = day(row.balance_due_on);

    const facts: EmailFact[] = [
      ["Booking reference", row.reference],
      ["Expedition", row.tour?.title ?? ""],
      [
        "Dates",
        row.departure
          ? `${day(row.departure.start_date)} to ${day(row.departure.end_date)}`
          : "",
      ],
      ["Total", money(row.total_amount, row.currency)],
      ["Paid so far", money(row.paid_amount, row.currency)],
      ["Still to pay", money(left, row.currency)],
      ["Due by", deadline],
    ];

    const when =
      daysLeft <= 0
        ? "today"
        : daysLeft === 1
          ? "tomorrow"
          : `in ${daysLeft} days`;

    const { html, text } = renderEmail({
      preheader: owed.final
        ? `The balance on ${row.reference} is due ${when}.`
        : `A reminder about the balance on ${row.reference}.`,
      heading: owed.final ? "Your booking will be cancelled if this is not paid" : "Your balance is due soon",
      figure: { label: "Still to pay", value: money(left, row.currency) },
      paragraphs: owed.final
        ? [
            `Hello ${first},`,
            `The balance on ${title} is due ${when}, on ${deadline}. That deadline is ${BALANCE_DUE_DAYS} days before the expedition leaves.`,
            "If it is not paid by then the booking is cancelled and the places go back on sale. As set out in the terms you accepted when booking, money already paid is not refundable, so it is worth settling this today.",
          ]
        : [
            `Hello ${first},`,
            `This is a reminder that the balance on ${title} is due ${when}, on ${deadline}. That deadline is ${BALANCE_DUE_DAYS} days before the expedition leaves.`,
            "You can pay all of it or part of it, as many times as you like, until it is clear. A booking that still has a balance on the deadline is cancelled and the places go back on sale.",
          ],
      facts,
      cta: { label: "Pay the balance", href: `${siteUrl()}/account/bookings/${row.reference}` },
      note: "If you have already paid this, or anything here looks wrong, reply to this email and we will sort it out.",
    });

    const posted = await sendMail({
      to: lead.email,
      subject: owed.final
        ? `Last chance to pay ${row.reference} · ${title}`
        : `Balance due ${when} for ${row.reference} · ${title}`,
      text,
      html,
    });

    // The stage only moves when the letter actually left. A booking marked as
    // reminded by a send that failed would never be reminded again, and would
    // be cancelled in silence exactly as before.
    if (!posted.ok) continue;

    await supabase
      .from("bookings")
      .update({
        balance_reminder_stage: owed.stage,
        balance_reminded_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    await supabase.from("booking_events").insert({
      booking_id: row.id,
      actor_id: null,
      actor_email: null,
      kind: "reminder",
      message: owed.final
        ? `Final warning sent to ${lead.email}. Balance due ${deadline}.`
        : `Balance reminder sent to ${lead.email}. Due ${deadline}.`,
    });

    sent += 1;
  }

  return sent;
}
