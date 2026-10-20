"use client";

import { useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getMembershipAdapters } from "@/lib/auth/demo";
import type { Address, AddressInput } from "@/lib/account/adapter";
import { Feedback, Field, useMembershipAction } from "./FormControls";
import styles from "./Membership.module.css";

export function AddressBook({ initialAddresses, onChange }: { initialAddresses: Address[]; onChange: (addresses: Address[]) => void }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [removing, setRemoving] = useState<Address | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const formHeading = useRef<HTMLHeadingElement>(null);
  const { busy, feedback, run } = useMembershipAction();

  async function refresh() { const updated = await getMembershipAdapters().account.listAddresses(); setAddresses(updated); onChange(updated); }
  function edit(address: Address | "new") {
    setEditing(address);
    requestAnimationFrame(() => formHeading.current?.focus());
  }
  function finish() { setEditing(null); heading.current?.focus(); }

  return <section aria-labelledby="addresses-title">
    <h2 id="addresses-title" ref={heading} tabIndex={-1}>Adreslerim</h2>
    <Button disabled={busy} onClick={() => edit("new")}>Adres ekle</Button>
    <Feedback {...feedback} />
    {!addresses.length && <p className={styles.empty}>Henüz adresiniz yok.</p>}
    <ul className={styles.list}>{addresses.map(address => <li key={address.id} className={styles.address}>
      <h3>{address.title}</h3>
      {address.isDefault && <span className={styles.badge}>Varsayılan adres</span>}
      <p>{address.recipient}</p><p>{address.line}</p><p>{address.district} / {address.city} · {address.postalCode}</p><p>{address.phone}</p>
      <div className={styles.actions}>
        <Button variant="outline" disabled={busy} onClick={() => edit(address)}>Düzenle</Button>
        {!address.isDefault && <Button variant="outline" disabled={busy} onClick={() => void run(async () => { await getMembershipAdapters().account.setDefaultAddress(address.id); await refresh(); return "Varsayılan adres güncellendi."; })}>Varsayılan yap</Button>}
        <Button variant="link" disabled={busy} onClick={() => setRemoving(address)}>Sil</Button>
      </div>
    </li>)}</ul>
    {editing && <div className={styles.addressForm}>
      <h3 tabIndex={-1} ref={formHeading}>{editing === "new" ? "Yeni adres" : "Adresi düzenle"}</h3>
      <AddressForm key={editing === "new" ? "new" : editing.id} address={editing === "new" ? undefined : editing} onCancel={finish} onSave={async () => { await refresh(); finish(); }} />
    </div>}
    <Dialog open={removing !== null} onOpenChange={open => { if (!open && !busy) setRemoving(null); }}>
      <DialogContent role="alertdialog" onCloseAutoFocus={event => { event.preventDefault(); heading.current?.focus(); }}>
        <DialogHeader><DialogTitle>Adres silinsin mi?</DialogTitle><DialogDescription>{removing?.title} adresi demo adres defterinizden silinecek.</DialogDescription></DialogHeader>
        <div className={styles.actions}>
          <Button variant="outline" disabled={busy} onClick={() => setRemoving(null)}>Vazgeç</Button>
          <Button variant="destructive" disabled={busy} onClick={() => void run(async () => { if (!removing) return; await getMembershipAdapters().account.deleteAddress(removing.id); await refresh(); setRemoving(null); if (editing !== "new" && editing?.id === removing.id) finish(); return "Adres silindi."; })}>Adresi sil</Button>
        </div>
      </DialogContent>
    </Dialog>
  </section>;
}

const addressFields = [
  { name: "title", label: "Adres başlığı", autoComplete: "off", maxLength: 100 },
  { name: "recipient", label: "Alıcı", autoComplete: "shipping name", maxLength: 100 },
  { name: "phone", label: "Telefon", autoComplete: "shipping tel", type: "tel", maxLength: 20 },
  { name: "city", label: "İl", autoComplete: "shipping address-level1", maxLength: 100 },
  { name: "district", label: "İlçe", autoComplete: "shipping address-level2", maxLength: 100 },
  { name: "line", label: "Açık adres", autoComplete: "shipping street-address", maxLength: 500 },
  { name: "postalCode", label: "Posta kodu", autoComplete: "shipping postal-code", inputMode: "numeric", maxLength: 5 },
] as const;

function AddressForm({ address, onSave, onCancel }: { address?: Address; onSave: () => Promise<void>; onCancel: () => void }) {
  const { busy, feedback, errors, run } = useMembershipAction();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const input = Object.fromEntries(addressFields.map(field => [field.name, String(data.get(field.name) ?? "")])) as AddressInput;
    void run(async () => { await getMembershipAdapters().account.saveAddress({ ...input, id: address?.id }); await onSave(); });
  }
  return <form noValidate onSubmit={submit} className={`${styles.form} mt-6`} aria-label="Adres bilgileri" aria-busy={busy}>
    <fieldset disabled={busy}>
      <div className={styles.addressGrid}>{addressFields.map(field => <Field key={field.name} {...field} id={`address-${field.name}`} required defaultValue={address?.[field.name] ?? ""} error={errors[field.name]} />)}</div>
      <Feedback {...feedback} />
      <div className={styles.actions}><Button type="submit">{busy ? "Kaydediliyor…" : "Adresi kaydet"}</Button><Button variant="outline" onClick={onCancel}>Vazgeç</Button></div>
    </fieldset>
  </form>;
}
