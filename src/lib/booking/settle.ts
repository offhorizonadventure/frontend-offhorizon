import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import { fromMinorUnits } from "./currency";
import { sendPaymentEmail } from "./notify";
import { fetchOrderPayments, fetchPayment } from "./razorpay";

export async function settlePayment(input: {
  paymentId: string;
  orderId: string | null;
  linkId: string | null;
  event: string;
  raw: Record<string, unknown>;
}) {
  const supabase = createAdminClient();

  const provider = await fetchPayment(input.paymentId).catch(() => null);
  if (!provider) return;

  const orderId = provider.order_id ?? input.orderId;

  const { data: row } = orderId
    ? await supabase
        .from("payments")
        .select("id, status, amount, currency")
        .eq("provider_order_id", orderId)
        .maybeSingle()
    : { data: null };

  const { data: byLink } =
    !row && input.linkId
      ? await supabase
          .from("payments")
          .select("id, status, amount, currency")
          .eq("provider_link_id", input.linkId)
          .maybeSingle()
      : { data: null };

  const found = row ?? byLink;
  if (!found) return;

  if (found.status === "paid" || found.status === "refunded") return;

  const captured = provider.status === "captured";
  const paid = fromMinorUnits(provider.amount);
  const matches = captured && paid >= Number(found.amount) && provider.currency === found.currency;

  // Still moving. Neither paid nor failed, so it is left alone and picked up
  // when the provider says what happened.
  const settling = provider.status === "authorized" || provider.status === "created";
  if (settling && !captured) return;

  await supabase
    .from("payments")
    .update({
      status: matches ? "paid" : captured ? "created" : "failed",
      provider_payment_id: provider.id,
      provider_order_id: orderId ?? null,
      paid_at: matches ? new Date().toISOString() : null,
      failure_reason: matches
        ? null
        : captured
          ? `Paid ${paid} ${provider.currency} against ${found.amount} ${found.currency}.`
          : (provider.error_description ?? `Payment ${provider.status}.`),
      raw: Object.keys(input.raw ?? {}).length
        ? input.raw
        : (provider as unknown as Record<string, unknown>),
    })
    .eq("id", found.id)
    .neq("status", "paid");

  // The payment is recorded either way. A mail server having a bad morning is
  // not a reason to tell the provider the payment failed to settle.
  if (matches) await sendPaymentEmail(found.id).catch(() => {});
}

// A payment can be taken and still never settle: the webhook can be slow, it can
// be pointed at the wrong place, or it can fail while the customer is already
// looking at the page. Rather than leave them staring at "processing", the truth
// is fetched from the provider whenever a payment is sitting unfinished.
//
// Only rows that are actually stuck are looked up, so the usual page view costs
// one indexed query that returns nothing. Attempts older than a week are left
// alone: by then the webhook has retried for days and nobody is waiting.
const STUCK_COLUMNS = "id, provider_order_id";
const STUCK_DAYS = 7;

async function settleStuck(
  rows: { id: string; provider_order_id: string | null }[],
): Promise<boolean> {
  let changed = false;

  for (const row of rows) {
    if (!row.provider_order_id) continue;

    const payments = await fetchOrderPayments(row.provider_order_id).catch(() => []);
    const captured = payments.find((entry) => entry.status === "captured");
    if (!captured) continue;

    await settlePayment({
      paymentId: captured.id,
      orderId: row.provider_order_id,
      linkId: null,
      event: "reconcile",
      raw: {},
    });

    changed = true;
  }

  return changed;
}

const since = () => new Date(Date.now() - STUCK_DAYS * 86_400_000).toISOString();

export async function reconcileBooking(bookingId: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("payments")
    .select(STUCK_COLUMNS)
    .eq("booking_id", bookingId)
    .eq("status", "created")
    .gte("created_at", since());

  return data?.length ? settleStuck(data) : false;
}

export async function reconcileForUser(userId: string): Promise<boolean> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("payments")
    .select(`${STUCK_COLUMNS}, booking:bookings!inner(lead_user_id)`)
    .eq("status", "created")
    .eq("booking.lead_user_id", userId)
    .gte("created_at", since());

  return data?.length ? settleStuck(data) : false;
}
