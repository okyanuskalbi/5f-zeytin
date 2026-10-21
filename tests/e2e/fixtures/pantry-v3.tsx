import { createRoot } from "react-dom/client";
import { Pantry } from "../../../components/landing/Pantry";
import { CartProvider } from "../../../components/cart/CartProvider";
import { getProductFamilies } from "../../../lib/catalog/static-products";
import type { ProductFamily } from "../../../types/catalog";
import "../../../app/globals.css";

// Bundled and intercepted by the evidence script only; no production test route.
const original = await getProductFamilies();
const mode = new URLSearchParams(location.search).get("data") ?? "four";
const six = original.flatMap(family => family.variants.map(variant => ({ ...family, id: variant.id, variants: [variant] })));
const data: Record<string, readonly ProductFamily[]> = {
  four: original, five: six.slice(0, 5), six,
  long: original.map((family, index) => index ? family : { ...family, name: "Düziçi Geleneksel Doğal Kırma Yeşil Zeytin — Aile Boyu Kışlık Sofra Seçimi" }),
  single: [original[0]].map(family => ({ ...family, variants: [family.variants[0]] })),
  sold: original.map(family => ({ ...family, variants: family.variants.map(variant => ({ ...variant, stock: 0 })) })),
  empty: [],
};
const families = data[mode] ?? original;
const menuStyle = { position: "fixed", zIndex: 90, bottom: 8, left: "50%", transform: "translateX(-50%)", padding: 8, background: "#eee", color: "#222", fontFamily: "system-ui", fontSize: 14 } as const;
createRoot(document.getElementById("root")!).render(<CartProvider products={families.flatMap(family => family.variants)}>
  <main><Pantry families={families} /></main>
  <label style={menuStyle}>Test verisi <select aria-label="Test verisi" value={mode} onChange={event => { location.search = `?data=${event.target.value}`; }}>
    {Object.keys(data).map(key => <option key={key} value={key}>{key}</option>)}
  </select></label>
</CartProvider>);
