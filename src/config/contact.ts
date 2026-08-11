const address = "Log Huts Rd, Siyal, Manali, Himachal Pradesh 175131, India";

export const contact = {
  phone: "+919617900012",
  email: "info@offhorizon.com",
  address,
  addressLines: ["Log Huts Rd, Siyal, Manali,", "Himachal Pradesh (India) 175131"],
  /**
   * Built from the address rather than a shortened share link, so it resolves
   * the same everywhere and there is no redirect to trust.
   */
  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`,
} as const;
