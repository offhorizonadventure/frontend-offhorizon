import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import { fetchOrderPayments } from "./razorpay";
import { settlePayment } from "./settle";

const SETTLE_GRACE_MS = 2 * 60 * 1000;

const GIVE_UP_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

const ABANDON_AFTER_MS = 30 * 60 * 1000;

export type Reconciled = { checked: number; settled: number; abandoned: number };

export async function reconcilePayments(): Promise<Reconciled> {
  const supabase = createAdminClient();
  const now = Date.now();

  const { data: pending } = await supabase
    .from("payments")
    .select("id, provider_order_id, created_at")
    .eq("status", "created")
    .not("provider_order_id", "is", null)
    .gt("created_at", new Date(now - GIVE_UP_AFTER_MS).toISOString())
    .lt("created_at", new Date(now - SETTLE_GRACE_MS).toISOString())
    .order("created_at", { ascending: false })
    .limit(100);

  if (!pending?.length) return { checked: 0, settled: 0, abandoned: 0 };

  let settled = 0;
  let abandoned = 0;

  for (const payment of pending) {
    const orderId = payment.provider_order_id as string;
    const attempts = await fetchOrderPayments(orderId).catch(() => []);
    const captured = attempts.find((attempt) => attempt.status === "captured");

    if (!captured) {
      if (now - new Date(payment.created_at as string).getTime() > ABANDON_AFTER_MS) {
        await supabase
          .from("payments")
          .update({ status: "failed", failure_reason: "Checkout was not completed." })
          .eq("id", payment.id)
          .eq("status", "created");

        abandoned += 1;
      }

      continue;
    }

    await settlePayment({
      paymentId: captured.id,
      orderId,
      linkId: null,
      event: "reconciled",
      raw: { ...captured, reconciled: true },
    });

    settled += 1;
  }

  return { checked: pending.length, settled, abandoned };
}
