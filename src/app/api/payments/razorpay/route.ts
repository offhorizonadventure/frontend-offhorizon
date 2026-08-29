import { after, NextResponse } from "next/server";

import { settlePayment } from "@/lib/booking/settle";
import { webhookSignatureValid } from "@/lib/booking/razorpay";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!webhookSignatureValid(body, signature)) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }

  let event: {
    event?: string;
    payload?: {
      payment?: { entity?: Record<string, unknown> };
      payment_link?: { entity?: { id?: string } };
    };
  };

  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "bad body" }, { status: 400 });
  }

  const entity = event.payload?.payment?.entity;
  if (!entity || typeof entity.id !== "string") {
    return NextResponse.json({ ok: true });
  }

  after(async () => {
    await settlePayment({
      paymentId: entity.id as string,
      orderId: typeof entity.order_id === "string" ? entity.order_id : null,
      linkId: event.payload?.payment_link?.entity?.id ?? null,
      event: event.event ?? "",
      raw: entity,
    });
  });

  return NextResponse.json({ ok: true });
}
