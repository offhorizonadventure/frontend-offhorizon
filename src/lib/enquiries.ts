import { createClient } from "./supabase";

export const SEATS_PER_VEHICLE = 4;

export const vehiclesFor = (people: number) => Math.max(1, Math.ceil(people / SEATS_PER_VEHICLE));

export type QuickEnquiryInput = {
  source: string;
  locale: string;
  fullName: string;
  email: string;
  phone?: string | null;
  message?: string | null;
};

export type CustomEnquiryInput = {
  source: string;
  locale: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  message?: string | null;
  destination?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  travellingWith?: string | null;
  budgetAmount?: number | null;
  budgetCurrency?: string | null;
} & (
  | { partyModel: "motorcycle"; riders: number; pillions: number }
  | { partyModel: "vehicle"; vehicleChoice: "own" | "ours"; people: number }
);

export type SubmitResult = { ok: true } | { ok: false; error: string };

const FAILED = "We could not send that. Please try again, or email us directly.";

const asSource = (value: string) => value.trim().slice(0, 120) || "Quick enquiry";

async function insertQuickEnquiry(input: QuickEnquiryInput): Promise<SubmitResult> {
  try {
    const { error } = await createClient()
      .from("quick_enquiries")
      .insert({
        source: asSource(input.source),
        locale: input.locale,
        full_name: input.fullName,
        email: input.email,
        phone: input.phone || null,
        message: input.message || null,
      });

    return error ? { ok: false, error: FAILED } : { ok: true };
  } catch {
    return { ok: false, error: FAILED };
  }
}

async function insertCustomEnquiry(input: CustomEnquiryInput): Promise<SubmitResult> {
  const party =
    input.partyModel === "motorcycle"
      ? {
          party_model: "motorcycle" as const,
          riders: input.riders,
          pillions: input.pillions,
        }
      : {
          party_model: "vehicle" as const,
          vehicle_choice: input.vehicleChoice,
          people: input.people,
          vehicles: vehiclesFor(input.people),
        };

  try {
    const { error } = await createClient()
      .from("custom_enquiries")
      .insert({
        source: asSource(input.source),
        locale: input.locale,
        first_name: input.firstName,
        last_name: input.lastName || null,
        email: input.email,
        phone: input.phone || null,
        message: input.message || null,
        destination: input.destination || null,
        start_date: input.startDate || null,
        end_date: input.endDate || null,
        travelling_with: input.travellingWith || null,
        budget_amount: input.budgetAmount ?? null,
        budget_currency: input.budgetCurrency || null,
        ...party,
      });

    return error ? { ok: false, error: FAILED } : { ok: true };
  } catch {
    return { ok: false, error: FAILED };
  }
}

export { insertQuickEnquiry, insertCustomEnquiry };
