# Task 169: Dizüstü ekranında ürün scroll akışını geri getirme

## Kullanıcı isteği
Ürün galerisi dikey kaydırıldığında yeniden yatay ilerlemeli. Aynı oturumda
giriş penceresinin eski göründüğü bildirildi; Task168 canlı doğrulaması da yapılır.

## Kök neden ve kapsam
Galeri 860px yükseklik şartı nedeniyle 1366×768 gibi masaüstü ekranlarında
native yatay raya dönüyor. Eşik tek başına düşürülürse sabit görsel yüksekliği
alt eylemleri keser. Masaüstü sahne kalan yüksekliği görsele ayıracak şekilde
uyarlanır; mevcut Framer scroll→x eşlemesi korunur.

- 1024px genişlik, 680px yükseklik ve fine/hover girdide scroll akışı.
- Küçük ekran, çok kısa pencere ve reduced-motion durumunda doğal yatay ray.
- Altı gerçek ürün, fiyatlar, sipariş/teklif işlemleri ve ray kontrolleri korunur.
- Yeni bağımlılık, görsel, sağlayıcı veya veri değişikliği yok.

## Araçlar ve kabul
Mevcut frontend-patterns/tdd-workflow; davranış regresyon testi, lint,
typecheck, unit ve build. Tarayıcı yalnız headless/paketli Chromium, ≤2 worker.
Main push yetkili; yayın doğrudan Vercel REST API, Actions yalnız doğrulama.

## Doğrulama
- Önce 1366×768, 1366×700, 1024×680 vakaları RED: eski kod native döndürdü.
- Düzeltmeden sonra 9 viewport/tercih vakası ve gerçek rayın son SKU'ya
  klavye odağı GREEN. İlgili 3 test dosyasında19 test geçti.
- 109 dosyada1300 unit, tam lint/typecheck ve webpack production build PASS.
- Sabit görsel yüksekliği grid/flex ile kaldırıldı; başlık/fiyat/44px eylemler
  küçülmez. Kısa masaüstüne yanlış telefon CSS'i uygulanması ve kartın32px
  aşağı kayarak alt eylemleri kesmesi giderildi.
- Kaynak/CSS bağımsız incelemesi geçti. Yeni headless e2e senaryosu dört
  masaüstü ölçüsünde ileri/geri scroll, son ürün, CTA sığması, bölümden çıkış,
  mobil ve reduced-motion kontrolünü kapsar; çalıştırılmış kabul değildir.
- Paketli headless Chromium üç denemede başlatılamadı. Yeni galeri için
  görsel/etkileşimli tarayıcı kabulü yapılmadı; fiziksel cihaz kabulü yok.
- Giriş sayfası ve ana sayfa üyelik modalinin Task168 düzeni canlıda taze
  uzak DOM kontrolüyle ayrıca doğrulandı; eski açık kullanıcı sekmesi incelenmedi.

## Durum: KOD DOĞRULANDI; GALERİ YAYINI VE GÖRSEL KABUL BEKLİYOR
