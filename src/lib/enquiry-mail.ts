import "server-only";

import { getTranslations } from "next-intl/server";

import { contact } from "@/config/contact";
import { locales, type Locale } from "@/i18n/config";
import { renderEmail } from "@/lib/email-layout";
import type { CustomEnquiryInput, QuickEnquiryInput } from "@/lib/enquiries";
import { sendMail } from "@/lib/mail";
import { siteUrl } from "@/lib/seo";

/** Where the office reads its post. */
const inbox = () => process.env.ENQUIRY_INBOX?.trim() || contact.email;

const asLocale = (value: string): Locale =>
  (locales as readonly string[]).includes(value) ? (value as Locale) : "en";

type Send = () => Promise<unknown>;

/**
 * The acknowledgement, in the language they were reading the site in.
 *
 * The wording is resolved now, while the request that asked for it is still
 * open. Only the sending is left for afterwards.
 */
async function thankThem(input: {
  locale: string;
  email: string;
  name: string;
  custom: boolean;
  destination?: string | null;
}): Promise<Send> {
  const locale = asLocale(input.locale);
  const t = await getTranslations({ locale, namespace: "enquiryMail" });

  const first = input.name.trim().split(/\s+/)[0] || t("friend");
  const calendar = `${siteUrl}/${locale}/calendar`;

  const lines = [
    t("greeting", { name: first }),
    t("received"),
    input.custom
      ? t("customNext", { destination: input.destination?.trim() || t("yourRoute") })
      : t("quickNext"),
    t("reply"),
    t("meanwhile", { link: calendar }),
  ];

  const { html, text } = renderEmail({
    preheader: t("received"),
    heading: t("subject"),
    paragraphs: lines,
  });

  return () => sendMail({ to: input.email, subject: t("subject"), text, html });
}

/** The office letter, with enough in it to act on without opening the panel. */
function tellTheOffice(input: {
  heading: string;
  email: string;
  facts: [string, string][];
  message: string | null | undefined;
}): Send {
  const facts = input.facts.filter(([, value]) => value);

  const { html, text } = renderEmail({
    preheader: `${input.facts.find(([label]) => label === "Email")?.[1] ?? ""} wrote in.`,
    heading: input.heading,
    facts,
    quote: input.message,
    note: `Reply to this email and it goes straight to ${input.email}.`,
  });

  // So the office can simply hit reply.
  return () => sendMail({ to: inbox(), subject: input.heading, text, html, replyTo: input.email });
}

/**
 * Both letters that follow an enquiry, built but not yet sent.
 *
 * Sending is left to the caller to do after the page has been answered. The
 * enquiry is already written down by then, and a mail server having a bad
 * morning must never tell somebody their message was lost when it was not.
 */
export type Letters = { send: () => Promise<void> };

const both = (customer: Send, office: Send): Letters => ({
  send: async () => {
    await Promise.allSettled([customer(), office()]);
  },
});

export async function prepareQuickEnquiryMail(input: QuickEnquiryInput): Promise<Letters> {
  const customer = await thankThem({
    locale: input.locale,
    email: input.email,
    name: input.fullName,
    custom: false,
  });

  const office = tellTheOffice({
    heading: `New enquiry from ${input.fullName}`,
    email: input.email,
    facts: [
      ["Name", input.fullName],
      ["Email", input.email],
      ["Phone", input.phone ?? ""],
      ["Came from", input.source],
      ["Language", input.locale.toUpperCase()],
    ],
    message: input.message,
  });

  return both(customer, office);
}

export async function prepareCustomEnquiryMail(input: CustomEnquiryInput): Promise<Letters> {
  const name = [input.firstName, input.lastName].filter(Boolean).join(" ");

  const party =
    input.partyModel === "motorcycle"
      ? `${input.riders} rider${input.riders === 1 ? "" : "s"}${
          input.pillions ? `, ${input.pillions} pillion${input.pillions === 1 ? "" : "s"}` : ""
        }`
      : `${input.people} ${input.people === 1 ? "person" : "people"}, ${
          input.vehicleChoice === "own" ? "their own vehicle" : "one of ours"
        }`;

  const customer = await thankThem({
    locale: input.locale,
    email: input.email,
    name,
    custom: true,
    destination: input.destination,
  });

  const office = tellTheOffice({
    heading: `New custom expedition enquiry from ${name}`,
    email: input.email,
    facts: [
      ["Name", name],
      ["Email", input.email],
      ["Phone", input.phone ?? ""],
      ["Destination", input.destination ?? ""],
      ["Dates", [input.startDate, input.endDate].filter(Boolean).join(" to ")],
      ["Party", party],
      ["Travelling with", input.travellingWith ?? ""],
      [
        "Budget",
        input.budgetAmount
          ? `${input.budgetCurrency ?? ""} ${input.budgetAmount.toLocaleString("en-US")}`.trim()
          : "",
      ],
      ["Language", input.locale.toUpperCase()],
    ],
    message: input.message,
  });

  return both(customer, office);
}
