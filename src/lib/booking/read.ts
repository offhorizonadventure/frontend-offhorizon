import "server-only";

import { createClient, getUser } from "@/lib/supabase/server";

export type BookingRow = {
  id: string;
  reference: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  plan: "full" | "deposit";
  riders: number;
  pillions: number;
  currency: string;
  total_amount: number;
  deposit_amount: number;
  paid_amount: number;
  balance_due_on: string;
  created_at: string;
  own_vehicle: boolean;
  tour: { slug: string; title: string; hero_path: string | null; google_form_url: string | null };
  departure: {
    start_date: string;
    end_date: string;
    kind: string;
    bike_name: string | null;
  } | null;
};

export type TravellerRow = {
  id: string;
  role: "rider" | "pillion";
  position: number;
  user_id: string | null;
  is_lead: boolean;
  full_name: string | null;
  email: string | null;
  invite_token: string | null;
  joined_at: string | null;
  form_submitted: boolean;
};

export type PaymentRow = {
  id: string;
  kind: string;
  status: string;
  amount: number;
  currency: string;
  paid_at: string | null;
  created_at: string;
};

const BOOKING_COLUMNS = `
  id, reference, status, plan, riders, pillions, currency, total_amount,
  deposit_amount, paid_amount, balance_due_on, created_at, own_vehicle,
  tour:tours(slug, title, hero_path, google_form_url),
  departure:departures(start_date, end_date, kind, bike_name)
`;

export const isOverdue = (
  booking: Pick<BookingRow, "balance_due_on" | "total_amount" | "paid_amount" | "status">,
) =>
  booking.status !== "completed" &&
  booking.status !== "cancelled" &&
  booking.paid_amount < booking.total_amount &&
  booking.balance_due_on < new Date().toISOString().slice(0, 10);

export const outstanding = (booking: Pick<BookingRow, "total_amount" | "paid_amount">) =>
  Math.max(0, Math.round((booking.total_amount - booking.paid_amount) * 100) / 100);

export async function listMyBookings(): Promise<BookingRow[]> {
  const user = await getUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(BOOKING_COLUMNS)
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as BookingRow[];
}

export async function getMyBooking(reference: string) {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select(BOOKING_COLUMNS)
    .eq("reference", reference)
    .maybeSingle();

  if (!booking) return null;

  const row = booking as unknown as BookingRow;

  const [{ data: travellers }, { data: payments }] = await Promise.all([
    supabase
      .from("booking_travellers")
      .select(
        "id, role, position, user_id, is_lead, full_name, email, invite_token, joined_at, form_submitted",
      )
      .eq("booking_id", row.id)
      .order("role")
      .order("position"),
    supabase
      .from("payments")
      .select("id, kind, status, amount, currency, paid_at, created_at")
      .eq("booking_id", row.id)
      .eq("status", "paid")
      .order("created_at", { ascending: false }),
  ]);

  const mine = (travellers ?? []).find((entry) => entry.user_id === user.id) ?? null;
  const isLead = Boolean(mine?.is_lead);

  const visible = (travellers ?? []).map((entry) => ({
    ...entry,
    invite_token: isLead ? entry.invite_token : null,
  }));

  return {
    booking: row,
    travellers: visible as TravellerRow[],
    payments: (payments ?? []) as PaymentRow[],
    mine: mine as TravellerRow | null,
    isLead,
    formUrl: row.status === "completed" ? row.tour.google_form_url : null,
    overdue: isOverdue(row),
  };
}

export type PaymentHistoryRow = PaymentRow & {
  method: string | null;
  providerPaymentId: string | null;
  booking: { reference: string; tour: { title: string } };
};

export async function listMyPayments(): Promise<PaymentHistoryRow[]> {
  const user = await getUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select(
      "id, kind, status, amount, currency, paid_at, created_at, provider_payment_id, method:raw->>method, booking:bookings(reference, tour:tours(title))",
    )
    .in("status", ["paid", "refunded", "created"])
    .order("paid_at", { ascending: false, nullsFirst: false });

  return (data ?? []).map((row) => ({
    ...(row as unknown as PaymentRow),
    method: (row.method as string | null) ?? null,
    providerPaymentId: (row.provider_payment_id as string | null) ?? null,
    booking: row.booking as unknown as PaymentHistoryRow["booking"],
  }));
}

export async function getMyPayment(id: string): Promise<PaymentHistoryRow | null> {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();

  const { data } = await supabase
    .from("payments")
    .select(
      "id, kind, status, amount, currency, paid_at, created_at, provider_payment_id, method:raw->>method, booking:bookings(reference, tour:tours(title))",
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;

  return {
    ...(data as unknown as PaymentRow),
    method: (data.method as string | null) ?? null,
    providerPaymentId: (data.provider_payment_id as string | null) ?? null,
    booking: data.booking as unknown as PaymentHistoryRow["booking"],
  };
}
