import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import { fromMinorUnits } from "./currency";
import { fetchPayment } from "./razorpay";

/**
 * Writes what the provider says about a payment onto our row.
 *
 * The amount is read back from Razorpay rather than taken from the webhook
 * body, and it has to match the row we opened: a payment for less than the
 * order asked for does not confirm a booking. Everything downstream, the paid
 * total, the status and the seat count, follows from a database trigger.
 */
export async function settlePayment(input: {
  paymentId: string;
  orderId: string | null;
  event: string;
  raw: Record<string, unknown>;
}) {
  const supabase = createAdminClient();

  const provider = await fetchPayment(input.paymentId).catch(() => null);
  if (!provider) return;

  const orderId = provider.order_id ?? input.orderId;
  if (!orderId) return;

  const { data: row } = await supabase
    .from("payments")
    .select("id, status, amount, currency")
    .eq("provider_order_id", orderId)
    .maybeSingle();

  if (!row) return;

  // Already settled: a retried webhook must not write again.
  if (row.status === "paid" || row.status === "refunded") return;

  const captured = provider.status === "captured";
  const paid = fromMinorUnits(provider.amount);
  const matches = captured && paid >= Number(row.amount) && provider.currency === row.currency;

  await supabase
    .from("payments")
    .update({
      status: matches ? "paid" : captured ? "created" : "failed",
      provider_payment_id: provider.id,
      paid_at: matches ? new Date().toISOString() : null,
      failure_reason: matches
        ? null
        : captured
          ? `Paid ${paid} ${provider.currency} against ${row.amount} ${row.currency}.`
          : (provider.error_description ?? `Payment ${provider.status}.`),
      raw: input.raw,
    })
    .eq("id", row.id)
    .neq("status", "paid");
}
