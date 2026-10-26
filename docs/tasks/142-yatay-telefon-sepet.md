> ONAY VERİLDİ (kullanıcı, 26 Eki 2026): "bunları vs yaptır codex'e" (yatay telefonda sepet düzeltmesi).

# Task 142: Yatay telefonda üst çubuk + yapışkan sepet çubuğu yer kaplıyor

## Tür
frontend (yalnız CSS, gerekirse küçük JSX)

## Amaç
iPhone 15 yatay (852×393) gibi kısa ekranlarda üst başlık (~100px) ve alttaki yapışkan "ürün · fiyat · Sepete ekle" çubuğu (~100px) birlikte ekranın yarısını kaplıyor; ürün kartı/sayfa içeriği ~130px'lik şeride sıkışıyor. Kısa ekranlarda ikisini incelt.

## Bağlam
- Kanıt: Claude cihaz matrisi `mob-iphone15-land-webkit` (sepete ekle sonrası ekran).
- Dosyalar: `components/site/Navbar.module.css` (`.bar`), yapışkan sepet çubuğu bileşeni ve CSS'i (Task 136'da auth/yasal sayfalarda gizlenen çubuk; `grep -rn "sticky" components` ile bul).
- Task 140'ın mobil pill/opak başlık kuralları korunur.

## Kullanılacak araçlar
- ECC/skill: `ui-ux-pro-max`, `better-layout`, `frontend-design`, `ai-tool-prompts` (son kontrol). Coder Notu'na kısa skill tablosu.
- 21st MCP: hayır.

## Adımlar
1. `@media (orientation: landscape) and (max-height: 500px)` için:
   - Üst başlık: dikey dolgu küçülsün, logo yüksekliği ≤ 40px; toplam başlık yüksekliği ≤ 56px. Sepet/Menü dokunma hedefi ≥ 44px kalsın.
   - Yapışkan sepet çubuğu: tek satır (ürün adı · fiyat · düğme yan yana), toplam yükseklik ≤ 64px, `env(safe-area-inset-*)` sol/sağ/alt dolgusu korunur.
2. Dikey telefonda, tablette ve masaüstünde hiçbir ölçü değişmesin.

## Kabul kriterleri
- [ ] Kaynak/kabul testi: yukarıdaki medya sorgusu ve değerler mevcut; dikey kurallar aynı (diff yalnız yeni medya bloğu + gerekiyorsa sınıf).
- [ ] `npm test`, lint, typecheck, build, `check:assets` yeşil.
- Tarayıcı ekran testi Claude'da (WebKit iPhone 15 yatay + SE dikey regresyon).

## Yapılmaması gerekenler
- Hero, renk token'ları, metin ve görsellere dokunma.
- Yapışkan çubuğu yatayda tamamen kaldırma (sepete ekleme yolu kalmalı).

## Coder Notu

| Skill | Uygulama |
| --- | --- |
| `ui-ux-pro-max` | Yerel UX aramasıyla dokunma hedefleri ve kısa ekran kısıtları incelendi. |
| `better-layout` | Ürün adı, fiyat ve eylem tek satıra alındı; sol/sağ/alt güvenli alanlar korundu. |
| `frontend-design` | Mevcut marka, Task 140 pill/opak başlık stilleri ve diğer ekran ölçüleri korundu. |
| `ai-tool-prompts` | Son kontrolde kapsam, hizalama, tokenlar ve erişilebilir geri bildirim denetlendi. |
| `tdd-workflow` | Komutla kaynak kabul denetiminde RED → GREEN doğrulandı. |

- Runtime değişikliği yalnız `Navbar.module.css` ve `MobileBuyBar.module.css` sonuna eklenen medya bloklarıdır. JSX, hero, metinler, renk tokenları ve görseller değişmedi. Task açıkça istemediği için 21st MCP kullanılmadı; bağımlılık eklenmedi.
- Medya koşulu `(orientation: landscape) and (max-height: 500px) and (max-width: 900px)`; ek genişlik sınırı mevcut mobil başlık/satın alma çubuğu sınırıyla aynıdır ve masaüstünü korur. Önceden mevcut CSS'nin tamamının aynen kaldığı PostCSS ile karşılaştırıldı.
- Üst başlık kaynak hesabı: 44 px satır + 4/4 px dikey dolgu + 1 px kenarlık = **53 px** (yatay telefonda üst güvenli alan 0). Logo 32 px, Sepet/Menü hedefleri en az 44 px olarak korundu.
- Alttaki ilgili bileşen `MobileBuyBar` olarak doğrulandı. Ürün adı/fiyat yan yana; CTA 42 px, alt dolgu `max(4px, env(safe-area-inset-bottom, 0px))`, sol/sağ dolgular kendi güvenli alanlarına göre hesaplanır. 21 px yatay alt güvenli alan + 42 px CTA + 1 px kenarlık = **64 px**. Stok hatası aynı satırda, en fazla 42 px yüksekliğinde kaydırılabilir kalır; başarı bildiriminin mevcut canlı bölgesi korunur.
- `node --input-type=module` + PostCSS kaynak kabul denetimi: başlangıçta **3 FAIL / 1 PASS (RED)**, düzeltme sonrası **4/4 PASS (GREEN)**. Denetim medya kapsamını, başlık/logo/hedef ölçülerini, tek satır ve güvenli alan yükseklik hesabını, eski CSS'nin aynen korunmasını kapsar; gerçek tarayıcı ölçümü değildir.
- `npm test -- --maxWorkers=2`: **66 dosya, 1060/1060 PASS**; mevcut başlık, satın alma çubuğu, sepete ekleme ve stok koruması testleri dahil. Testler değiştirilmedi veya zayıflatılmadı.
- `npm run lint`, `npm run typecheck`, `npm run build`, `npm run check:assets` ve `git diff --check`: **PASS**. Varlık kontrolü: 18 kayıt, 112 v3 çıktı, 20 hero katmanı. Build mevcut eksik/geçersiz `NEXT_PUBLIC_SUPABASE_URL` için CSP bilgi mesajı verdi; bu görevde bağlantı/CSP ayarları değiştirilmedi.
- Tarayıcı ekran testi **Claude doğrulayacak**: WebKit iPhone 15 yatay 852×393'te gerçek başlık ≤56 px, çubuk ≤64 px, çentik/alt güvenli alan, sepete ekleme sonrası ve stok hatasında erişim; SE dikey, tablet ve masaüstü regresyonu. AGENTS.md gereği Playwright, Lighthouse, inspect ve ekran görüntüsü çalıştırılmadı.
- Uygulanamayan kod adımı yok; tarayıcı kabulü AGENTS.md uyarınca Claude'a bırakıldı.

## Durum: TAMAMLANDI
