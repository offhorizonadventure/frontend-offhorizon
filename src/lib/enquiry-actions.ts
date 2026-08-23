"use server";

import {
  insertCustomEnquiry,
  insertQuickEnquiry,
  type CustomEnquiryInput,
  type QuickEnquiryInput,
  type SubmitResult,
} from "./enquiries";
import { withinLimit } from "./rate-limit";

/** The two public forms, submitted on the server. */
const TOO_MANY = "That is a lot of enquiries at once. Give it a few minutes and try again.";

export async function sendQuickEnquiry(input: QuickEnquiryInput): Promise<SubmitResult> {
  if (!(await withinLimit("quick-enquiry", 5))) return { ok: false, error: TOO_MANY };

  return insertQuickEnquiry(input);
}

export async function sendCustomEnquiry(input: CustomEnquiryInput): Promise<SubmitResult> {
  if (!(await withinLimit("custom-enquiry", 5))) return { ok: false, error: TOO_MANY };

  return insertCustomEnquiry(input);
}
