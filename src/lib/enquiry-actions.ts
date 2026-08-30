"use server";

import { after } from "next/server";

import {
  insertCustomEnquiry,
  insertQuickEnquiry,
  type CustomEnquiryInput,
  type QuickEnquiryInput,
  type SubmitResult,
} from "./enquiries";
import { prepareCustomEnquiryMail, prepareQuickEnquiryMail } from "./enquiry-mail";
import { withinLimit } from "./rate-limit";

const TOO_MANY = "That is a lot of enquiries at once. Give it a few minutes and try again.";

export async function sendQuickEnquiry(input: QuickEnquiryInput): Promise<SubmitResult> {
  if (!(await withinLimit("quick-enquiry", 5))) return { ok: false, error: TOO_MANY };

  const saved = await insertQuickEnquiry(input);
  if (!saved.ok) return saved;

  // Written now, while the request that knows the language is still open.
  // Posted after the page has been answered, so a slow mail server does not
  // keep somebody waiting on a form that has already worked.
  const letters = await prepareQuickEnquiryMail(input);
  after(() => letters.send());

  return saved;
}

export async function sendCustomEnquiry(input: CustomEnquiryInput): Promise<SubmitResult> {
  if (!(await withinLimit("custom-enquiry", 5))) return { ok: false, error: TOO_MANY };

  const saved = await insertCustomEnquiry(input);
  if (!saved.ok) return saved;

  const letters = await prepareCustomEnquiryMail(input);
  after(() => letters.send());

  return saved;
}
