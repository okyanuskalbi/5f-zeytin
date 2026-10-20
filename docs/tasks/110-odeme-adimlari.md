# Task 110: Ödeme adımları: adres → kargo → PayTR

## Tür
frontend

## Amaç
Çok adımlı ödeme: iletişim/adres, teslimat seçimi, sipariş özeti + kupon, PayTR iframe adımı.

## Bağlam
ZEYTİN v2 (`docs/DESIGN.md` "Topraktan sofraya" — krem 'sofra' dili, Fraunces/Figtree, ev kuralları). Kullanıcı (20 Eki): "21st.dev … MEMBERS ÜYELİK VS SİPARİŞ TAKİP KARGO VS ONLARIDA" + "GMAİL İLE GİRİŞ". **Bu görev yalnız arayüz + akış katmanıdır:** gerçek kimlik doğrulama, veritabanı ve kargo API'si YOK. Veriler bir **adaptör arayüzünün** arkasında (`lib/<alan>/adapter.ts`: `mock` uygulaması dev/test için; gerçek uygulama 040–050/069–072 ONAY GEREKLİ görevlerinde Supabase ile). Production build'de mock adaptör yalnız `NEXT_PUBLIC_DEMO=1` iken; aksi hâlde sayfalar "Yakında" durumunu gösterir (sahte başarı yok).

## Kullanılacak araçlar
- ECC skill: frontend-patterns, accessibility, security-review (form güvenliği), verification-loop; skill `motion-framer`, `ui-ux-pro-max`
- 21st MCP: Checkout Block 8339 (preetsuthar17), Shipping Address Fieldset 26538 (shadcnspace), Checkout Form 7053 (kodu `mcp__21st__get_component` ile al, v2 tokenlarına uyarla; ikonlu kart ızgarası ev kuralı gereği YOK)

## Adımlar
1. `/odeme`: adım çubuğu (1 Bilgiler · 2 Teslimat · 3 Ödeme), mobilde tek kolon; sağda (masaüstü) yapışkan sipariş özeti + upsell yok (sepette kaldı) + kupon alanı (054 gelene kadar devre dışı 'yakında').
2. Bilgiler: misafir veya 'Google ile hızlı giriş'; ad, e-posta, telefon (TR maske), adres (il/ilçe seçimi Türkiye listesi, mahalle, açık adres, posta kodu — 26538 uyarlaması); fatura bilgisi (bireysel/kurumsal: VKN/vergi dairesi).
3. Teslimat: kargo seçeneği(leri) (firma kararı gelene kadar 'Standart kargo — ücret ödeme adımında' temsili, fiyat uydurma YOK).
4. Ödeme: mesafeli satış + ön bilgilendirme onay kutuları (073 taslak linkleri), PayTR iframe (001b bileşeni; anahtarsız uyarı modu); 'Siparişi tamamla' yalnız PayTR akışında.
5. Durum yalnız URL'de değil sunucu tarafında doğrulanır (049); sonuç sayfaları 050.

## Kabul kriterleri
- [ ] e2e: adım ileri/geri, doğrulama, il/ilçe, fatura türü, onay kutuları zorunlu, PayTR adımı anahtarsız uyarı; mobil
- [ ] `lint.mjs app components` 0 FAIL; production `inspect.mjs` (iç sayfa istisnasıyla) FAIL 0; 1440/390 + iPhone 14 ekran görüntüleri `test-results/110/`
- [ ] lint/typecheck/build; e2e (mock adaptörle) + reduced-motion

## Durum: BEKLİYOR
