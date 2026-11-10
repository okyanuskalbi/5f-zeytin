# Task 199: Ön yüz baştan — tüm sayfalar + eski kodun temizliği

## Tür
frontend

## Bağımlılık
198 bitmiş ve kullanıcı A/B içinden birini seçmiş olmalı. Seçilen kayıt main'e alınır; bu görev o temelin üstünde çalışır.

## Amaç
198'deki yeni `docs/DESIGN.md` dilini sitenin kalan bütün ön yüzüne yaymak ve artık kullanılmayan eski ön yüz kodunu silmek.

## Sayfalar
`/urunler`, `/urunler/[kategori]`, `/hakkimizda` (fabrika görseli + klasik açıklama + kayan şerit: Zeytin – Zeytinyağı – Geleneksel Salamura – %100 Doğal – Katkısız), `/toptan-satis` (teklif formu, `?teklif=<id>` ön seçimi), `/bayilik`, `/blog`, `/blog/[slug]`, `/sepet` + sepet çekmecesi, `/odeme`, `/giris`, `/kayit`, `/hesabim` (+ adresler, bilgilerim, güvenlik, siparişler, sipariş detayı), `/siparis-takip`, `/iade`, `/kvkk`, `/mesafeli-satis`, 404 sayfası.

## Okunacaklar
`docs/DESIGN.md` (198), `docs/tasks/198-onyuz-yeniden-kurgu-tasarim.md` (bağlayıcı kurallar aynen geçerli), `AFINA-KAYNAK/musteri-2026-11-10/BRIEF.md`, `PRODUCT.md`, varsa `AFINA-KAYNAK/tasarim/uygulama-kontrol/197/RAPOR.md`.

## Kullanılacak araçlar
198 ile aynı (ui-ux-pro-max, frontend-design, 21st MCP, motion-framer, shadcn-ui, better-layout, impeccable/audit-ai-design-slop, responsiveness-check). Formlar: shadcn + projenin tokenları; şifre alanları göster/gizle düğmesi alan içinde.

## Adımlar
1. Sayfaları `components/storefront/` dilinde yeniden kur; iş mantığı (`lib/*`, `app/api/*`, form gönderim akışları, auth) aynen kalır.
2. Eski ön yüz kodunu sil: kullanılmayan `components/landing/*`, `components/ui/*` (ör. pendant-lamp-rail, liquid-glass-logo-reveal, credit-card-form-demo), eski sinematik görseller/videolar (`public/videos` içinde customer-home dışındakiler, `public/images` içinde artık başvurulmayanlar — silmeden önce `rg` ile başvuru olmadığını kanıtla, listeyi Coder Notu'na yaz). `_legacy/` dokunma.
3. Eski tarayıcı testlerini temizle: `tests/e2e/hero-performance.spec.ts` ve kaldırılan bileşenleri arayan testler silinir ya da yeni yapıya uyarlanır; her sayfa için yeni duman testi (açılır, taşma yok, konsol hatası yok, ana eylem görünür).
4. Ekran görüntüleri `output/task199/ekran/<sayfa>-<genişlik>.png` (390 WebKit, 768, 1440); impeccable critique + polish → `output/task199/DENETIM.md`.

## Kabul kriterleri
- [ ] lint, typecheck, test, build, `git diff --check` PASS.
- [ ] Tüm sayfalar 320/390/768/1024/1440/1920'de taşma 0, konsol hatası 0, kırık görsel 0; telefonda dokunma hedefi ≥ 44 px.
- [ ] Kaldırılan dosyaların listesi + "başvuru yok" kanıtı Coder Notu'nda.
- [ ] Sepete ekle → sepet → ödeme sayfası, teklife ekle → toptan formu, giriş/kayıt formları yerel test DB'si ile çalışır (gönderim testleri yalnız yerelde).

## Yapılmaması gerekenler
198 ile aynı (push/yayın/canlı DB/env/.env yok, `node_modules`/`.next` silme yok, AFINA-KAYNAK/output git dışı). Yönetim paneli bu görevde yok (Task 200).

## Durum: BEKLİYOR (198 seçimi bekleniyor)
