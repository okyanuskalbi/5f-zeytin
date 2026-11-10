# Task 200: Yönetim paneli görünümü

## Tür
frontend

## Bağımlılık
199 bitmiş olmalı.

## Amaç
`/admin` ve `/admin/urunler` görünümünü yenilemek. Referans: `~/Desktop/WB AI PROJELER ICIN/Admin paneli .JPG` (açık zemin, solda gruplu ikonlu menü, üstte arama, sade özet kartları, düzgün tablo). Referansın marka/metinlerini alma; AFİNA tokenları (`docs/DESIGN.md`) ile uyarla.

## Kullanılacak araçlar
`shadcn-ui` (resmî CLI: sidebar, table, card, dialog, input; varsayılan halde bırakma), 21st MCP, `ui-ux-pro-max`. İki seçenekli ayarlar açılır liste değil yan yana anahtar (toggle-group).

## Adımlar
1. Yerleşim: sol menü (Panel, Ürünler; ileride Siparişler/Müşteriler için yer, çalışmayan sayfa bağlantısı koyma), üst çubuk, içerik alanı. Telefonda menü çekmece.
2. Ürün listesi tablo + düzenleme penceresi aynı API ile; yalnız görünüm değişir.
3. Panel metinleri kısa (uzun açıklama yok).

## Kabul kriterleri
- [ ] lint, typecheck, test, build PASS; yerel test DB'si ile admin girişli ekran görüntüleri 390/1440 `output/task200/`.
- [ ] Girişsiz `/admin` hâlâ 401; API ve yetki mantığı değişmedi (diff'te `lib/auth`, `app/api/admin` yok).

## Yapılmaması gerekenler
Auth/yetki/DB değişikliği, push/yayın, `.env*`, `node_modules`/`.next` silme.

## Durum: BEKLİYOR (199 sonrası)
