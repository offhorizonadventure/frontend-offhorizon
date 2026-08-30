import "server-only";

import { getTranslations } from "next-intl/server";

import { contact } from "@/config/contact";
import { locales, type Locale } from "@/i18n/config";
import type { CustomEnquiryInput, QuickEnquiryInput } from "@/lib/enquiries";
import { sendMail } from "@/lib/mail";
import { siteName, siteUrl } from "@/lib/seo";

/** Where the office reads its post. */
const inbox = () => process.env.ENQUIRY_INBOX?.trim() || contact.email;

const asLocale = (value: string): Locale =>
  (locales as readonly string[]).includes(value) ? (value as Locale) : "en";

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * One column of plain markup. Email clients are not browsers, and a layout that
 * survives everywhere is worth more than one that looks clever in two of them.
 */
function wrap(heading: string, blocks: string[], footer: string) {
  const body = blocks
    .map(
      (block) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#3d2c22;">${block}</p>`,
    )
    .join("");

  return `<div style="background:#f6f3ec;padding:28px 16px;font-family:Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
    <p style="margin:0 0 18px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#b45f2b;font-weight:bold;">${escape(siteName)}</p>
    <h1 style="margin:0 0 20px;font-size:21px;line-height:1.3;color:#562101;">${escape(heading)}</h1>
    ${body}
    <p style="margin:24px 0 0;padding-top:20px;border-top:1px solid #e8e2d6;font-size:13px;line-height:1.7;color:#7a6a5e;">${footer}</p>
  </div>
</div>`;
}

const signature = () =>
  `${escape(siteName)}<br>${escape(contact.addressLines.join(" "))}<br>${escape(contact.phoneDisplay)} &middot; ${escape(contact.email)}`;

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

  const html = wrap(
    t("subject"),
    lines.map((line) =>
      escape(line).replace(
        escape(calendar),
        `<a href="${calendar}" style="color:#b45f2b;">${escape(calendar)}</a>`,
      ),
    ),
    signature(),
  );

  // Paragraphs are separated by a blank line. A signature is not a paragraph,
  // and floated three lines clear of the message when it was treated as one.
  const signOff = [
    siteName,
    contact.addressLines.join(" "),
    `${contact.phoneDisplay} · ${contact.email}`,
  ].join("\n");

  const text = `${lines.join("\n\n")}\n\n--\n${signOff}`;

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

  const rows = facts
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;font-size:13px;color:#7a6a5e;white-space:nowrap;vertical-align:top;">${escape(label)}</td><td style="padding:6px 0;font-size:14px;color:#3d2c22;font-weight:600;">${escape(value)}</td></tr>`,
    )
    .join("");

  const said = input.message?.trim()
    ? `<div style="margin:20px 0 0;padding:16px;background:#f6f3ec;border-radius:10px;font-size:14px;line-height:1.7;color:#3d2c22;white-space:pre-line;">${escape(input.message.trim())}</div>`
    : "";

  const html = wrap(
    input.heading,
    [`<table style="border-collapse:collapse;width:100%;">${rows}</table>${said}`],
    `Reply to this email and it goes straight to ${escape(input.email)}.`,
  );

  const text = [
    input.heading,
    "",
    ...facts.map(([label, value]) => `${label}: ${value}`),
    ...(input.message?.trim() ? ["", input.message.trim()] : []),
    "",
    `Reply to this email and it goes straight to ${input.email}.`,
  ].join("\n");

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
