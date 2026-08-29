import { getTranslations } from "next-intl/server";

import { QuickEnquiryModal } from "@/components/ui/QuickEnquiryModal";
import type { Locale } from "@/i18n/config";

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
    close: t("close"),
    required: t("required"),
    countryLabel: t("countryLabel"),
    searchLabel: t("searchLabel"),
  };
}

export async function QuickEnquiryButton({ locale }: { locale: Locale }) {
  const labels = await quickEnquiryLabels(locale);

  return (
    <div
      data-floating-enquiry
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-end p-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:p-0"
    >
      <QuickEnquiryModal
        labels={labels}
        className="bg-brand-800 text-cream-100 shadow-brand-950/25 hover:bg-brand-900 pointer-events-auto inline-flex h-12 items-center gap-2.5 rounded-full px-7 text-[11.5px] font-bold tracking-[0.13em] whitespace-nowrap uppercase shadow-lg transition-colors duration-300"
      >
        <span
          aria-hidden
          className="bg-ember-500 shadow-ember-500/20 size-2 rounded-full shadow-[0_0_0_4px]"
        />
        {labels.trigger}
      </QuickEnquiryModal>
    </div>
  );
}
