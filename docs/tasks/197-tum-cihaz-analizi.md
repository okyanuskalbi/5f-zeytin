# 197 — Tüm aşamalar × tüm cihazlar sorun analizi (yalnız ANALİZ)

Kullanıcı: "tüm aşamaları tüm cihazlarda sorunları analiz et" → görev Kimi'ye.

## Kapsam
Canlı site: https://afinazeytin.com (commit 445cbe4, dpl_WLhfJxC1H27YhYi136d3FBk4nBKN).
Bu görev **yalnız analiz ve rapor**. Kod düzeltmesi YOK; düzeltmeleri sonra Codex yapacak.

## KESİN YASAKLAR
- Repo dosyalarını DEĞİŞTİRME (app/, components/, lib/, tests/, docs/ dahil). Commit yok, push yok, yayın yok.
- Formları GÖNDERME: kayıt, giriş, bayilik, toptan teklif, sipariş takip, ödeme. "Gönder / Kayıt ol / Giriş / Teklif iste / Öde" düğmelerine BASMA. Alan doldurup ekran görüntüsü alabilirsin, ama gönderme.
- Hesap açma, şifre girme yok. Canlı veritabanına, ortam değişkenlerine, `.env*` dosyalarına dokunma.
- `node_modules` ve `.next` silme. Siteye yük bindirme: aynı anda en çok 3 sayfa açık, istekler arasında kısa bekleme.

## Çalışma yeri
- Kendi scriptlerin: `AFINA-KAYNAK/araclar/197/` (git dışı).
- Çıktılar: `AFINA-KAYNAK/tasarim/uygulama-kontrol/197/` (ekran görüntüleri, rapor).
- Playwright repo'da kurulu (`node_modules/playwright`, tarayıcılar: chromium + webkit). Yeni paket kurma.

## Sayfalar (aşamalar)
Sitemap'ten (`/sitemap.xml`) tüm adresler + şunlar:
`/`, `/urunler`, `/urunler/<her kategori>`, `/urun/<her ürün>`, `/hakkimizda`, `/toptan-satis`, `/toptan-satis?teklif=<ürün>`, `/bayilik`, `/blog`, `/blog/<4 yazı>`, `/sepet` (boş + ürün eklenmiş), `/odeme`, `/giris`, `/kayit`, `/hesabim` (girişsiz yönlendirme), `/siparis-takip`, `/iade`, `/kvkk`, `/mesafeli-satis`, olmayan bir adres (404 sayfası).

## Akışlar (göndermeden)
1. Telefonda menü aç/kapat, menüdeki her bağlantı doğru sayfaya gidiyor mu.
2. Ana sayfa → kategori → ürün → sepete ekle → sepet → ödeme sayfası (ödeme düğmesine basma). Adet artır/azalt, ürünü sil.
3. Ana sayfa "Teklife ekle" → toptan satış formu ürünle dolu geliyor mu; alanlar doldurulabiliyor mu (gönderme).
4. Bayilik formu alanları, hata mesajları (yalnız alandan çıkınca görünenler; gönderme).
5. Giriş / kayıt sayfası görünüm, şifre göster/gizle, klavye ile gezinme.
6. Alt bilgi (footer) bağlantılarının hepsi 200 dönüyor mu; WhatsApp/telefon/e-posta bağlantıları doğru biçimde mi.

## Cihazlar
- Telefon: 320×568, 360×800, 375×667 (iPhone SE), 390×844 (iPhone 14, **webkit**), 414×896, 430×932 (**webkit**)
- Tablet: 768×1024, 820×1180 (iPad Air, **webkit**), 1024×768 yatay, 1024×1366
- Dizüstü/masaüstü: 1280×800, 1366×768, 1440×900, 1920×1080, 2560×1440
- Telefon ve tabletlerde dokunmatik (hasTouch, isMobile) açık olsun.
- Ek: 390 telefonda azaltılmış hareket (reduced motion) ve yavaş ağ (~1,6 Mbps, 150 ms) ile ana sayfa + ürün sayfası.

## Her sayfa × her cihazda ölç
- Yatay taşma / yana kaydırma (document.scrollWidth > innerWidth) ve taşan öğenin seçicisi.
- Kesilen ya da üst üste binen yazı, düğme içinde iki satıra kırılan/kesilen etiket, taşan kart.
- Dokunma hedefi < 44×44 px (telefon/tablet), yazı boyutu < 12 px.
- Kırık görsel (naturalWidth 0), 4xx/5xx kaynaklar, konsol hataları/uyarıları.
- Sabit üst menü içeriği örtüyor mu; çapa (#) bağlantıları başlığın altında kalıyor mu.
- Görsellerin oranı bozuk / bulanık / yanlış boyut seçilmiş mi.
- Video: oynuyor mu, doğru boyut geliyor mu (telefon 720, masaüstü 1920), azaltılmış harekette durağan mı.
- Klavye: Tab ile odak görünür mü, menü/pencere klavyeyle kapanıyor mu.
- Renk kontrastı (AA 4.5:1), eksik alt metin, başlık sırası.
- Hız (390 telefon + 1440 masaüstü, her ana sayfa türünden 1 örnek): LCP, CLS, toplam JS.
- Sayfa başlığı (title) ve açıklama (description) boş/tekrar mı.
- Türkçe karakter ve yazım hataları, aynı metnin sayfada gereksiz tekrarı.

## Görsel inceleme (önemli)
Sayıları ölçmek yetmez: her sayfanın her cihazdaki **tam sayfa ekran görüntüsünü kendin aç ve gözle incele** (boşluk dengesizliği, hizasız bloklar, çok büyük/küçük görsel, boş kalan alan, yarım görünen bölüm). Geç yüklenen görseller için önce sayfayı sonuna kadar yavaşça kaydır, sonra görüntü al.

## Teslim
`AFINA-KAYNAK/tasarim/uygulama-kontrol/197/RAPOR.md` (Türkçe, sade dil):
1. Özet: kaç sayfa × kaç cihaz denendi, kaç sorun (Kritik / Yüksek / Orta / Düşük).
2. Sorun tablosu: No, önem, sayfa, cihaz(lar), ne oluyor (bir cümle), ekran görüntüsü yolu, büyük olasılıkla hangi dosya (ör. `components/landing/CustomerHome.module.css`), önerilen düzeltme.
   Aynı sorun birden çok cihazda varsa tek satırda birleştir.
3. Sorunsuz geçen sayfa/cihazların listesi.
4. Ölçülemeyen ya da emin olunamayanlar (açıkça yaz; tahmini "sorun yok" diye yazma).
Ayrıca `rapor.json` (makinece okunur aynı liste) ve her sorunun ekran görüntüsü.

Bitince son satıra yaz: `KIMI-197 BİTTİ`.
