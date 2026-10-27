> ONAY VERİLDİ (kullanıcı, 28 Eki 2026): "gerekli işleri codex'e yaptır". Task 146'nın yayını kırması (Claude tespiti).

# Task 148: `npm ci` kilit dosyası uyumsuzluğu (yayın kırık)

## Tür
backend (CI)

## Amaç
146 sonrası tüm yayınlar düşüyor; canlı site 145'te kaldı. Kilit dosyasını `npm ci` ile uyumlu yap.

## Bağlam
- GitHub Actions "Test ve Vercel yayın", 4163bb0 ve c4c55c3: `npm ci` EUSAGE — `Missing: @emnapi/runtime@1.11.3 from lock file`, `Missing: @emnapi/core@1.11.3 from lock file` (CI npm 11.x).
- Aynı hata KURUMSAL'da 8f8dd15 ile çözüldü: yalnız eksik emnapi root/bundled kayıtları eklendi, package.json ve diğer sürümler değişmedi.

## Kullanılacak araçlar
- Skill: `ecc:github-ops`, `deployment-patterns`.

## Adımlar
1. Hatayı yerelde CI'daki npm sürümüyle yeniden üret (`npx -y npm@<CI sürümü> ci --dry-run --ignore-scripts`).
2. Yalnız eksik kilit kayıtlarını ekle (KURUMSAL 8f8dd15 yaklaşımı). package.json ve mevcut paket sürümleri değişmesin; büyük kilit yeniden üretimi yapma.
3. Push sonrası Actions çalışmasının yeşil bittiğini `gh run watch` ile doğrula; kırmızıysa düzelt.

## Kabul kriterleri
- [ ] CI npm sürümüyle `npm ci --dry-run` başarılı.
- [ ] `npm test`, lint, typecheck, build yeşil.
- [ ] Push sonrası "Test ve Vercel yayın" başarılı (run id Coder Notu'nda).

## Yapılmaması gerekenler
- Bağımlılık güncelleme/ekleme, workflow değişikliği (146 kalsın), uygulama kodu.

## Durum: BEKLİYOR
