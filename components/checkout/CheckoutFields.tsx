"use client";

import { Field } from "@/components/account/FormControls";
import { formatTrPhone, type CheckoutAdapter, type CheckoutDetails, type CheckoutErrors } from "@/lib/checkout/adapter";
import styles from "./Checkout.module.css";

// 21st shadcnspace Shipping Address Fieldset (26538): labelled field groups.
// Adapted to Turkey's linked province/district selects, native semantics and AFİNA tokens.
export function CheckoutFields({ details, errors, adapter, onChange }: {
  details: CheckoutDetails; errors: CheckoutErrors; adapter: CheckoutAdapter;
  onChange: (key: keyof CheckoutDetails, value: string) => void;
}) {
  const field = (key: keyof CheckoutDetails) => ({ id: `checkout-${key}`, name: key, value: details[key], error: errors[key], onChange: (event: React.ChangeEvent<HTMLInputElement>) => onChange(key, key === "phone" ? formatTrPhone(event.target.value) : event.target.value) });
  return <>
    <fieldset>
      <legend>İletişim</legend>
      <Field label="Ad soyad" {...field("name")} required autoComplete="name" maxLength={100} />
      <div className={styles.grid}>
        <Field label="E-posta" {...field("email")} required type="email" autoComplete="email" maxLength={254} />
        <Field label="Telefon" {...field("phone")} required type="tel" inputMode="tel" autoComplete="tel" maxLength={24} hint="Örnek: 0532 123 45 67" />
      </div>
    </fieldset>
    <fieldset>
      <legend>Teslimat adresi</legend>
      <div className={styles.grid}>
        {(["city", "district"] as const).map(key => <div className={styles.field} key={key}>
          <label htmlFor={`checkout-${key}`}>{key === "city" ? "İl" : "İlçe"}</label>
          <select id={`checkout-${key}`} name={key} required className={styles.select} value={details[key]} autoComplete={key === "city" ? "address-level1" : "address-level2"}
            disabled={key === "district" && !details.city} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `checkout-${key}-error` : undefined}
            onChange={event => onChange(key, event.target.value)}>
            <option value="">{key === "city" ? "İl seçin" : "İlçe seçin"}</option>
            {(key === "city" ? adapter.provinces() : adapter.districts(details.city)).map(name => <option key={name} value={name}>{name}</option>)}
          </select>
          {errors[key] && <p id={`checkout-${key}-error`} className={styles.error}>{errors[key]}</p>}
        </div>)}
      </div>
      <Field label="Mahalle" {...field("neighborhood")} required autoComplete="address-level3" maxLength={100} />
      <div className={styles.field}>
        <label htmlFor="checkout-address">Açık adres</label>
        <textarea id="checkout-address" name="address" required rows={3} maxLength={500} autoComplete="street-address" className={styles.textarea} value={details.address}
          aria-invalid={!!errors.address} aria-describedby={errors.address ? "checkout-address-error" : "checkout-address-hint"} onChange={event => onChange("address", event.target.value)} />
        <p id="checkout-address-hint" className={styles.muted}>Sokak, bina ve daire numarasını yazın.</p>
        {errors.address && <p id="checkout-address-error" className={styles.error}>{errors.address}</p>}
      </div>
      <Field label="Posta kodu" {...field("postalCode")} required inputMode="numeric" autoComplete="postal-code" maxLength={5} />
    </fieldset>
    <fieldset>
      <legend>Fatura bilgisi</legend>
      <div id="checkout-billingType" className={styles.radioRow}>
        {(["individual", "corporate"] as const).map(type => <label key={type} className={styles.choice}>
          <input type="radio" name="billingType" required value={type} checked={details.billingType === type} onChange={() => onChange("billingType", type)} />
          <span>{type === "individual" ? "Bireysel" : "Kurumsal"}</span>
        </label>)}
      </div>
      <p className={styles.muted}>Fatura teslimat adresine düzenlenir.</p>
      {details.billingType === "corporate" && <>
        <Field label="Firma unvanı" {...field("company")} required autoComplete="organization" maxLength={150} />
        <div className={styles.grid}>
          <Field label="VKN" {...field("taxNumber")} required inputMode="numeric" maxLength={10} />
          <Field label="Vergi dairesi" {...field("taxOffice")} required maxLength={100} />
        </div>
      </>}
    </fieldset>
  </>;
}
