/**
 * Contact endpoints. TODO: confirm the real WhatsApp business number before
 * launch; this is a placeholder and the link will not reach anyone as-is.
 */
export const siteConfig = {
  whatsappNumber: "919999999999",
  get whatsappUrl() {
    return `https://wa.me/${this.whatsappNumber}`;
  },
} as const;
