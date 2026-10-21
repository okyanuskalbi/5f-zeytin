export type SiteContact = Readonly<{
  phone: string;
  whatsapp: string;
  email: string;
}>;

// Fill only with approved customer-service details. Empty channels stay off the page.
export const siteContact: SiteContact = { phone: "", whatsapp: "", email: "" };
