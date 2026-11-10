# Task 198: Ön yüz baştan — tasarım sistemi + ana sayfa + ürün sayfası (A/B)

## Tür
frontend (tasarım + uygulama)

## Amaç
Kullanıcı (10 Kasım 2026): "baştan yapacağız elindeki tüm bilgileri değerlendir" → kapsam: **ön yüz baştan**.
Üyelik, veritabanı, yönetim paneli mantığı, sepet/ödeme mantığı ve yayın düzeni **aynen kalır**.
Bu görev, yeni ön yüzün temelini kurar: yeni `DESIGN.md` + ana sayfa + ürün sayfası, gerçek kodla.
Aynı görev **Codex ve Kimi tarafından ayrı kopyalarda** yapılır; kullanıcı ikisini yan yana görüp birini seçer.
Seçilen yön Task 199 ile tüm sitelere yayılır.

## Okunacak kaynaklar (hepsini oku, sırayla)
1. `AFINA-KAYNAK/musteri-2026-11-10/BRIEF.md` — **müşterinin istediği bölüm sırası ve metinler (bağlayıcı)**.
2. `PRODUCT.md` — kullanıcılar, konumlandırma, ürün aileleri, iddia kuralları, marka taahhütleri.
3. `docs/PLAN.md` en üst bölüm (aktif plan) ve "Ret geçmişi" maddeleri aşağıda.
4. `docs/tasks/196-ozgun-gorunum.md` — "kopya gibi olmasın" kuralı ve yasaklı referans ifadeleri.
5. `~/Desktop/WB AI PROJELER ICIN/profesyonel-web-sitesi-skill-yeni-nesil.md` — yasak liste, Motion kuralları, 21st politikası, bitiş şartı (**bağlayıcı**).
6. `~/Desktop/WB AI PROJELER ICIN/DESIGN.md` — **yalnız BİÇİM örneği** (Apple stil referansı). İçeriğini/renklerini/koyu temasını ALMA; yeni `docs/DESIGN.md` bu dosyanın bölüm yapısında yazılacak (Tokens — Colors, Typography, Type Scale, Spacing & Shapes, Components, Do's and Don'ts, Surfaces, Elevation, Imagery, Layout, Agent Prompt Guide, Quick Start CSS + Tailwind v4 `@theme`).
7. `~/Desktop/WB AI PROJELER ICIN/BEST MY PROJECT .md` — boru hattı: Karar (ui-ux-pro-max) → Üret (21st MCP, Motion) → Denetle (impeccable critique/polish) → Sun.
8. Varsa `AFINA-KAYNAK/tasarim/uygulama-kontrol/197/RAPOR.md` (Kimi'nin canlı site cihaz analizi) — buradaki sorunları yeni tasarımda **tekrarlama**.
9. Mevcut kod yalnız referans: `components/landing/Customer*`, `components/catalog/*`, `components/site/*`, `app/page.tsx`, `app/urun/[slug]/page.tsx`. Veri kaynakları: `lib/catalog/*`, `lib/media/*.json`, `lib/blog/posts.ts`.

## Ret geçmişi (aynı hataya düşme)
- v1 "etiket" — hiç beğenilmedi. v2 "topraktan sofraya" koyu → "berbat". v11 beğenilmedi.
- Kaydırmaya bağlı sinematik sahne sistemi (v8–v12) → kullanıcı vazgeçti. **Kaydırmaya bağlı hareket, sabitleme (pin), snap YOK.**
- C klasik ana sayfa kabul edildi, sonra müşteri Köklü Zeytincilik yapısını istedi (192), ardından "kopyalamış gibi olmasın" (196). Kimi'nin 196 sonucu yayında ama kullanıcı baştan istiyor.
- Ortak ders: şablon/kalıp görünüm, her bölümde aynı başlık kalıbı, eşit kart dizileri, düşük kalite hissi reddediliyor. Kullanıcı **profesyonel, markaya özgü, telefonda kusursuz** site istiyor.

## Bağlayıcı kurallar
- **İçerik ve sıra BRIEF'teki gibi** (ana sayfa): hero video → 4 kutu (Zeytinyağı / Zeytin "Ürünleri İnceleyin", Tesisimiz / Bayilik "Hakkında Bilgi Alın") → ürün ızgarası + "Tüm Ürünler" → Hikayemiz ("Nesillerin Emeği, Toprağın Bereketi", ufak animasyon) + Hakkımızda düğmesi + 3'lü ikon → Öne Çıkan Ürünler (sahte indirim yok) → 3'lü banner (Tesis, Her Tanede Aynı Özen, Zeytinyağı; ufak animasyon) → Bereketin Hasat Vakti (foto sağda; Elle Hasat, Doğal Dinlendirme, Özenli Paketleme, %100 Doğal ve Katkısız; "Hikayemizi Keşfet" → /hakkimizda) → Toptan Satış + Bayilik Başvurusu düz zeminde iki kutu → blog (4 yazı, çalışan) → alt bilgi.
  Müşteri yorumları, rakamlı istatistik, YouTube/kısa video, 2'li banner YOK. Kayan şerit Hakkımızda sayfasında (Task 199).
- "%100 Doğal ve Katkısız" müşterinin açık isteğidir, yalnız o maddede kalır; başka yere yeni iddia (sertifika, rakam, ödül, sağlık) ekleme.
- **Açık ton.** Marka: zeytin yeşili `#243A29`, fildişi `#F5F1E7`, şampanya altını `#D4B483` (yardımcı tonları sen türet, AA karşıtlık). Yazı tipleri kullanıcının seçimi **Fraunces (başlık) + Figtree (gövde)**; başka font önerirsen DESIGN.md'de gerekçeyle ayrı seçenek olarak yaz, uygulamada Fraunces+Figtree kullan.
- Köklü Zeytincilik'in görünümünü, ikonlarını, metin kalıplarını alma (196 yasaklı ifade listesi geçerli).
- Görseller: yalnız mevcut onaylı görseller (`lib/media/*`, `public/images/customer-home`, `public/videos/customer-home`). Yeni görsel üretme. Eksik müşteri görseli ("Nesillerin Emeği" yazısız, zeytinyağı paylaşımı) için mevcut onaylı fotoğrafı yer tutucu kullan ve DESIGN.md'de not düş.
- Hareket (Motion, `motion/react`): yalnız transform + opacity; açılışta tek giriş sekansı; `whileInView` `once: true`; kullanıcı eylemine yanıt (hover/tap/açılma); `useReducedMotion` → kapalı; CLS < 0.05.
- Standart bileşenler için **21st MCP** search + get_component; marka tokenlarına uyarla, birebir yapıştırma. 21st aracı yoksa notta belirt.
- Mobil öncelik: 320–430 px telefonda yana kayma yok, dokunma hedefi ≥ 44×44, yazı ≥ 12 px (gövde ≥ 16 px), düğme etiketleri kırılmaz/kesilmez.
- Sepete ekle, teklife ekle, ürün verisi, sayfa adresleri, `/api/*`, `lib/auth`, `lib/db`, `lib/cart`, `lib/checkout`, `app/admin` **değişmez**.

## Kullanılacak araçlar (fiilen yükle)
- Karar: `ui-ux-pro-max` (`--design-system`, ürün türü: premium yöresel gıda e-ticaret, açık ton), `frontend-design` (plan → "genel/kalıp mı?" öz incelemesi → revize), `better-typography`, `better-colors`, `better-layout`.
- Üret: 21st MCP, `motion-framer`, `shadcn-ui` (yalnız form/diyalog altyapısı).
- Denetle: `impeccable` critique + polish (kuruluysa), yoksa `audit-ai-design-slop` + `avoid-ai-ui-cliches`; `responsiveness-check`.
- Codex: alt ajanlar (multi_agent) kullanılabilir: (a) tasarım sistemi, (b) ana sayfa, (c) ürün sayfası, (d) test/ekran görüntüsü.

## Adımlar
1. **Tasarım planı** `output/task198-<ajan>/PLAN.md`: 4–6 renk, yazı ölçeği, yerleşim fikri (masaüstü + telefon ASCII taslak), tek "imza öğe", hareket kararları. Ardından öz inceleme: hangi kısım her zeytin sitesinde olur? Değiştir, neyi neden değiştirdiğini yaz.
2. **`docs/DESIGN.md`** baştan yaz (referans dosyanın bölüm yapısında; eski içerik `docs/DESIGN-v12-hasat.md` adıyla saklanır). Agent Prompt Guide bölümünde Task 199'un tüm sayfalarda kullanacağı hazır tarifler olsun.
3. Tokenları `app/globals.css` (`@theme`) içine kur; eski çakışan token/renk tanımlarını temizle.
4. **Yeni üst menü + alt bilgi + ana sayfa + `/urun/[slug]`** sıfırdan (yeni bileşen klasörü: `components/storefront/`). Eski ana sayfa bileşenleri bu görevde silinmez (199'da temizlenir).
5. Ekran görüntüleri `output/task198-<ajan>/ekran/`: ana sayfa ve bir ürün sayfası; 390×844 (WebKit), 768×1024, 1440×900, 1920×1080; tam sayfa + ilk ekran; azaltılmış hareket 390.
6. impeccable critique → bulunanları düzelt → polish. Sonuçları `output/task198-<ajan>/DENETIM.md`.
7. Bitiş şartı kanıtı (`output/task198-<ajan>/KANIT.md`): renk + font + 8px sistemi + her hareket kararı (neye, neden, hangi değer) + 21st'ten alınan bileşenler + yasak liste kontrolü + BRIEF sıra kontrolü.

## Kabul kriterleri
- [ ] `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, `git diff --check` PASS (eski ana sayfaya bağlı birim testleri yeni yapıya göre güncellenir; BRIEF sıra/metin testleri korunur ve geçer).
- [ ] Ana sayfa ve ürün sayfası 320, 390, 768, 1024, 1440, 1920 genişlikte yatay taşma 0, konsol hatası 0, kırık görsel 0 (Playwright, repo içi tarayıcılar).
- [ ] Hero video masaüstünde 1920, telefonda 720 sürümüyle oynar; azaltılmış harekette poster.
- [ ] Yasaklı referans ifadeleri yok (196 listesi), yeni iddia yok.
- [ ] `docs/DESIGN.md` referans biçiminde, `output/task198-<ajan>/{PLAN,DENETIM,KANIT}.md` ve ekran görüntüleri var.

## Yapılmaması gerekenler
- Push, yayın, Vercel, canlı DB, ortam değişkeni, `.env*` dosyaları yok. `node_modules` ve `.next` SİLME. `AFINA-KAYNAK` ve `output/` git'e eklenmez (`git add -f` yasak).
- Backend/auth/ödeme/sepet mantığına dokunma; yeni paket ekleme (gerekirse gerekçeyle Coder Notu'na yaz, ekleme).
- Görev dışı sayfaları (blog, hakkımızda, toptan, hesap, sepet, ödeme, admin) bu görevde yeniden yapma — 199'a ait.
- Tek kayıt (commit), mesaj: `feat: 198 yeni ön yüz temeli (<ajan>)`.

## Durum: BEKLİYOR
