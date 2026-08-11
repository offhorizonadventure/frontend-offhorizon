import type messages from "../messages/en.json";
import type { routing } from "@/i18n/routing";

// Type-safe locales and message keys across the app.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
