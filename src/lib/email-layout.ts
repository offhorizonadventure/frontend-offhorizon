import "server-only";

import { contact } from "@/config/contact";
import { siteName, siteUrl } from "@/lib/seo";

/**
 * One layout for every letter the site sends.
 *
 * Email clients are twenty years behind browsers, so this is tables, inline
 * styles and nothing clever: no flexbox, no grid, no external stylesheet, no
 * web font. What it loses in flourish it gains in arriving looking the same in
 * Gmail, Outlook and a phone.
 *
 * Every message carries a plain text version too. Some people read mail that
 * way, some filters trust a message more for having one, and it is the version
 * that survives when images are turned off.
 */

const BROWN = "#562101";
const EMBER = "#b45f2b";
const INK = "#3d2c22";
const MUTED = "#7a6a5e";
const CREAM = "#f6f3ec";
const LINE = "#e8e2d6";

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif,'Apple Color Emoji'";

export const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export type EmailFact = [label: string, value: string];

export type EmailInput = {
  /** The line under the subject in an inbox list. */
  preheader?: string;
  heading: string;
  /** Shown large, above everything: an amount, usually. */
  figure?: { label: string; value: string };
  paragraphs?: string[];
  facts?: EmailFact[];
  /** A quotation of what somebody wrote, kept apart from our own words. */
  quote?: string | null;
  cta?: { label: string; href: string };
  /** The last line before the signature. */
  note?: string;
};

const paragraph = (text: string) =>
  `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${INK};">${text}</p>`;

/** Bare addresses become links, so nobody has to copy one out by hand. */
const linkify = (text: string) =>
  escapeHtml(text)
    .replace(
      /https?:\/\/[^\s<]+/g,
      (url) => `<a href="${url}" style="color:${EMBER};text-decoration:underline;">${url}</a>`,
    )
    // A line break somebody typed is a line break they meant, and a signature
    // ran onto one line without this.
    .replace(/\n/g, "<br>");

export function renderEmail(input: EmailInput): { html: string; text: string } {
  const facts = (input.facts ?? []).filter(([, value]) => value);

  const figure = input.figure
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 24px;">
        <tr><td style="padding:18px 20px;background:${CREAM};border-radius:12px;">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-weight:bold;">${escapeHtml(input.figure.label)}</p>
          <p style="margin:0;font-size:26px;line-height:1.2;color:${BROWN};font-weight:bold;">${escapeHtml(input.figure.value)}</p>
        </td></tr>
      </table>`
    : "";

  const table = facts.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 20px;border-collapse:collapse;">
        ${facts
          .map(
            ([label, value], index) =>
              `<tr>
                <td style="padding:9px 16px 9px 0;font-size:13px;color:${MUTED};white-space:nowrap;vertical-align:top;${index ? `border-top:1px solid ${LINE};` : ""}">${escapeHtml(label)}</td>
                <td style="padding:9px 0;font-size:14px;color:${INK};font-weight:600;text-align:right;${index ? `border-top:1px solid ${LINE};` : ""}">${escapeHtml(value)}</td>
              </tr>`,
          )
          .join("")}
      </table>`
    : "";

  const quote = input.quote?.trim()
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 20px;">
        <tr><td style="padding:16px 18px;background:${CREAM};border-radius:12px;font-size:14px;line-height:1.7;color:${INK};white-space:pre-line;">${escapeHtml(input.quote.trim())}</td></tr>
      </table>`
    : "";

  const cta = input.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 24px;">
        <tr><td style="border-radius:999px;background:${BROWN};">
          <a href="${escapeHtml(input.cta.href)}" style="display:inline-block;padding:13px 28px;font-size:12px;letter-spacing:1.2px;text-transform:uppercase;font-weight:bold;color:#ffffff;text-decoration:none;">${escapeHtml(input.cta.label)}</a>
        </td></tr>
      </table>`
    : "";

  const note = input.note
    ? `<p style="margin:0 0 4px;font-size:13px;line-height:1.7;color:${MUTED};">${linkify(input.note)}</p>`
    : "";

  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(input.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${CREAM};">
${input.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.preheader)}</div>` : ""}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:${CREAM};">
  <tr><td align="center" style="padding:28px 14px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;">
      <tr><td style="padding:0 0 18px;">
        <a href="${siteUrl}" style="font-family:${FONT};font-size:13px;letter-spacing:2.5px;text-transform:uppercase;font-weight:bold;color:${BROWN};text-decoration:none;">${escapeHtml(siteName)}</a>
      </td></tr>

      <tr><td style="background:#ffffff;border-radius:18px;padding:32px;font-family:${FONT};">
        <h1 style="margin:0 0 20px;font-size:22px;line-height:1.3;color:${BROWN};font-weight:bold;">${escapeHtml(input.heading)}</h1>
        ${figure}
        ${(input.paragraphs ?? []).map((line) => paragraph(linkify(line))).join("")}
        ${table}
        ${quote}
        ${cta}
        ${note}
      </td></tr>

      <tr><td style="padding:20px 4px 0;font-family:${FONT};font-size:12px;line-height:1.8;color:${MUTED};">
        <strong style="color:${INK};">${escapeHtml(siteName)}</strong><br>
        ${escapeHtml(contact.addressLines.join(" "))}<br>
        <a href="tel:${escapeHtml(contact.phone)}" style="color:${MUTED};text-decoration:none;">${escapeHtml(contact.phoneDisplay)}</a>
        &nbsp;&middot;&nbsp;
        <a href="mailto:${escapeHtml(contact.email)}" style="color:${MUTED};text-decoration:none;">${escapeHtml(contact.email)}</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  const text = [
    input.heading,
    "",
    ...(input.figure ? [`${input.figure.label}: ${input.figure.value}`, ""] : []),
    ...(input.paragraphs ?? []).flatMap((line) => [line, ""]),
    ...(facts.length ? [...facts.map(([label, value]) => `${label}: ${value}`), ""] : []),
    ...(input.quote?.trim() ? [input.quote.trim(), ""] : []),
    ...(input.cta ? [`${input.cta.label}: ${input.cta.href}`, ""] : []),
    ...(input.note ? [input.note, ""] : []),
    "--",
    siteName,
    contact.addressLines.join(" "),
    `${contact.phoneDisplay} · ${contact.email}`,
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");

  return { html, text };
}
