import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import { fromMinorUnits } from "./currency";
import { sendPaymentEmail } from "./notify";
import { fetchPayment } from "./razorpay";

/** The amount is read back from the provider, not believed from the webhook body. */
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

  // The trigger has settled the booking by now, so the figures in the email are
  // the ones the account page will show.
  if (matches) await sendPaymentEmail(row.id);
}
