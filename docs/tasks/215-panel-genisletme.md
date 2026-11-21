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
