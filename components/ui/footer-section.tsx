"use client";

/* eslint-disable @next/next/no-img-element -- Original local brand and payment artwork. */
import { useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import { Switch as SwitchPrimitive } from "radix-ui";
import { ArrowUpRight, Moon, Send, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/site/BrandLogo";
import { PaymentLogos } from "@/components/site/PaymentLogos";
import { corporateContact } from "@/lib/site/corporate-contact";
import { seller } from "@/lib/site/seller";
import type { SiteContact } from "@/lib/site/contact";
import styles from "@/components/site/Footer.module.css";

const subscribeReady = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

const shoppingLinks = [
  { label: "Ürünler", href: "/#kiler" },
  { label: "Online Mağaza", href: "/#urunler" },
  { label: "Sepetim", href: "/sepet" },
  { label: "Toptan Satış İçin İletişime Geçin", href: "/#toptan-iletisim" },
];
const helpLinks = [
  { label: "Sipariş takibi", href: "/siparis-takip" },
  { label: "Hesabım", href: "/hesabim" },
  { label: "Sık sorulan sorular", href: "/#sik-sorulanlar" },
  { label: "İade ve İptal", href: "/iade" },
];
const legalLinks = [
  { label: "KVKK", href: "/kvkk" },
  { label: "Mesafeli Satış Sözleşmesi", href: "/mesafeli-satis" },
  { label: "İade ve İptal", href: "/iade" },
];

/** Fixed recipient/subject; a visitor's address can only become encoded body
 * text. This prepares a local link, never subscribes or sends a request. */
export function buildFooterQuoteDraft(email: string): string {
  const address = email.replace(/[\r\n]+/g, " ").trim();
  const subject = "AFİNA ZEYTİN · Ürün ve teklif bilgisi";
  const body = ["AFİNA ZEYTİN ürünleri hakkında bilgi almak istiyorum.", "", `İletişim e-postam: ${address}`, "", "İlgilendiğim ürün:", "Miktar:", "Şehir:"].join("\n");
  return `mailto:${corporateContact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Task170 adapts 21st shadcnui-blocks/Footer 04 (26006): compact original
 * logo, grouped destinations, a small email row and a separated legal band.
 * Source hashes: docs/referans/footer-170-source.json. The actual AFİNA form
 * prepares an unsent mailto; payment, contact and local theme gates remain. */
export function Footerdemo({ contact }: { contact: SiteContact }) {
  const [dark, setDark] = useState(false);
  const [email, setEmail] = useState("");
  const [draft, setDraft] = useState<string>();
  const hydrated = useSyncExternalStore(subscribeReady, clientReady, serverReady);
  const [street, ...locality] = seller.address.split(", ");
  const phone = contact.phone.trim();
  const contactEmail = contact.email.trim();

  function prepareDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setDraft(buildFooterQuoteDraft(email));
  }

  return <footer data-surface={dark ? "dark" : "light"} data-footer-component="Footerdemo" data-21st-source="26006" className={styles.footer}>
    <div data-reading-safe="">
      <div className={styles.columns}>
        <div className={styles.message} aria-labelledby="footer-brand-title">
          <h2 id="footer-brand-title" className="sr-only">AFİNA ZEYTİN</h2>
          <Link href="/" aria-label="Afina Zeytin ana sayfa" className={styles.home}><BrandLogo tone={dark ? "dark" : "light"} loading="lazy" className={styles.staticLogo} /></Link>
          <p className={styles.signature}>Kökü toprakta.<br /> Yeri sofrada.</p>
          <p>Toprağın sunduğu lezzet, Afina’nın özeniyle.</p>
        </div>
        <nav className={styles.column} aria-labelledby="footer-shopping-title">
          <h2 id="footer-shopping-title" className={styles.heading}>Alışveriş</h2>
          <ul>{shoppingLinks.map(link => <li key={link.href}><Link className={styles.link} href={link.href}>{link.label}</Link></li>)}</ul>
        </nav>
        <nav className={styles.column} aria-labelledby="footer-help-title">
          <h2 id="footer-help-title" className={styles.heading}>Yardım</h2>
          <ul>{helpLinks.map(link => <li key={link.href}><Link className={styles.link} href={link.href}>{link.label}</Link></li>)}</ul>
        </nav>
        <div className={`${styles.column} ${styles.destination}`} aria-labelledby="footer-contact-title">
          <h2 id="footer-contact-title" className={styles.heading}>İletişim</h2>
          <address><span>{street}, </span><span>{locality.join(", ")}</span></address>
          <ul>
            {phone && <li><a className={styles.link} href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a></li>}
            {contactEmail && <li><a className={styles.link} href={`mailto:${contactEmail}`}>{contactEmail}</a></li>}
            <li><Link className={styles.link} href="/#tesisimiz">Tesisimiz</Link></li>
            <li><a className={styles.link} href="https://afina.com.tr/#iletisim" target="_blank" rel="noopener noreferrer">Şirketler Topluluğu iletişim bilgileri <ArrowUpRight size={16} aria-hidden="true" /></a></li>
          </ul>
          <a href="https://afina.com.tr" target="_blank" rel="noopener" className={styles.community} aria-label="AFİNA Şirketler Topluluğu">
            <img src={dark ? "/brand/afina-topluluk-dark.svg" : "/brand/afina-topluluk.svg"} alt="AFİNA Şirketler Topluluğu" width={381} height={225} loading="lazy" decoding="async" />
            <span>Bir AFİNA Şirketler Topluluğu markası</span>
          </a>
        </div>
      </div>
      <div className={styles.serviceRow}>
        <form className={styles.emailForm} action="/#teklif" method="get" aria-label="E-postayla teklif taslağı" onSubmit={prepareDraft}>
          <label htmlFor="footer-quote-email">Ürün ve teklif bilgisi alın</label>
          <div className={styles.emailRow}>
            <Input id="footer-quote-email" type="email" autoComplete="email" required maxLength={254} value={email}
              placeholder="E-posta adresiniz" aria-describedby="footer-email-explanation" className={styles.emailInput}
              onChange={event => { setEmail(event.currentTarget.value); setDraft(undefined); }} />
            <Button type="submit" size="icon" disabled={!hydrated} className={styles.emailPrepare}>
              <Send size={18} aria-hidden="true" /><span className="sr-only">E-posta taslağını hazırla</span>
            </Button>
          </div>
          <p id="footer-email-explanation" className={styles.emailExplanation}>Bir e-posta taslağı hazırlanır. Gönderimi e-posta uygulamanızda siz tamamlarsınız.</p>
          {draft && <div className={styles.draft} role="status">
            <p>Taslağınız hazır. Bu sayfa e-posta göndermedi.</p>
            <a href={draft} className={styles.link}>E-posta uygulamasında aç <ArrowUpRight size={16} aria-hidden="true" /></a>
            <p>Alıcı: {corporateContact.name} · {corporateContact.email}</p>
          </div>}
        </form>
        <div className={styles.serviceTools}>
          <div className={styles.payment} role="group" aria-label="Güvenli ödeme">
            <div className={styles.provider}><p>Güvenli Ödeme</p><PaymentLogos tone={dark ? "light" : "dark"} brands={["paytr"]} className={styles.paymentLogo} /></div>
            <ul className={styles.cards} aria-label="Kabul edilen kartlar"><PaymentLogos tone={dark ? "light" : "dark"} brands={["visa", "mastercard", "troy"]} asListItems className={styles.paymentLogo} /></ul>
          </div>
          <div className={styles.themeControl}>
            <p id="footer-theme-label">Alt bilgi görünümü</p>
            <div className={styles.themeRow}>
              <Sun size={18} aria-hidden="true" />
              <SwitchPrimitive.Root id="footer-dark-mode" checked={dark} onCheckedChange={setDark} disabled={!hydrated}
                aria-label="Alt bilgi için koyu görünüm" className={styles.themeSwitch}>
                <SwitchPrimitive.Thumb className={styles.themeThumb} />
              </SwitchPrimitive.Root>
              <Moon size={18} aria-hidden="true" />
              <span className={styles.themeName}>{dark ? "Koyu" : "Açık"}</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.imprint}>
        <p>{seller.name} · {seller.taxOffice} VD · VKN {seller.taxId}</p>
        <nav aria-label="Yasal bilgiler"><ul>{legalLinks.map(link => <li key={link.href}><Link className={styles.link} href={link.href}>{link.label}</Link></li>)}</ul></nav>
        <div className={styles.notice}><p>© 2026 AFİNA ZEYTİN</p><p>Önizleme: fiyatlar ve görseller temsilidir.</p></div>
      </div>
    </div>
  </footer>;
}
