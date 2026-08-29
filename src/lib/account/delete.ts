"use server";

import "server-only";

import { revalidatePath } from "next/cache";

import { withinLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient, getUser } from "@/lib/supabase/server";

export type DeleteState = { ok: boolean; message: string | null };

export async function deleteMyAccount(
  _previous: DeleteState,
  formData: FormData,
): Promise<DeleteState> {
  const user = await getUser();
  if (!user) return { ok: false, message: "Sign in first." };

  if (
    String(formData.get("confirm") ?? "")
      .trim()
      .toUpperCase() !== "DELETE"
  ) {
    return { ok: false, message: "Type DELETE to confirm." };
  }

  if (!(await withinLimit("delete-account", 3, 60))) {
    return { ok: false, message: "Too many attempts. Try again in an hour." };
  }

  const admin = createAdminClient();
  const email = user.email ?? null;

  const { data: seats } = await admin
    .from("booking_travellers")
    .select("id, booking_id")
    .eq("user_id", user.id);

  const { data: led } = await admin
    .from("bookings")
    .select("id, paid_amount")
    .eq("lead_user_id", user.id);

  const hasRecords = Boolean(led?.length) || Boolean(seats?.length);

  if (email) {
    await admin.from("quick_enquiries").delete().eq("email", email);
    await admin.from("custom_enquiries").delete().eq("email", email);
  }

  if (seats?.length) {
    await admin
      .from("booking_travellers")
      .update({
        full_name: "Deleted account",
        email: null,
        phone: null,
        invited_email: null,
        user_id: null,
      })
      .eq("user_id", user.id);
  }

  await admin.from("profiles").delete().eq("id", user.id);

  if (!hasRecords) {
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error)
      return { ok: false, message: "The account could not be removed. Please write to us." };
  } else {
    const tombstone = `deleted-${user.id}@deleted.invalid`;

    const { error } = await admin.auth.admin.updateUserById(user.id, {
      email: tombstone,
      phone: undefined,
      user_metadata: {},
      app_metadata: {},
      ban_duration: "876000h",
    });

    if (error)
      return { ok: false, message: "The account could not be closed. Please write to us." };

    for (const booking of led ?? []) {
      await admin.from("booking_events").insert({
        booking_id: booking.id,
        actor_id: null,
        actor_email: null,
        kind: "note",
        message: "The rider deleted their account. Personal details removed from this booking.",
      });
    }
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");

  return {
    ok: true,
    message: hasRecords
      ? "Your account is closed and your details are gone. The paid bookings stay as financial records with nothing on them that identifies you."
      : "Your account and everything on it has been deleted.",
  };
}
