import { getTranslations } from "next-intl/server";

import { DatesDrawer } from "@/components/tour/DatesDrawer";
import type { BookingProps } from "@/components/tour/BookingWizard";
import { quickEnquiryLabels } from "@/components/ui/QuickEnquiry";
import { QuickEnquiryModal } from "@/components/ui/QuickEnquiryModal";
import type { Locale } from "@/i18n/config";

/** Book or ask, pinned to the bottom. Hides the floating enquiry button. */
export async function TourActions({ locale, booking }: { locale: Locale; booking: BookingProps }) {
  const t = await getTranslations({ locale, namespace: "tour" });
  const labels = await quickEnquiryLabels(locale);

  // z-30: under the destinations panel.
  return (
    <div
      data-tour-actions
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-end gap-2.5 p-4 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:p-0"
    >
      <QuickEnquiryModal
        labels={labels}
        className="border-brand-900/15 text-brand-800 shadow-brand-950/10 hover:border-brand-800 hover:bg-brand-800 hover:text-cream-100 pointer-events-auto flex h-12 flex-1 basis-0 cursor-pointer items-center justify-center rounded-full border bg-white/90 px-4 text-[11px] font-bold tracking-[0.12em] whitespace-nowrap uppercase shadow-lg backdrop-blur-md transition-colors duration-300 sm:inline-flex sm:flex-none sm:px-7"
      >
        {labels.trigger}
      </QuickEnquiryModal>

      <DatesDrawer
        label={t("price.book")}
        title={t("price.datesTitle")}
        booking={booking}
        className="bg-brand-800 text-cream-100 shadow-brand-950/25 hover:bg-brand-900 pointer-events-auto flex h-12 flex-1 basis-0 cursor-pointer items-center justify-center rounded-full px-7 text-[11px] font-bold tracking-[0.12em] whitespace-nowrap uppercase shadow-lg transition-colors duration-300 sm:hidden"
      />
    </div>
  );
}
