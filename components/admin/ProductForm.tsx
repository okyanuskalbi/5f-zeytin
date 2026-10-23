"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { parseProductInput, type AdminProduct, type ProductInput } from "@/lib/contracts/admin-products";
import styles from "./Products.module.css";

export function ProductForm({ product, options, activeCount, busy, onSave, onCancel }: {
  product?: AdminProduct; options: { id: string; name: string }[]; activeCount: number; busy: boolean;
  onSave: (input: ProductInput) => Promise<void>; onCancel: () => void;
}) {
  const id = useId();
  const firstInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [upsellIds, setUpsellIds] = useState(product?.upsellIds ?? []);
  const [showCategoryLabel, setShowCategoryLabel] = useState(product?.showCategoryLabel ?? true);
  useEffect(() => { firstInput.current?.focus(); }, []);

  return <section className={styles.panel} aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`}>{product ? "Ürünü düzenle" : "Yeni ürün"}</h2>
    <form onSubmit={async event => {
      event.preventDefault();
      const fields = new FormData(event.currentTarget);
      const price = String(fields.get("price")).replace(",", ".");
      // Parse decimal digits directly: a display price must not lose a kuruş.
      const match = /^(\d{1,8})(?:\.(\d{1,2}))?$/.exec(price);
      const priceKurus = match ? Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0")) : NaN;
      const input = parseProductInput({ name: fields.get("name"), category: fields.get("category"), weight: fields.get("weight"),
        categoryLabel: fields.get("categoryLabel"), showCategoryLabel,
        priceKurus, stock: fields.get("stock") === "" ? NaN : Number(fields.get("stock")),
        isActive: fields.get("active") === "on", upsellIds });
      if (!input) { setError("Alanları kontrol edin. Kategori etiketi en fazla 40 karakter düz metin, fiyat en fazla iki ondalık, stok sıfır veya pozitif tam sayı olmalıdır."); return; }
      setError("");
      await onSave(input);
    }}>
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <fieldset disabled={busy} className={styles.fields}>
        <legend className="sr-only">Ürün bilgileri</legend>
        <div><label htmlFor={`${id}-name`}>Ürün adı</label><Input ref={firstInput} id={`${id}-name`} name="name" required maxLength={160} defaultValue={product?.name ?? ""} /></div>
        <div><label htmlFor={`${id}-category`}>Kategori</label><select id={`${id}-category`} name="category" required defaultValue={product?.category ?? ""}>
          <option value="" disabled>Kategori seçin</option><option value="sofralik-zeytin">Sofralık zeytin</option><option value="salamura-zeytin">Salamura zeytin</option><option value="zeytinyagi">Zeytinyağı</option>
        </select></div>
        <div><label htmlFor={`${id}-category-label`}>Kategori etiketi</label>
          <Input id={`${id}-category-label`} name="categoryLabel" maxLength={40} defaultValue={product?.categoryLabel ?? ""}
            aria-describedby={`${id}-category-help`} />
          <p id={`${id}-category-help`} className={styles.help}>Boş bırakırsanız kategorinin varsayılan adı görünür. En fazla 40 karakter, düz metin.</p>
        </div>
        <div><span id={`${id}-visibility-label`} className={styles.controlLabel}>Etiketi göster</span>
          <ToggleGroup id={`${id}-visibility`} type="single" variant="outline" spacing={2}
            aria-labelledby={`${id}-visibility-label`} className={styles.categoryVisibility} disabled={busy}
            value={showCategoryLabel ? "show" : "hide"}
            onValueChange={value => { if (value) setShowCategoryLabel(value === "show"); }}>
            <ToggleGroupItem value="show">Göster</ToggleGroupItem>
            <ToggleGroupItem value="hide">Gizle</ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div><label htmlFor={`${id}-weight`}>Ambalaj / ağırlık</label><Input id={`${id}-weight`} name="weight" required maxLength={80} defaultValue={product?.weight ?? ""} /></div>
        <div><label htmlFor={`${id}-price`}>Fiyat (TL)</label><Input id={`${id}-price`} name="price" type="text" inputMode="decimal" required defaultValue={product ? (product.priceKurus / 100).toFixed(2) : ""} /></div>
        <div><label htmlFor={`${id}-stock`}>Stok</label><Input id={`${id}-stock`} name="stock" type="number" required min={0} max={2147483647} step={1} defaultValue={product?.stock ?? 0} /></div>
        <label className={styles.check}><input name="active" type="checkbox" defaultChecked={product?.isActive ?? false} disabled={activeCount >= 6 && !product?.isActive} />Yayında</label>
        {activeCount >= 6 && !product?.isActive && <p>6 aktif ürün sınırı dolu. Yeni bir ürünü yayınlamak için önce bir ürünü yayından kaldırın.</p>}
        <fieldset className={styles.upsells}><legend>Birlikte önerilecek ürünler (upsell)</legend>
          <p>Yalnız yayındaki ürünler seçilebilir.</p>
          {options.filter(option => option.id !== product?.id).map(option => <label key={option.id} className={styles.check}>
            <input type="checkbox" checked={upsellIds.includes(option.id)} onChange={event => setUpsellIds(values => event.target.checked ? [...values, option.id] : values.filter(value => value !== option.id))} />{option.name}
          </label>)}
          {options.every(option => option.id === product?.id) && <p>Önerilebilecek başka aktif ürün yok.</p>}
        </fieldset>
        <div className={styles.actions}><Button type="submit">{busy ? "Kaydediliyor…" : "Kaydet"}</Button><Button type="button" variant="outline" onClick={onCancel}>Vazgeç</Button></div>
      </fieldset>
    </form>
  </section>;
}
