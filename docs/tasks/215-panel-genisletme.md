# 215 Yönetim paneli genişletme (/panel)

Kaynak: kullanıcı (21 Kas 2026): "indirim, ürünler, sipariş, müşteriler, ziyaretçiler (MLNEW gibi), leadler vs". Kararlar: indirim = **indirim KODU** (yüzde/TL, bitiş tarihi, kullanım limiti; sepette girilir); ziyaretçi = **çerezsiz sayaç** (IP/kişisel veri yok, çerez onayı gerekmez); sıra = **aşamalı**: (1) siparişler+müşteriler+leadler, (2) indirim kodları, (3) ziyaretçiler+panel özeti.
Referans (SALT OKUNUR): ~/PROJELER/MLNEW/app/admin/(panel)/{siparisler,leads,ziyaretciler,uyeler}, ARCHITECTURE.md.
Mevcut: /panel (Genel bakış), /panel/urunler; AdminShell (components/admin/AdminShell.tsx); requireAdmin; API /api/admin/products; D1 (db/d1/0001_init.sql: user, orders, order_items, customer_addresses, products...). Üretim D1: `afina-zeytin` (Cloudflare Acayip hesabı).

## Aşama 1 kapsamı
- Migration `db/d1/0002_panel.sql` (yalnız EK: yeni tablolar/indeksler, mevcut tabloyu bozma): `leads` (id, created_at, name, email, phone, message, source, status[new|contacted|closed], note).
- İletişim formu (lib/contact, app/api/...): gönderimi D1 `leads`'e yaz; SMTP varsa mail de gönder, yoksa form artık başarılı döner (lead kaydedildi). Doğrulama, hız sınırı, bot koruması aynen.
- Panel sayfaları (AdminShell menüsüne ekle, mevcut stile uy): `/panel/siparisler` (liste, filtre, detay, durum güncelleme), `/panel/musteriler` (user + adres + sipariş sayısı/toplam), `/panel/leadler` (liste, durum, not). Genel bakış: sayılar (ürün, sipariş, müşteri, yeni lead).
- API: `/api/admin/orders`, `/api/admin/customers`, `/api/admin/leads` (requireAdmin + mevcut origin/CSRF kuralları, sayfalama).
- Testler (birim + panel UI), lint, typecheck yeşil; 1475+ birim test bozulmaz.

## Aşama 2 (sonra): indirim kodları (fiyat hesabı dokunur, testle). Aşama 3: ziyaretçi sayacı + panel özeti grafikleri.

## Dokunulmaz
.env*, canlı Cloudflare/D1 (migration'ı AJAN uygulamaz, Claude uygular), git commit/push yok (Claude yapar), GitHub workflow ekleme YOK, ödeme/sepet/fiyat mantığı (Aşama 1'de), node_modules/.next silme, git stash/reset/clean.

## Aşama 2 kapsamı: indirim kodları (fiyat hesabına dokunur — kullanıcı onaylı)
- Migration `db/d1/0003_discounts.sql` (yalnız EK): `discount_codes` (id, code UNIQUE büyük harf, type[percent|fixed], value, min_subtotal, starts_at, ends_at, max_uses, used_count, active, created_at, note); `orders`'a ek sütun yok ise `order_discounts` (order_id, code, amount) tablosu. Para birimi/kuruş temsili mevcut siparişteki gibi (INTEGER kuruş ya da mevcut neyse aynen).
- Fiyat hesabı: mevcut sunucu tarafı toplam hesabına kod indirimi eklenir; indirim ASLA istemciden güvenilmez (sunucu kodu yeniden doğrular), toplam sıfırın altına inmez, kargo/KDV mantığı mevcut kuralla aynı kalır, kullanım sayacı sipariş oluşturma ile ATOMİK artar (D1 batch), limit/tarih/aktif/min tutar denetlenir, geçersiz kod için sade Türkçe hata. Aynı sipariş iki kez sayılmaz.
- Sepet/ödeme arayüzü: sepette "İndirim kodu" alanı (uygula/kaldır), indirim satırı toplamda; ödeme önizleme akışı bozulmaz.
- Panel: `/panel/indirimler` (liste, oluştur, düzenle, aç/kapat, kullanım sayısı), `/api/admin/discounts` (requireAdmin + origin). Menüde "İndirim kodları" artık planlı değil aktif.
- Testler: kod doğrulama (yüzde/sabit, tavan, min tutar, tarih, limit, pasif, büyük/küçük harf), toplam hesabı, atomik sayaç, yarış durumu (aynı son hak iki sipariş), admin API/UI, mevcut sepet/ödeme testleri yeşil kalır.
