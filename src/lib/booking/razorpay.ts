import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const KEY_ID = process.env.RAZORPAY_KEY_ID ?? "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

const API = "https://api.razorpay.com/v1";

export const razorpayConfigured = () => Boolean(KEY_ID && KEY_SECRET);

export const razorpayKeyId = () => KEY_ID;

const auth = () => `Basic ${Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64")}`;

export type RazorpayOrder = { id: string; amount: number; currency: string; status: string };

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

export function checkoutSignatureValid(orderId: string, paymentId: string, signature: string) {
  if (!KEY_SECRET) return false;
  const expected = createHmac("sha256", KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");

  return equal(expected, signature);
}

export function webhookSignatureValid(body: string, signature: string) {
  if (!WEBHOOK_SECRET) return false;
  const expected = createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex");

  return equal(expected, signature);
}
