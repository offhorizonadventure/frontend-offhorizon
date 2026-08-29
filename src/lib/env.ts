const PUBLIC = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
};

const SECRET = {
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
  SITE_REVALIDATE_SECRET: process.env.SITE_REVALIDATE_SECRET,
};

const OPTIONAL: Record<string, string | undefined> = {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
};

const WITHOUT: Record<string, string> = {
  SMTP_HOST: "No email goes out: no receipts, and no cancellation notices.",
  SMTP_USER: "No email goes out: no receipts, and no cancellation notices.",
  SMTP_PASSWORD: "No email goes out: no receipts, and no cancellation notices.",
  NEXT_PUBLIC_GTM_ID: "No analytics or advertising tags load.",
};

const onServer = typeof window === "undefined";
const isBuild = process.env.NEXT_PHASE === "phase-production-build";
const isProduction = process.env.NODE_ENV === "production";

function checkEnvironment() {
  if (isBuild) return;

  if (!onServer) return;

  const missing = Object.entries(PUBLIC)
    .filter(([name, value]) => !value && (name !== "NEXT_PUBLIC_SITE_URL" || isProduction))
    .map(([name]) => name);

  if (isProduction) {
    missing.push(
      ...Object.entries(SECRET)
        .filter(([, value]) => !value)
        .map(([name]) => name),
    );
  }

  if (missing.length) {
    throw new Error(
      [
        `Refusing to start. ${missing.length} required environment ${
          missing.length === 1 ? "variable is" : "variables are"
        } not set:`,
        "",
        ...missing.map((name) => `  ${name}`),
        "",
        "See .env.example for what each one is and where to get it.",
      ].join("\n"),
    );
  }

  for (const [name, value] of Object.entries(OPTIONAL)) {
    if (!value) process.emitWarning(`${name} is not set. ${WITHOUT[name]}`, "OffhorizonConfig");
  }
}

checkEnvironment();

export const SUPABASE_URL = PUBLIC.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY = PUBLIC.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
