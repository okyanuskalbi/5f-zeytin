# Düzeltme 198-1 (Codex): ui-ux-pro-max akışını tamamlama

> 198'i bitiren Codex oturumuna `resume --last` ile verilir. Dayanak: `docs/MASTER-PROMPT.md` v1.1 §8 (hazır Motion değerleri), §9 (21st erişimi), §12.1 (ui-ux-pro-max akışı), §12.2 (araç doğrulama).

## Neden
198 çalışması MASTER-PROMPT v1 ile başladı. Claude denetimi: tasarım sistemi projedeki **eski** `.codex/skills/ui-ux-pro-max` kopyasıyla üretildi (`--variance/--motion/--density` yok), alan aramaları, yığın rehberi ve teslim öncesi öncelik listesi eksik.

## Yapılacaklar
1. §12.2 araç doğrulamasını `output/task198-codex/PLAN.md` başına ekle.
2. §12.1 adım 2'yi **güncel** script ile yeniden çalıştır (`~/.codex/skills/ui-ux-pro-max/scripts/search.py … --variance 6 --motion 3 --density 4 --persist … --page home --page product`); 3. ve 4. adımdaki aramaları çalıştır. Ham çıktılar `output/task198-codex/sources/`.
3. Yeni çıktılarla `docs/DESIGN.md`'yi karşılaştır; benimsenen/reddedilen önerileri gerekçesiyle PLAN.md'ye yaz. Benimsenen değişiklikleri koda uygula (yalnız 198 kapsamı: tokenlar, menü, alt bilgi, ana sayfa, ürün sayfası).
4. Hareketleri §8 hazır değerlerine göre gözden geçir (blur girişi yok, hover/tap 400/25, whileInView margin −80px, AnimatePresence, `layout`).
5. §12.1 adım 5 öncelik listesini KANIT.md'ye madde madde ekle; ekran görüntülerini yenile.

## Kabul
lint, typecheck, test, build, `git diff --check` PASS; taşma/konsol/kırık görsel 0 (390 WebKit, 768, 1440, 1920). Tek ek kayıt: `fix: 198-1 ui-ux-pro-max akışı tamamlandı`. MASTER-PROMPT §15 kuralları geçerli.

## Durum: BEKLİYOR (Codex 198 bitince)
