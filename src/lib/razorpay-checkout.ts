type Instance = { open: () => void };
type Checkout = new (options: Record<string, unknown>) => Instance;

declare global {
  interface Window {
    Razorpay?: Checkout;
  }
}

const SRC = "https://checkout.razorpay.com/v1/checkout.js";

let loading: Promise<Checkout | null> | null = null;

export function loadCheckout(): Promise<Checkout | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.Razorpay) return Promise.resolve(window.Razorpay);

  loading ??= new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
    const script = existing ?? document.createElement("script");

    script.addEventListener("load", () => resolve(window.Razorpay ?? null));
    script.addEventListener("error", () => resolve(null));

    if (!existing) {
      script.src = SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return loading;
}

export type CheckoutResult = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type OpenedOrder = {
  orderId: string;
  amountMinor: number;
  currency: string;
  reference: string;
};

export async function openCheckout(options: {
  keyId: string;
  order: OpenedOrder;
  name: string;
  prefill: { name: string; email: string; contact: string };
  onClose: () => void;
  onPaid: (result: CheckoutResult) => void | Promise<void>;
}) {
  const Checkout = await loadCheckout();
  if (!Checkout) return false;

  new Checkout({
    key: options.keyId,
    order_id: options.order.orderId,
    amount: options.order.amountMinor,
    currency: options.order.currency,
    name: options.name,
    description: options.order.reference,
    prefill: options.prefill,
    theme: { color: "#562101" },
    modal: { ondismiss: options.onClose },
    handler: options.onPaid,
  }).open();

  return true;
}
