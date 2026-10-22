"use client";

import { useRef, useState, type JSX } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { hasSiteContact, siteContact } from "@/lib/site/contact";
import styles from "./WholesaleFaq.module.css";

const WholesaleDialog = dynamic(() => import("./WholesaleDialog").then(module => module.WholesaleDialog));

export function WholesaleOffer(): JSX.Element {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const phone = siteContact.phone.trim();
  const whatsapp = siteContact.whatsapp.replace(/\D/g, "");
  const email = siteContact.email.trim();

  return <section id="toptan-iletisim" tabIndex={-1} aria-labelledby="toptan-title" className={styles.offer}>
    <h2 id="toptan-title">Market, restoran, otel, bayi.</h2>
    <p>Toptan alım için miktar ve teslimat bilgisi verin; aynı gün dönüş yapalım.</p>
    <Button ref={trigger} className={styles.trigger} aria-haspopup="dialog" aria-expanded={open}
      onClick={() => setOpen(true)}>Toptan teklif isteyin</Button>
    {open && <WholesaleDialog onClose={() => setOpen(false)} onRestoreFocus={() => trigger.current?.focus()} />}

    {hasSiteContact(siteContact) && <div className={styles.channels}>
      {phone && <a href={`tel:${phone.replace(/\s/g, "")}`}>Telefon edin</a>}
      {whatsapp && <a href={`https://wa.me/${whatsapp}`}>WhatsApp’tan yazın</a>}
      {email && <a href={`mailto:${email}`}>E-posta gönderin</a>}
    </div>}
  </section>;
}
