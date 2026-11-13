# 212 Açılış başlığı: telefonda hafif perde

Kaynak: kullanıcı kararı (13 Kas): "hafif perde yap". Görev 210 raporunda (F2) 360–430 px telefonlarda açılış videosunun bazı karelerinde başlığın açık dallara denk gelip zor okunduğu ölçülmüştü (en düşük harf içi karşıtlık: 360 px 1,58:1, 390 px 1,67:1). 320 px'te güçlü perde uygulanmıştı; kullanıcı daha geniş telefonlar için **hafif** perdeyi onayladı (güçlü perde onaylanmadı: video düz yeşile dönüyor). Önizleme: `output/task212/perde-onizleme.png` (ortadaki satır).

Çalışma kopyası = yerel main `4408765` (209, 210, 211 canlıda). Yazar: Codex. Dar bir CSS görevidir; kapsam dışına çıkma.

## Yapılacak
`components/storefront/StoreHome.module.css` içinde, **yalnız 360–767 px genişlikte** (`@media (min-width: 360px) and (max-width: 767px)`) açılış karartmasına (`.heroShade`) şu katmanı ekle (mevcut iki katmanın ÜSTÜNE, onları kaldırmadan):

`linear-gradient(to top, rgba(26, 43, 30, .5) 0%, rgba(26, 43, 30, .42) 45%, rgba(26, 43, 30, 0) 72%)`

Mevcut katmanlar (radyal + `to top .78 → 0 / 48%`) aynen kalır. Katmanı çoğaltmadan eklemek için `.heroShade::after` (aynı `inset: 0`, `pointer-events: none`) ya da çok katmanlı `background` kullanabilirsin; sonuç, önizleme görüntüsündeki "Hafif perde" satırıyla aynı görünmeli. Renk yeni değil (mevcut `rgba(26, 43, 30, …)`), yeni değişken/bileşen yok, uzun tire yok.

- **≤ 359 px**: mevcut güçlü perde aynen kalır (360'tan düşük genişlikte değişiklik yok).
- **≥ 768 px** (tablet, masaüstü): hiçbir değişiklik yok (piksel piksel aynı).
- Hero'nun başka hiçbir özelliği (yazı, düğme, boşluk, video, poster) değişmez.

## Dokunulmaz
- `lib/auth`, `lib/db`, `lib/cart`, `lib/checkout`, `lib/payments`, `lib/orders`, `app/api`: fark 0. Form, fiyat, sepet, ödeme mantığı değişmez.
- `.env*` okuma yok; sır yazdırma yok; `AFINA-KAYNAK/` ve `output/` git'e eklenmez (`git add -f` yasak); `node_modules` ve `.next` silinmez; `git stash/reset/clean` yok; port 3497'ye dokunma. **Commit yok, push yok, yayın yok.** Alt ajan yok. PDF/video yok.
- Daha güçlü bir perde, başka açı, başka dosya: YOK. Ölçüm hâlâ 3:1'in altında kalırsa ayarı değiştirme; sayıları raporla (karar kullanıcıda).

## Doğrulama
1. **Önce** (kodu değiştirmeden): `scripts/qa-findings-210.mjs`'teki kontrast yöntemini (gerçek 17,16 sn videoda 14 zaman, 5,5. sn dahil; `currentTime` ayarla, `seeked` sonrası görüntü, harf iç pikselleri) 360×740, 390×844, 412×915, 430×932 görünümlerinde çalıştır → "önce" tablosu (en düşük karşıtlık, 3:1 altı ve 4,5:1 altı kare sayısı). Ön izleme eskiyse önce `npm run build` ve sunucuyu yeniden başlat.
2. Değişikliği yap; `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` (hepsi `TEST_DATABASE_URL=postgresql://localhost:5432/afina_kontrol189 node output/task201/run-clean.mjs <komut>` ile); ön izlemeyi yeniden başlat (önce `output/task206/stop.sh`; sonra `TEST_DATABASE_URL=postgresql://localhost:5432/afina_kontrol189 node output/task201/run-clean.mjs --local-auth node output/task206/serve.mjs`, https://localhost:3024).
3. **Sonra**: aynı kontrast ölçümü (aynı dört görünüm) → "önce → sonra" tablosu; ayrıca 320×568 (değişmemeli: 7,37:1 civarı) ve 1440×900 (değişmemeli).
4. **Değişmedi kanıtı** (piksel karşılaştırma, `scripts/qa-compare-210.mjs`/`qa-shots-210.mjs` yöntemi): 320, 768, 1024, 1440 px'te ana sayfa (azaltılmış hareket/duran görüntü) **0 piksel fark**; 360/390/430 px'te hero dışındaki her bölüm **0 piksel fark** (hero'yu hesap dışı bırakarak ya da bölüm bölüm).
5. Hero ile ilgili birim ve e2e testleri (varsa `grep -ril hero tests/`): önceki sonuca göre **yeni düşen 0**.
6. Rapor: `output/task212/KANIT.md` (sade Türkçe): önce → sonra tablosu, görüntüler (`output/task212/sonra/`, 360/390/430 için en zor 3 kare), komutlar ve sonuçları, çalıştırılamayanlar. Bu dosyanın sonunu `## Durum: TAMAMLANDI` yap.

## Teslim
Son mesajın sade Türkçe özet (jargonsuz): ne değişti, ölçüler önce → sonra, değişmedi kanıtı, açık sorular.

## Durum: TAMAMLANDI
