import type { JSX } from "react";
import { siteContact, type SiteContact } from "@/lib/site/contact";
import styles from "./V3Foundation.module.css";

export function WholesaleContact({ contact = siteContact }: { contact?: SiteContact }): JSX.Element {
  const phone = contact.phone.trim();
  const whatsapp = contact.whatsapp.replace(/\D/g, "");
  const email = contact.email.trim();
  const hasContact = Boolean(phone || whatsapp || email);

  return (
    <section id="toptan" tabIndex={-1} aria-labelledby="toptan-title" className={styles.wholesale}>
      {/* Preserve the menu/bookmark destination alongside quick-view's #toptan. */}
      <div id="toptan-iletisim" tabIndex={-1} className={styles.contact}>
        <h3 id="toptan-title">Toptan alım için bize yazın</h3>
        {hasContact ? (
          <div className={styles.channels}>
            {phone && <a href={`tel:${phone.replace(/\s/g, "")}`} className={styles.contactLink}>Telefon edin</a>}
            {whatsapp && <a href={`https://wa.me/${whatsapp}`} className={styles.contactLink}>WhatsApp’tan yazın</a>}
            {email && <a href={`mailto:${email}`} className={styles.contactLink}>E-posta gönderin</a>}
          </div>
        ) : <p>İletişim bilgileri yakında</p>}
      </div>
    </section>
  );
}
