import "server-only";

import nodemailer from "nodemailer";

const HOST = process.env.SMTP_HOST;
const PORT = Number(process.env.SMTP_PORT ?? 465);
const USER = process.env.SMTP_USER;
const PASSWORD = process.env.SMTP_PASSWORD;
const FROM = process.env.SMTP_FROM ?? USER;

export const mailerConfigured = () => Boolean(HOST && USER && PASSWORD);

let transport: nodemailer.Transporter | null = null;

const getTransport = () => {
  transport ??= nodemailer.createTransport({
    host: HOST,
    port: PORT,
    secure: PORT === 465,
    auth: { user: USER, pass: PASSWORD },
    pool: true,
  });

  return transport;
};

export async function sendMail(input: {
  to: string;
  subject: string;
  text: string;
  /** Sent alongside the text, for clients that prefer it. */
  html?: string;
  /** Where a reply should go. The office wants replies to reach the sender. */
  replyTo?: string;
}) {
  if (!mailerConfigured() || !input.to) return { ok: false as const, error: "SMTP is not set up." };

  try {
    await getTransport().sendMail({
      from: FROM,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      replyTo: input.replyTo ?? FROM,
    });

    return { ok: true as const };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Could not send the email.",
    };
  }
}
