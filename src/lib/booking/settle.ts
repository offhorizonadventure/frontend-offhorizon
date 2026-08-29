import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import { fromMinorUnits } from "./currency";
import { sendPaymentEmail } from "./notify";
import { fetchPayment } from "./razorpay";

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
      raw: input.raw,
    })
    .eq("id", found.id)
    .neq("status", "paid");

  if (matches) await sendPaymentEmail(found.id);
}
