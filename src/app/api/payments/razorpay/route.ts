import { after, NextResponse } from "next/server";

import { settlePayment } from "@/lib/booking/settle";
import { webhookSignatureValid } from "@/lib/booking/razorpay";

/**
 * The only thing that turns a payment into money in the database.
 *
 * The browser reporting success proves nothing: anyone can call back with a
 * made-up order id. Razorpay signs this body with a secret only the two of us
 * know, so the signature is checked over the raw text before anything is read
 * out of it.
 *
 * Razorpay retries on any non-2xx, so the handler is idempotent: settling the
 * same payment twice changes nothing.
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!webhookSignatureValid(body, signature)) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: Record<string, unknown> } };
  };

  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const entity = event.payload?.payment?.entity;
  if (!entity || typeof entity.id !== "string") {
    // Nothing to do with a payment, but it was signed, so it is not an error.
    return NextResponse.json({ ok: true });
  }

  // Answer the provider straight away and settle after: a slow database write
  // must not turn into a retry storm.
  after(async () => {
    await settlePayment({
      paymentId: entity.id as string,
      orderId: typeof entity.order_id === "string" ? entity.order_id : null,
      event: event.event ?? "",
      raw: entity,
    });
  });

  return NextResponse.json({ ok: true });
}
