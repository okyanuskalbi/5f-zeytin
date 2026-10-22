"use client";

import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { hasSiteContact, siteContact } from "@/lib/site/contact";
import { WholesaleForm } from "./WholesaleForm";
import styles from "./WholesaleFaq.module.css";

export function WholesaleOffer(): JSX.Element {
  const phone = siteContact.phone.trim();
  const whatsapp = siteContact.whatsapp.replace(/\D/g, "");
  const email = siteContact.email.trim();

  return <section id="toptan-iletisim" tabIndex={-1} aria-labelledby="toptan-title" className={styles.offer}>
    <h2 id="toptan-title">Market, restoran, otel, bayi.</h2>
    <p>Toptan alım için miktar ve teslimat bilgisi verin; aynı gün dönüş yapalım.</p>
    <Dialog>
      <DialogTrigger asChild><Button className={styles.trigger}>Toptan teklif isteyin</Button></DialogTrigger>
      <DialogContent className={styles.dialog}>
        <DialogHeader>
          <DialogTitle>Toptan teklif isteyin</DialogTitle>
          <DialogDescription>Miktar ve teslimat bilgilerinizi talep mesajına yazın.</DialogDescription>
        </DialogHeader>
        <WholesaleForm />
      </DialogContent>
    </Dialog>
    {hasSiteContact(siteContact) && <div className={styles.channels}>
      {phone && <a href={`tel:${phone.replace(/\s/g, "")}`}>Telefon edin</a>}
      {whatsapp && <a href={`https://wa.me/${whatsapp}`}>WhatsApp’tan yazın</a>}
      {email && <a href={`mailto:${email}`}>E-posta gönderin</a>}
    </div>}
  </section>;
}
