import { getTranslations } from "next-intl/server";

import { QuickEnquiryModal } from "@/components/ui/QuickEnquiryModal";
import type { Locale } from "@/i18n/config";

/**
 * Builds the modal's labels from the catalogue.
 *
 * Exported so the in-page buttons and the floating one stay on one source: the
 * label set is long enough that a second copy would drift.
 */
export async function quickEnquiryLabels(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "consultation" });

  return {
    trigger: t("trigger"),
    title: t("title"),
    subtitle: t("subtitle"),
    fullName: t("fullName"),
    phone: t("phone"),
    email: t("email"),
    message: t("message"),
    messagePlaceholder: t("messagePlaceholder"),
    submit: t("submit"),
    sending: t("sending"),
    successTitle: t("successTitle"),
    successBody: t("successBody"),
    close: t("close"),
    required: t("required"),
    countryLabel: t("countryLabel"),
    searchLabel: t("searchLabel"),
  };
}

/**
 * Floating quick enquiry button, present on every page.
 *
 * Bottom right on a desktop, and bottom centre on a phone so it sits clear of
 * the thumb reaching for browser chrome. `z-90` keeps it under the nav drawer
 * and the gallery lightbox, both of which are full screen and should cover it.
 */
export async function QuickEnquiryButton({ locale }: { locale: Locale }) {
  const labels = await quickEnquiryLabels(locale);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-90 flex justify-center p-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:p-0">
      <QuickEnquiryModal
        labels={labels}
        className="pointer-events-auto inline-flex h-12 items-center gap-2.5 rounded-full bg-brand-800 px-6 text-[11.5px] font-bold tracking-[0.13em] text-cream-100 uppercase shadow-lg shadow-brand-950/25 transition-colors duration-300 hover:bg-brand-900"
      >
        <span
          aria-hidden
          className="size-2 rounded-full bg-ember-500 shadow-[0_0_0_4px] shadow-ember-500/20"
        />
        {labels.trigger}
      </QuickEnquiryModal>
    </div>
  );
}
