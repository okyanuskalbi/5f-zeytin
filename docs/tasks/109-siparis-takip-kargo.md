# Task 109: Sipariş takip ve kargo durumu

## Tür
frontend

## Amaç
Herkese açık sipariş takip (sipariş no + e-posta), adım adım teslimat zaman çizelgesi, kargo firması ve takip numarası.

## Bağlam
ZEYTİN v2 (`docs/DESIGN.md` "Topraktan sofraya" — krem 'sofra' dili, Fraunces/Figtree, ev kuralları). Kullanıcı (20 Eki): "21st.dev … MEMBERS ÜYELİK VS SİPARİŞ TAKİP KARGO VS ONLARIDA" + "GMAİL İLE GİRİŞ". **Bu görev yalnız arayüz + akış katmanıdır:** gerçek kimlik doğrulama, veritabanı ve kargo API'si YOK. Veriler bir **adaptör arayüzünün** arkasında (`lib/<alan>/adapter.ts`: `mock` uygulaması dev/test için; gerçek uygulama 040–050/069–072 ONAY GEREKLİ görevlerinde Supabase ile). Production build'de mock adaptör yalnız `NEXT_PUBLIC_DEMO=1` iken; aksi hâlde sayfalar "Yakında" durumunu gösterir (sahte başarı yok).

## Kullanılacak araçlar
- ECC skill: frontend-patterns, accessibility, security-review (form güvenliği), verification-loop; skill `motion-framer`, `ui-ux-pro-max`
- 21st MCP: Delivery progress 37491 (ibrandify), Order Status Tracker 8205 (ravikatiyar162), Order tracking 641 (kodu `mcp__21st__get_component` ile al, v2 tokenlarına uyarla; ikonlu kart ızgarası ev kuralı gereği YOK)

## Adımlar
1. `/siparis-takip`: form (sipariş no + e-posta/telefon son 4) → sonuç; giriş yapmış kullanıcıda doğrudan siparişlerinden.
2. Zaman çizelgesi (37491 uyarlaması): Sipariş alındı → Ödeme onaylandı → Hazırlanıyor → Kargoya verildi → Dağıtımda → Teslim edildi; her adımda tarih/saat; aktif adım vurgulu (Framer Motion çizgi dolumu); iptal/iade durumları.
3. Kargo kartı: firma adı, takip no (kopyala düğmesi), 'Kargo firmasında takip et' dış linki (firma kararı gelene kadar genel), tahmini teslim (veri varsa).
4. Sipariş özeti (8205 uyarlaması): ürünler, adet, tutar, teslimat adresi (kısmi maskeli).
5. Adaptör `lib/orders/tracking-adapter.ts` (mock: 3 örnek sipariş farklı durumlarda, yalnız demo). Gerçek: 044/069–072 (ONAY GEREKLİ).
6. Güvenlik: no+eşleşme yoksa genel 'bulunamadı' (bilgi sızdırmaz), deneme sınırı (rate limit arayüzü).

## Kabul kriterleri
- [ ] e2e (mock): 3 durumun doğru zaman çizelgesi, bulunamadı mesajı, kopyala, maskeleme
- [ ] `lint.mjs app components` 0 FAIL; production `inspect.mjs` (iç sayfa istisnasıyla) FAIL 0; 1440/390 + iPhone 14 ekran görüntüleri `test-results/109/`
- [ ] lint/typecheck/build; e2e (mock adaptörle) + reduced-motion

## Durum: BEKLİYOR
