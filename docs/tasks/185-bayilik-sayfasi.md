# Task 185: Bayilik sayfası (`/bayilik`) — C tasarım diliyle

## Tür
frontend

## Amaç
Kullanıcı isteği (9 Kas 2026: "afinazeytin bayilik tasarımını da ayarla"): menüdeki "Bayilik" ve ana sayfadaki "Bayilik Başvurusu" düğmesi, C tasarım diliyle hazırlanmış bir bayilik sayfasına gider. Sayfa bayilik başvurusunu toplar.

## Bağlam
- 184 tamamlanmış olmalı (C menü, alt bilgi, renk/yazı tokenları, iş kartı fotoğrafları).
- Tasarım dili: `AFINA-KAYNAK/tasarim/klasik-anasayfa-c/masaustu.png`, `mobil.png`.
- Gönderim yöntemi, mevcut toptan teklif formuyla aynı: e-posta servisi henüz yok; form doğrulanmış içerikle `info@afina.com.tr` adresine **e-posta taslağı** açar. Otomatik gönderim / "başvurunuz alındı" iddiası yok.
- Mevcut aranabilir telefon (ülke kodu) ve il/ilçe bileşenleri yeniden kullanılır.

## Kullanılacak araçlar
- Kullanıcı isteğiyle fiilen yükle: `ui-ux-pro-max` (§1, §2, §5, §8 formlar), `frontend-design`, `better-layout`, `better-accessibility`, `responsiveness-check`.
- ECC skill: `frontend-patterns`, `tdd-workflow`.
- **Codex alt ajanları (multi_agent):** form/doğrulama, sayfa bölümleri ve testleri paralel yürütebilirsin.

## Sayfa yapısı
1. **Üst bant:** C hero diliyle, daha kısa (masaüstü ~55vh, telefonda içerik kadar). Fotoğraf: 184'teki zeytin dalı iş kartı fotoğrafı (ya da zeytinlik). "BAYİLİK", H1 "Bayimiz Olun", "AFİNA ZEYTİN'i bölgenizde birlikte büyütelim; bayilik için bize yazın.", düğmeler "Başvuru Formu" (`#basvuru`) ve "Ürünleri İncele" (`/#urunler`).
2. **Kimler başvurabilir (3 kart, ince altın simge):**
   - "Market ve şarküteriler" — "Rafında yöresel zeytin ve zeytinyağı bulundurmak isteyen işletmeler."
   - "Kuruyemiş ve yöresel ürün dükkânları" — "Ambalajlı zeytin ve zeytinyağı satan dükkânlar."
   - "Toptancı ve distribütörler" — "Bölgesindeki satış noktalarına ürün ulaştıran firmalar."
3. **Neden AFİNA ZEYTİN (yalnız gerçekler):** "Kendi tesisimizde hazırlanır" (Osmaniye Düziçi), "Ellek zeytini, geleneksel doğal kırma", "3 L teneke, 1 kg kavanoz ve zeytinyağı seçenekleri", "Koli bazında sipariş". Yanında gerçek ambalaj görselleri (183 sonrası siyah tenekeler dahil, mevcut v3 dekupe türevleri).
4. **Başvuru nasıl ilerler (gerçek sıra → numaralı 3 adım):** 1 "Formu doldurun" — "Firma ve bölge bilgilerinizi bize iletin." 2 "Size dönüş yapalım" — "Başvurunuzu inceledikten sonra sizinle iletişime geçeriz." 3 "Koşulları birlikte belirleyelim" — "Ürün, miktar ve sevkiyat planını birlikte netleştiririz."
5. **Başvuru formu (`#basvuru`):** Firma adı*, Yetkili adı soyadı*, Telefon* (mevcut ülke kodlu bileşen), E-posta*, İl* / İlçe* (mevcut aranabilir bileşen; il değişince ilçe temizlenir), İşletme türü* (Market, Şarküteri, Kuruyemiş / yöresel ürün, Toptancı / distribütör, Diğer), Satış noktası sayısı (1, 2–5, 6 ve üzeri; isteğe bağlı), Mesaj (isteğe bağlı, en çok 1000 karakter), KVKK onayı* (`/kvkk` bağlantılı). Görünür etiketler, alan yanında hata, şemayla doğrulama, 16 px+ yazı (iOS yakınlaştırma yok), dokunma ≥ 44 px.
   - Gönder düğmesi: "Başvuru E-postasını Hazırla". Doğrulama geçince başlığı "Bayilik başvurusu — <Firma>" olan, tüm alanları düzenli satırlarla içeren e-posta taslağı açılır.
   - Sonrasında form altında açıklama: "E-posta uygulamanızda başvuru taslağı açıldı. Gönder'e bastığınızda başvurunuz bize ulaşır." + "Metni kopyala" düğmesi ve `info@afina.com.tr` (e-posta uygulaması açılmazsa).
6. Alt bilgi ve menü 184 ile aynı; menüde "Bayilik" etkin.

## SEO
- `metadata`: başlık "Bayilik | AFİNA ZEYTİN", açıklama, canonical `/bayilik`; `sitemap.ts` girişi; BreadcrumbList JSON-LD; `llms.txt`'e bayilik satırı.

## Kabul kriterleri
- [ ] Unit: `/bayilik` render; H1 "Bayimiz Olun"; 3 kart; 3 adım; form alanları ve zorunluluklar.
- [ ] Unit: doğrulama (boş/yanlış e-posta/telefon, KVKK işaretsiz) hata mesajları alan yanında; geçerli girişte e-posta taslağı başlık ve gövdesi beklenen biçimde (özel karakterler kodlanmış).
- [ ] Unit: ana sayfa "Bayilik Başvurusu" ve menü "Bayilik" → `/bayilik`; sitemap ve metadata.
- [ ] Sayfada fiyat, indirim oranı, kâr marjı, bölge sözü, sertifika, "Türkiye geneli" yok.
- [ ] `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` yeşil.
- [ ] Tarayıcı doğrulaması Claude'da (390 / 768 / 1440).

## Yapılmaması gerekenler
- Sunucuya/DB'ye başvuru kaydı ekleme (Neon geçişinden sonra ayrı görev). E-posta servisi ekleme.
- Production yayını yapma. Commit + testler yeşilse `origin main` push (CI çalışır, yayın yapmaz).
- `docs/` değiştirme (yalnız Coder Notu/Durum).

## Durum: BEKLİYOR
