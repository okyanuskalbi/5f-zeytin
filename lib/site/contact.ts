export type SiteContact = Readonly<{
  phone: string;
  whatsapp: string;
  email: string;
}>;

// Fill only with approved customer-service details. Empty channels stay off the page.
export const siteContact: SiteContact = { phone: "", whatsapp: "", email: "" };

export function hasSiteContact(contact: SiteContact): boolean {
  return Boolean(contact.phone.trim() || contact.whatsapp.replace(/\D/g, "") || contact.email.trim());
}
