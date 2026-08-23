"use server";

import { revalidatePath } from "next/cache";

import { currencyForVisitor } from "@/lib/currency";
import { getLocale } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import { withinLimit } from "@/lib/rate-limit";
import { createClient, getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

import { startPayment } from "./payment";
import { startBooking } from "./service";
import type { BookingPlan, Party } from "./types";

export type ActionResult =
  | { ok: false; error: string }
  | { ok: true; orderId: string; amountMinor: number; currency: string; reference: string };

const whole = (value: FormDataEntryValue | null, max: number) => {
  const parsed = Number(String(value ?? "0"));
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > max) return 0;

  return parsed;
};

/** Opens a booking and its first payment. */
export async function createBooking(_: unknown, formData: FormData): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Sign in to book." };

  if (!(await withinLimit("booking", 8))) {
    return { ok: false, error: "Too many attempts. Give it a few minutes and try again." };
  }

  const departureId = String(formData.get("departureId") ?? "");
  if (!departureId) return { ok: false, error: "That departure could not be found." };

  const plan: BookingPlan = formData.get("plan") === "deposit" ? "deposit" : "full";

  const party: Party = {
    riders: Math.max(1, whole(formData.get("riders"), 20)),
    pillions: whole(formData.get("pillions"), 20),
    singleRooms: whole(formData.get("singleRooms"), 40),
    damageProtection: whole(formData.get("damageProtection"), 40),
    vehicleId: String(formData.get("vehicleId") ?? "") || null,
    ownVehicle: formData.get("ownVehicle") === "on",
  };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!fullName || !email) return { ok: false, error: "Your name and email address are needed." };

  const locale = (await getLocale()) as Locale;
  const preferred = await currencyForVisitor(locale);

  const started = await startBooking({
    userId: user.id,
    departureId,
    plan,
    party,
    preferredCurrency: preferred,
    lead: { fullName, email, phone },
  });

  if (!started.ok) return started;

  return {
    ok: true,
    orderId: started.orderId,
    amountMinor: started.amountMinor,
    currency: started.currency,
    reference: started.reference,
  };
}

/** Opens a payment towards the balance. */
export async function payInstalment(_: unknown, formData: FormData): Promise<ActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "Sign in to pay." };

  if (!(await withinLimit("instalment", 8))) {
    return { ok: false, error: "Too many attempts. Give it a few minutes and try again." };
  }

  const reference = String(formData.get("reference") ?? "");
  const amount = Number(String(formData.get("amount") ?? "0"));

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "Enter an amount to pay." };
  }

  const supabase = await createClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, reference, status, currency, total_amount, paid_amount, lead_user_id")
    .eq("reference", reference)
    .maybeSingle();

  if (!booking) return { ok: false, error: "That booking could not be found." };
  if (booking.lead_user_id !== user.id) {
    return { ok: false, error: "Only the rider who made the booking can pay towards it." };
  }
  if (booking.status === "cancelled") return { ok: false, error: "That booking was cancelled." };

  const left = Math.max(0, Math.round((booking.total_amount - booking.paid_amount) * 100) / 100);
  if (left <= 0) return { ok: false, error: "This booking is paid in full." };

  const started = await startPayment({
    bookingId: booking.id,
    reference: booking.reference,
    amount: Math.min(amount, left),
    currency: booking.currency,
    kind: "instalment",
  });

  if (!started.ok) return started;

  return {
    ok: true,
    orderId: started.orderId,
    amountMinor: started.amountMinor,
    currency: started.currency,
    reference: booking.reference,
  };
}

/** The rider says they have sent their documents. Their own row, and only theirs. */
export async function setFormSubmitted(travellerId: string, submitted: boolean) {
  const user = await getUser();
  if (!user) return { ok: false as const, error: "Sign in first." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("booking_travellers")
    .update({
      form_submitted: submitted,
      form_submitted_at: submitted ? new Date().toISOString() : null,
    })
    .eq("id", travellerId)
    .eq("user_id", user.id);

  if (error) return { ok: false as const, error: "That could not be saved." };

  revalidatePath("/account/bookings", "layout");
  return { ok: true as const };
}

/** Joins the signed in rider to the group the invite belongs to. */
export async function acceptInvite(token: string) {
  const user = await getUser();
  if (!user) return { ok: false as const, error: "Sign in to join the group." };

  const admin = createAdminClient();

  const { data: seat } = await admin
    .from("booking_travellers")
    .select("id, booking_id, user_id, booking:bookings(reference, status)")
    .eq("invite_token", token)
    .maybeSingle();

  if (!seat) return { ok: false as const, error: "That invitation is not valid." };
  if (seat.user_id) return { ok: false as const, error: "That place has already been claimed." };

  const booking = seat.booking as unknown as { reference: string; status: string };
  if (booking.status === "cancelled") {
    return { ok: false as const, error: "That booking was cancelled." };
  }

  // Nobody may hold two places on one booking.
  const { data: existing } = await admin
    .from("booking_travellers")
    .select("id")
    .eq("booking_id", seat.booking_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) return { ok: true as const, reference: booking.reference };

  const { error } = await admin
    .from("booking_travellers")
    .update({
      user_id: user.id,
      email: user.email ?? null,
      joined_at: new Date().toISOString(),
      invite_token: null,
    })
    .eq("id", seat.id)
    .is("user_id", null);

  if (error) return { ok: false as const, error: "That place could not be claimed." };

  revalidatePath("/account/bookings", "layout");
  return { ok: true as const, reference: booking.reference };
}
