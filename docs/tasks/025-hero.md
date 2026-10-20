# Task 025: Hero bileşeni

## Tür
frontend

## Amaç
Hero içeriğini ve duyarlı yerleşimini kur.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 024 (shell). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: frontend-patterns, frontend-design-direction
- 21st MCP: evet — premium hero
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `components/landing/Hero.tsx` (oluştur / düzenle)
- `app/page.tsx` (oluştur / düzenle)
- `tests/e2e/hero.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. Ana slogan “Kökü toprakta. Yeri sofrada.”, alt “Toprağın sunduğu lezzet, Afina’nın özeniyle.” birebir. “Ürünlerimizi Keşfedin” → ≤6 ürünlü perakende vitrin; “Toptan Satış İçin İletişime Geçin” → #toptan-iletisim. Resmi bölüm 04, optimize zeytin logosu; onaylı sahne görseli yoksa etiketli placeholder. Bu görevde scroll animasyonu ekleme.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/hero.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

- [ ] `npm run test:e2e -- tests/e2e/hero.spec.ts` iki sloganı ve perakende/toptan CTA metin-hedeflerini resmi kaynakla birebir doğrular.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Coder Notu

### Başlangıç ve TDD / RED — 20 Ekim 2026

- `main`, temiz çalışma ağacı; bağımlı 024 (024-a dahil) `TAMAMLANDI`. Resmi logo setinin kullanıcı onayı kayıtlıdır; 14 marka varlığı `approved` / `runtime: true`. Onaylı hero sahnesi yoktur; adım 2'de açıkça izin verilen etiketli placeholder kullanılacaktır. Görsel üretimi veya yeni onay kararı bu görevin kapsamında değildir.
- `frontend-patterns`, `frontend-design-direction`, `tdd-workflow` okundu. Yerel Next.js 16.4.2 sayfa / Server Component / image kılavuzları incelendi. 21st MCP `search` ve `get_component` ile [Editorial Hero](https://21st.dev/@felipemenezes098/components/hero-05) (19075) alındı; sol marka/hikâye, sağ slogan/CTA ve altta geniş medya alanı marka tokenlarına uyarlanacak. Kaynağın animasyon ve ek paketleri alınmayacak. `npm_config_cache="$PWD/.cache/npm" npx shadcn@latest docs button` → **exit 0**; mevcut özelleştirilmiş Button kullanılacak. Ek skill/bağımlılık kurulmadı.
- Tasarım sözleşmesi: perakende ve toptan ziyaretçi ilk ekranda markayı ve resmi iki sloganı okur; öncelikli eylem ürünler, ikinci eylem toptan taleptir. Fildişi yüzey, zeytin rengi metin/ana CTA, şampanya altını detaylar; serif slogan ve sakin editoryal yerleşim. Hedefler: **320×900, 390×900, 768×900, 1440×900**. Referans: resmi bölüm 04, mevcut shell/tokenlar ve 21st Editorial Hero.
- Kapsam sınırı: 030 ürün kartları ve 081 toptan formu henüz uygulanmadı. `app/page.tsx` içinde hero CTA'larına gerçek hash/odak hedefi sağlayan açık boş durumlar kurulacak; ürün, fiyat, stok veya gönderim başarısı uydurulmayacak. En fazla 6 ürün sözleşmesi korunur; bu görev gerçek katalog/form uygulamaz. Optimize zeytin logosu mevcut onaylı navbar'da korunur; hero içinde ikinci logo kopyası eklenmez.
- Yolculuklar/test eşlemesi (`tests/e2e/hero.spec.ts`): resmi slogan/CTA eşitliği ve hedefe varış; onaylı logo + sahne placeholder'ı; logo isteği hatasında kullanılabilir içerik/CTA; normal/reduced-motion klavye/odak; JavaScript olmadan yerel bağlantılar. Statik hero için async yükleme/submit/izin durumu yoktur; boş/eksik sahne ve logo hata durumları tarayıcıda sınanır.
- `npm run build` → **exit 0**, mevcut checkout'un production çıktısı `next start -p 3025` ile başlatıldı. 3004'teki mevcut süreç korundu. `PLAYWRIGHT_BASE_URL=http://localhost:3025 PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright" npm run test:e2e -- tests/e2e/hero.spec.ts --project=chromium-320 --grep 'hero matches' --output=.cache/task-025/red-results` → **exit 1**: `getByRole('region', { name: 'Afina Zeytin' })` bulunamadı. Test derlenip çalıştı, eksik hero davranışı doğrulandı. İlk koşumdaki macOS `MachPortRendezvousServer: Permission denied` ortam hatası süreç izniyle giderildi; geçerli RED ikinci koşumdaki eksik uygulamadır. Rapor/trace/ekran `.cache/task-025/red-results/` altında yereldir.

## Durum: BEKLİYOR
