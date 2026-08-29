const address = "Log Huts Rd, Siyal, Manali, Himachal Pradesh 175131, India";

export const contact = {
  phone: "+919609400006",
  phoneDisplay: "+91 96094 00006",
  email: "info@offhorizon.com",
  address,
  addressLines: ["Log Huts Rd, Siyal, Manali,", "Himachal Pradesh (India) 175131"],
  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`,
} as const;
