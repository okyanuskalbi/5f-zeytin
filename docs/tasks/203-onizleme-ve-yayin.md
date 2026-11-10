# Task 203: Önizleme paketi (yayın Claude'da, kullanıcı onayıyla)

> `docs/MASTER-PROMPT.md` **A8** aşaması.

## Tür
sunum (Codex)

## Bağımlılık
202 K3 geçti (Kritik/Yüksek bulgu 0).

## Codex üretir
1. `AFINA-KAYNAK/tasarim/uygulama-kontrol/AFINA-onyuz-v2-onizleme.pdf`: kapak + her sayfanın 1440 ve 390 ekran görüntüsü (yan yana), sayfa başına 1–2 satır sade Türkçe açıklama, son sayfada "ne değişti / ne aynı kaldı" listesi. Teknik terim yok.
2. `AFINA-KAYNAK/tasarim/uygulama-kontrol/AFINA-onyuz-v2-gezinti.mp4`: ana sayfa → ürün → sepet → ödeme sayfası akışı, 1440 ve 390 (iki ayrı bölüm), doğal hızda kaydırma, ≤ 60 sn, sessiz.
3. `output/task203/KANIT.md`: kullanılan sunucu, commit, sayfa listesi.

## Claude yürütür (kullanıcı K4 onayından sonra)
push → CI (`vercel-yayin.yml`) yeşil → yeni klasörde `deploy.py prepare/preflight/upload/create/status` → canlı kontrol (sayfalar 200, /admin + /api/account 401, video, hız) → geri dönüş sürümü notu.

## Yapılmaması gerekenler
Codex: push/yayın/Vercel yok; kod değişikliği yok (bulgu görürse Coder Notu'na yazar). MASTER-PROMPT §15.

## Durum: BEKLİYOR (202 sonrası)
