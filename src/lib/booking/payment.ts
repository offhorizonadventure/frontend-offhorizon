import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import { toMinorUnits } from "./currency";
import { createOrder } from "./razorpay";

export type PaymentFailure = { ok: false; error: string };

export type PaymentStarted = {
  ok: true;
  bookingId: string;
  reference: string;
  paymentId: string;
  orderId: string;
  amountMinor: number;
  currency: string;
};

/**
 * Opens a payment against a booking that already exists.
 *
 * Shared by the deposit, the full amount and every instalment, so an order is
 * created in one place and recorded in one row shape.
 */
export async function startPayment(input: {
  bookingId: string;
  reference: string;
  amount: number;
  currency: string;
  kind: "deposit" | "full" | "instalment";
}): Promise<PaymentStarted | PaymentFailure> {
  const supabase = createAdminClient();
  const amountMinor = toMinorUnits(input.amount);

  if (amountMinor <= 0) return { ok: false, error: "That is not an amount we can charge." };

  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      booking_id: input.bookingId,
      kind: input.kind,
      status: "created",
      amount: input.amount,
      currency: input.currency,
    })
    .select("id")
    .single();

  if (error || !payment) return { ok: false, error: "The payment could not be opened." };

  try {
    const order = await createOrder({
      amountMinor,
      currency: input.currency,
      receipt: payment.id,
      notes: { booking: input.reference, payment: payment.id },
    });

    await supabase.from("payments").update({ provider_order_id: order.id }).eq("id", payment.id);

    return {
      ok: true,
      bookingId: input.bookingId,
      reference: input.reference,
      paymentId: payment.id,
      orderId: order.id,
      amountMinor,
      currency: input.currency,
    };
  } catch {
    await supabase
      .from("payments")
      .update({ status: "failed", failure_reason: "The provider did not open an order." })
      .eq("id", payment.id);

    return { ok: false, error: "The payment provider is not answering. Nothing has been charged." };
  }
}
