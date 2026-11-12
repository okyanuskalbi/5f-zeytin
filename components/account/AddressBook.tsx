"use client";

import { useRef, useState, type FormEvent } from "react";
import { PillButton } from "@/components/storefront/ui/PillButton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tag } from "@/components/storefront/ui/Tag";
import { getMembershipAdapters } from "@/lib/auth/demo";
import type { AccountAdapter, Address, AddressInput } from "@/lib/account/adapter";
import { Feedback, Field, useMembershipAction } from "./FormControls";
import styles from "./Membership.module.css";

export type AddressBookAdapter = Pick<AccountAdapter, "listAddresses" | "saveAddress" | "deleteAddress" | "setDefaultAddress">;

export function AddressBook({ initialAddresses, onChange, adapter, demo = true }: { initialAddresses: Address[]; onChange: (addresses: Address[]) => void; adapter?: AddressBookAdapter; demo?: boolean }) {
  const getAdapter = () => adapter ?? getMembershipAdapters().account;
  const [addresses, setAddresses] = useState(initialAddresses);
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [removing, setRemoving] = useState<Address | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const formHeading = useRef<HTMLHeadingElement>(null);
  const { busy, feedback, run } = useMembershipAction();

  async function refresh() { const updated = await getAdapter().listAddresses(); setAddresses(updated); onChange(updated); }
  function edit(address: Address | "new") {
    setEditing(address);
    requestAnimationFrame(() => formHeading.current?.focus());
  }
  function finish() { setEditing(null); heading.current?.focus(); }

  return <section aria-labelledby="addresses-title">
    <h2 id="addresses-title" ref={heading} tabIndex={-1}>Adreslerim</h2>
    <PillButton icon="plus" disabled={busy} onClick={() => edit("new")}>Adres ekle</PillButton>
    <Feedback {...feedback} />
    {!addresses.length && <p className={styles.empty}>Henüz adresiniz yok.</p>}
    <ul className={styles.list}>{addresses.map(address => <li key={address.id} className={styles.address}>
      <h3>{address.title}</h3>
      {address.isDefault && <Tag>Varsayılan adres</Tag>}
      <p>{address.recipient}</p><p>{address.line}</p><p>{address.district} / {address.city}, {address.postalCode}</p><p>{address.phone}</p>
      <div className={styles.actions}>
        <PillButton variant="outline" icon="none" size="md" disabled={busy} onClick={() => edit(address)}>Düzenle</PillButton>
        {!address.isDefault && <PillButton variant="outline" icon="none" size="md" disabled={busy} onClick={() => void run(async () => { await getAdapter().setDefaultAddress(address.id); await refresh(); return "Varsayılan adres güncellendi."; })}>Varsayılan yap</PillButton>}
        <PillButton variant="quiet" icon="none" size="md" disabled={busy} onClick={() => setRemoving(address)}>Sil</PillButton>
      </div>
    </li>)}</ul>
    {editing && <div className={styles.addressForm}>
      <h3 tabIndex={-1} ref={formHeading}>{editing === "new" ? "Yeni adres" : "Adresi düzenle"}</h3>
      <AddressForm adapter={getAdapter()} key={editing === "new" ? "new" : editing.id} address={editing === "new" ? undefined : editing} onCancel={finish} onSave={async () => { await refresh(); finish(); }} />
    </div>}
    <Dialog open={removing !== null} onOpenChange={open => { if (!open && !busy) setRemoving(null); }}>
      <DialogContent role="alertdialog" className={styles.confirm} onCloseAutoFocus={event => { event.preventDefault(); heading.current?.focus(); }}>
        <DialogHeader><DialogTitle>Adres silinsin mi?</DialogTitle><DialogDescription>{removing?.title} adresi {demo ? "demo adres defterinizden" : "adres defterinizden"} silinecek.</DialogDescription></DialogHeader>
        <div className={styles.actions}>
          <PillButton variant="outline" icon="none" disabled={busy} onClick={() => setRemoving(null)}>Vazgeç</PillButton>
          <PillButton icon="none" disabled={busy} onClick={() => void run(async () => { if (!removing) return; await getAdapter().deleteAddress(removing.id); await refresh(); setRemoving(null); if (editing !== "new" && editing?.id === removing.id) finish(); return "Adres silindi."; })}>Adresi sil</PillButton>
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

function AddressForm({ address, onSave, onCancel, adapter }: { adapter: AddressBookAdapter; address?: Address; onSave: () => Promise<void>; onCancel: () => void }) {
  const { busy, feedback, errors, run } = useMembershipAction();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const input = Object.fromEntries(addressFields.map(field => [field.name, String(data.get(field.name) ?? "")])) as AddressInput;
    void run(async () => { await adapter.saveAddress({ ...input, id: address?.id }); await onSave(); });
  }
  return <form noValidate onSubmit={submit} className={`${styles.form} mt-6`} aria-label="Adres bilgileri" aria-busy={busy}>
    <fieldset disabled={busy}>
      <div className={styles.addressGrid}>{addressFields.map(field => <Field key={field.name} {...field} id={`address-${field.name}`} required defaultValue={address?.[field.name] ?? ""} error={errors[field.name]} />)}</div>
      <Feedback {...feedback} />
      <div className={styles.actions}><PillButton type="submit" icon="check">{busy ? "Kaydediliyor…" : "Adresi kaydet"}</PillButton><PillButton variant="outline" icon="none" onClick={onCancel}>Vazgeç</PillButton></div>
    </fieldset>
  </form>;
}
