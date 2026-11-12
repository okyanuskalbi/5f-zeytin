# Task 205: Tasarım dili v3 — ürün, katalog, sepet, ödeme

> Sözleşme: `docs/DESIGN.md` (v3) + `docs/MASTER-PROMPT.md` (v2.0). Parçalar: `docs/tasks/204-…` → "Arayüzler" (`PillButton`, `Tag`, `Stamp`, `Medallion`, `SectionHeading`, `OliveBranch`). Yeni düğme/kart sınıfı yazılmaz.

## Tür
frontend

## Bağımlılık
204 TAMAMLANDI ve **K5: kullanıcı ana sayfayı onayladı**. K5'te gelen düzeltmeler önce `204` dosyasına `## Düzeltme 204-x` olarak işlenir.

## Amaç
Satın alma yolundaki sayfaları v3 diline geçirmek: `/urun/[slug]`, `/urunler`, `/urunler/[kategori]`, sepet çekmecesi, `/sepet`, `/odeme`.

## Genel kısıtlar
204 "Genel kısıtlar" aynen. Ek: sepet/ödeme **mantığı**, fiyat hesabı, kupon ve PayTR alanı değişmez; "Ödemeye geç" pasifliği ve açıklama cümlesi (199) korunur.

## Dosyalar
- Değişir: `components/storefront/ProductDetail.tsx` + `.module.css`, `components/storefront/catalog/*`, `components/storefront/cart/*`, `components/cart/CartPresentation.tsx` (yalnız görünüm), `components/checkout/*` (yalnız görünüm), ilgili `app/**/page.tsx` sarmalayıcıları.
- Yeni test: `tests/unit/storefront-shop-205.test.tsx`; `scripts/qa-design-v3.mjs` bu rotalarla genişler.

## Adımlar (her biri: test yaz → FAIL gör → uygula → PASS)
1. **Ürün ayrıntısı** (DESIGN.md "Ürün ayrıntısı"): test → kategori `Tag`, boy seçimi hap anahtar (`role="radiogroup"`, seçili boy `aria-checked`), `primary` "Sepete ekle" + `outline` "Teklife ekle", adet seçici hap; 390×844 ve 320×568'de "Sepete ekle" alt kenarı görünüm alanı içinde (198-3 ölçümü korunur); benzer ürünler 204 kartıyla.
2. **Katalog + kategori** (Agent Prompt Guide "Katalog"): test → kategori hapları (etkin olan `aria-current="page"`), ızgara masaüstü 3 / tablet 2 / telefon 2 kompakt (`size="md"`), sıralama alanı köşe 12, boş durum metni + `outline` "Tüm Ürünler".
3. **Sepet çekmecesi + `/sepet`**: test → paneller kâğıt, köşe 24; özet paneli **koyu değil** kâğıt; toplam Cormorant 28 px; satır silme/adet düğmeleri ≥ 44; "Alışverişe devam et" `quiet`; boş sepet `primary` "Ürünleri İnceleyin"; pasif "Ödemeye geç" `disabled` + açıklama + `outline` "Teklif İste".
4. **`/odeme`**: test → başlık `SectionHeading as="h1"`, hazırlık mesajı kâğıt panelde, ödeme logoları kâğıt hap içinde, geri dönüş `outline`.
5. **Kapılar:** lint, typecheck, test, build, `git diff --check`; `scripts/qa-design-v3.mjs` bu 6 rota + 3 kategori + 5 ürün × 320, 390 (WebKit), 768, 1440: 204 Adım 9 ölçümleri (hap, font, taşma, çakışma, axe, CLS) + akış: boy değiştir → adet 2 → sepete ekle → çekmece → `/sepet` → `/odeme`.

## Denetimde özellikle bakılacaklar
1. Uzun ürün adı (2 satır) kartta ve ayrıntıda düğmeyi itmez/taşırmaz. 2. Stok 0 ürününde sayfa ve kart. 3. Sepette 6 farklı ürün + 99 adet: özet taşmaz. 4. 320 px'te adet seçici + düğme yan yana sığmazsa alt alta. 5. Klavye: boy anahtarı ok tuşlarıyla, çekmece Esc + odak dönüşü.

## Kabul
Adım 5 PASS; `output/task205/{KANIT.md,ekran/}`; `git diff <204 kaydı> --name-only -- lib/auth lib/db lib/cart lib/checkout lib/payments lib/orders app/api` boş; §14.1 (v2.0) 12 madde PASS. Tek kayıt: `feat: 205 tasarım dili v3 ürün katalog sepet`. Son satır: `205 BİTTİ`.

## Durum: TAMAMLANDI
