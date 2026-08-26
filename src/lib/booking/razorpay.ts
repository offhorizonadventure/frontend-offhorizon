import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const KEY_ID = process.env.RAZORPAY_KEY_ID ?? "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

const API = "https://api.razorpay.com/v1";

export const razorpayConfigured = () => Boolean(KEY_ID && KEY_SECRET);

/** The publishable half, which the checkout script needs. */
export const razorpayKeyId = () => KEY_ID;

const auth = () => `Basic ${Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64")}`;

export type RazorpayOrder = { id: string; amount: number; currency: string; status: string };

/** Creates the order the checkout opens against. */
export async function createOrder(input: {
  amountMinor: number;
  currency: string;
  receipt: string;
  notes: Record<string, string>;
}): Promise<RazorpayOrder> {
  const response = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: auth() },
    body: JSON.stringify({
      amount: input.amountMinor,
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes,
      payment_capture: 1,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Razorpay order failed: ${response.status} ${body.slice(0, 300)}`);
  }

  return (await response.json()) as RazorpayOrder;
}

/** One payment, read back from the provider rather than believed from the browser. */
export async function fetchPayment(paymentId: string) {
  const response = await fetch(`${API}/payments/${encodeURIComponent(paymentId)}`, {
    headers: { authorization: auth() },
    cache: "no-store",
  });

  if (!response.ok) throw new Error(`Razorpay payment ${paymentId}: ${response.status}`);

  return (await response.json()) as {
    id: string;
    order_id: string;
    status: string;
    amount: number;
    currency: string;
    method?: string;
    error_description?: string;
  };
}

const equal = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && timingSafeEqual(left, right);
};

// There is deliberately no check for the signature the browser hands back
// after checkout. Nothing the browser says confirms a booking; the signed
// webhook is the only authority, and it reads the amount back from Razorpay.

/**
 * Every payment attempted against one order.
 *
 * Used by reconciliation: we know the order we opened, and we ask the provider
 * what happened on it rather than waiting to be told.
 */
export async function fetchOrderPayments(orderId: string) {
  const response = await fetch(`${API}/orders/${encodeURIComponent(orderId)}/payments`, {
    headers: { authorization: auth() },
    cache: "no-store",
  });

  if (!response.ok) return [];

  const body = (await response.json()) as {
    items?: { id: string; status: string; amount: number; currency: string }[];
  };

  return body.items ?? [];
}

/** The signature on a webhook, computed over the raw body. */
export function webhookSignatureValid(body: string, signature: string) {
  if (!WEBHOOK_SECRET) return false;
  const expected = createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex");

  return equal(expected, signature);
}
