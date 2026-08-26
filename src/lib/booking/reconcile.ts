import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import { fetchOrderPayments } from "./razorpay";
import { settlePayment } from "./settle";

/**
 * Catches the payments a webhook never told us about.
 *
 * The signed webhook is the normal path and stays the only thing that can mark
 * a payment paid. But a webhook can simply not arrive: registered in the wrong
 * mode, pointed at the wrong URL, or dropped while the site was restarting. If
 * that happens there is nothing in the system that ever notices. The money is
 * taken, the booking sits at pending, the seat is never counted, and the rider
 * is told nothing.
 *
 * So this asks the question the other way round. For every payment we opened
 * and never saw settle, it asks the provider what happened on that order, and
 * hands anything captured to the same settle path the webhook uses. That path
 * re-reads the amount from the provider and compares the currency, so nothing
 * here is trusted that would not have been trusted before.
 *
 * Safe to run as often as you like: settling is idempotent, and a payment
 * already paid is skipped before any write.
 */

/** Long enough that a webhook in flight is not raced, short enough to matter. */
const SETTLE_GRACE_MS = 2 * 60 * 1000;

/** Nothing older than this is worth chasing; the checkout was abandoned. */
const GIVE_UP_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

export type Reconciled = { checked: number; settled: number };

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

  if (!pending?.length) return { checked: 0, settled: 0 };

  let settled = 0;

  for (const payment of pending) {
    const orderId = payment.provider_order_id as string;
    const attempts = await fetchOrderPayments(orderId).catch(() => []);
    const captured = attempts.find((attempt) => attempt.status === "captured");

    if (!captured) continue;

    // The same path the webhook takes, including reading the amount back.
    await settlePayment({
      paymentId: captured.id,
      orderId,
      linkId: null,
      event: "reconciled",
      raw: { ...captured, reconciled: true },
    });

    settled += 1;
  }

  return { checked: pending.length, settled };
}
