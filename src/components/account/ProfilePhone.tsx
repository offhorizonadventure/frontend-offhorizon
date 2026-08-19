"use client";

import { PhoneField } from "@/components/ui/PhoneField";
import { labelClass } from "@/components/account/parts";

/**
 * The phone number on the account.
 *
 * The same picker the enquiry forms use, so the dial code list and its
 * translations come from one place rather than two.
 */
export function ProfilePhone({
  label,
  countryLabel,
  searchLabel,
  defaultCountry,
  defaultNumber,
}: {
  label: string;
  countryLabel: string;
  searchLabel: string;
  defaultCountry?: string;
  defaultNumber?: string;
}) {
  return (
    <div className="space-y-2">
      <span className={labelClass}>{label}</span>
      <PhoneField
        id="account-phone"
        name="phone"
        countryLabel={countryLabel}
        searchLabel={searchLabel}
        defaultCountry={defaultCountry}
        defaultNumber={defaultNumber}
      />
    </div>
  );
}
