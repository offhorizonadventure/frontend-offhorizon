import "server-only";

import { createClient, getUser } from "@/lib/supabase/server";

/** A booking as the account pages show it. */
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
  /** Null when the row is not readable, which the pages allow for. */
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

/** Past the deadline with money still owed. */
export const isOverdue = (
  booking: Pick<BookingRow, "balance_due_on" | "total_amount" | "paid_amount" | "status">,
) =>
  booking.status !== "completed" &&
  booking.status !== "cancelled" &&
  booking.paid_amount < booking.total_amount &&
  booking.balance_due_on < new Date().toISOString().slice(0, 10);

/** What is left to pay, never below zero. */
export const outstanding = (booking: Pick<BookingRow, "total_amount" | "paid_amount">) =>
  Math.max(0, Math.round((booking.total_amount - booking.paid_amount) * 100) / 100);

/** Every booking the signed in rider is on, whether they paid for it or were invited onto it. */
export async function listMyBookings(): Promise<BookingRow[]> {
  const user = await getUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(BOOKING_COLUMNS)
    .neq("status", "pending")
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as BookingRow[];
}

/** One booking, with everyone on it and every payment against it. */
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

  // Only the lead hands out places, so only the lead is given the tokens. Row
  // level security scopes these to the booking, but every rider on it was
  // getting every unclaimed token in the page payload, which is one rider
  // quietly filling their friends into somebody else's group.
  const visible = (travellers ?? []).map((entry) => ({
    ...entry,
    invite_token: isLead ? entry.invite_token : null,
  }));

  return {
    booking: row,
    travellers: visible as TravellerRow[],
    payments: (payments ?? []) as PaymentRow[],
    /** The signed in rider's own row, which is the one they can write to. */
    mine: mine as TravellerRow | null,
    isLead,
    /** The documents form opens only when the expedition is paid for. */
    formUrl: row.status === "completed" ? row.tour.google_form_url : null,
    overdue: isOverdue(row),
  };
}

export type PaymentHistoryRow = PaymentRow & {
  method: string | null;
  booking: { reference: string; tour: { title: string } };
};

/** Every payment this rider has made, newest first. */
export async function listMyPayments(): Promise<PaymentHistoryRow[]> {
  const user = await getUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select(
      "id, kind, status, amount, currency, paid_at, created_at, raw, booking:bookings(reference, tour:tours(title))",
    )
    .in("status", ["paid", "refunded"])
    .order("paid_at", { ascending: false, nullsFirst: false });

  return (data ?? []).map((row) => {
    const raw = row.raw as { method?: string } | null;

    return {
      ...(row as unknown as PaymentRow),
      method: raw?.method ?? null,
      booking: row.booking as unknown as PaymentHistoryRow["booking"],
    };
  });
}
