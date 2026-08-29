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

export async function acceptInvite(token: string) {
  const user = await getUser();
  if (!user) return { ok: false as const, error: "Sign in to join the group." };

  const admin = createAdminClient();

  const { data: seat } = await admin
    .from("booking_travellers")
    .select("id, booking_id, user_id, booking:bookings(reference, status, departure_id)")
    .eq("invite_token", token)
    .maybeSingle();

  if (!seat) return { ok: false as const, error: "That invitation is not valid." };
  if (seat.user_id) return { ok: false as const, error: "That place has already been claimed." };

  const booking = seat.booking as unknown as {
    reference: string;
    status: string;
    departure_id: string;
  };
  if (booking.status === "cancelled") {
    return { ok: false as const, error: "That booking was cancelled." };
  }

  const { data: held } = await admin
    .from("booking_travellers")
    .select("id, booking:bookings!inner(reference, departure_id, status)")
    .eq("user_id", user.id)
    .eq("booking.departure_id", booking.departure_id)
    .neq("booking.status", "cancelled")
    .limit(1);

  if (held?.length) {
    const mine = held[0].booking as unknown as { reference: string };

    return mine.reference === booking.reference
      ? { ok: true as const, reference: booking.reference }
      : {
          ok: false as const,
          error: `You already have a place on this departure, under ${mine.reference}.`,
        };
  }

  const named =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null;

  const { error } = await admin
    .from("booking_travellers")
    .update({
      user_id: user.id,
      email: user.email ?? null,
      full_name: named,
      joined_at: new Date().toISOString(),
      invite_token: null,
    })
    .eq("id", seat.id)
    .is("user_id", null);

  if (error) return { ok: false as const, error: "That place could not be claimed." };

  revalidatePath("/account/bookings", "layout");
  return { ok: true as const, reference: booking.reference };
}

export async function setTravellerName(travellerId: string, name: string) {
  const user = await getUser();
  if (!user) return { ok: false as const, error: "Sign in first." };

  if (!(await withinLimit("name-traveller", 30))) {
    return { ok: false as const, error: "Too many changes. Give it a few minutes." };
  }

  const clean = name.trim().slice(0, 120);

  const admin = createAdminClient();

  const { data: seat } = await admin
    .from("booking_travellers")
    .select("id, user_id, booking:bookings(reference, lead_user_id)")
    .eq("id", travellerId)
    .maybeSingle();

  if (!seat) return { ok: false as const, error: "That place is not on this booking." };

  const booking = seat.booking as unknown as { reference: string; lead_user_id: string };
  if (booking.lead_user_id !== user.id) {
    return { ok: false as const, error: "Only the rider who booked can change this." };
  }

  if (seat.user_id) {
    return { ok: false as const, error: "That rider has joined and manages their own name." };
  }

  const { error } = await admin
    .from("booking_travellers")
    .update({ full_name: clean || null })
    .eq("id", travellerId)
    .is("user_id", null);

  if (error) return { ok: false as const, error: "That could not be saved." };

  revalidatePath("/account/bookings", "layout");
  return { ok: true as const, name: clean };
}
