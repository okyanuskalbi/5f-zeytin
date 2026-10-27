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

## Coder Notu

28 Ekim 2026:

- `ecc:github-ops` ve yerel ECC `deployment-patterns` skill'leri kullanıldı. `gh run view 40591082100 --log` ile başarısız yayının Node `24.22.1` / npm `11.19.1` kullandığı doğrulandı; yerel ortam Node `24.11.1` / npm `11.6.2`.
- **RED:** `npx -y npm@11.19.1 ci --dry-run --ignore-scripts --no-audit --no-fund` exit 1; CI ile aynı `EUSAGE`, `Missing: @emnapi/runtime@1.11.3` ve `Missing: @emnapi/core@1.11.3` hataları yerelde yeniden üretildi. npm indirme/çalıştırma önbelleği yalnız gitignore kapsamındaki `.cache/npm-task-148` altında tutuldu (`npm_config_cache`).
- Yalnız dört eksik lockfile kaydı eklendi: root `@emnapi/core` ve `@emnapi/runtime` `1.11.3`; `@tailwindcss/oxide-wasm32-wasi` içindeki bundled core/runtime `1.11.1`. KURUMSAL `8f8dd15` yalnız okunarak referans alındı; diğer repoya yazılmadı.
- Node `assert` kontrolü: eklenen dört kayıt referans commit ile birebir aynı; mevcut **648 paket kaydının tamamı**, lockfile üst bilgileri ve `package.json` birebir korundu. Büyük lockfile üretimi yapılmadı; diff yalnız **44 ek satır**. Workflow (Task 146), uygulama kodu ve bağımlılık tanımları değişmedi.

| Komut / kontrol | Sonuç |
|---|---|
| `npx -y npm@11.19.1 ci --dry-run --ignore-scripts --no-audit --no-fund` (düzeltme sonrası, aynı yerel önbellekle) | **GREEN**, exit 0. |
| `npm test -- --maxWorkers=2 --testTimeout=30000 --reporter=dot` | **PASS:** 72 dosya, **1104/1104** test. |
| `npm run lint` | **PASS**, sıfır uyarı. |
| `npm run typecheck` | **PASS**. |
| `NEXT_TELEMETRY_DISABLED=1 npm run build` | **PASS**; prebuild kontrolleri: 18 görsel, 112 v3 çıktı, 20 hero katman çıktısı. Mevcut yerel Supabase URL/CSP uyarısı derlemeyi engellemedi; kapsam gereği değiştirilmedi. |
| `git diff --check` | **PASS**. |

- Tarayıcı testleri AGENTS.md gereği çalıştırılmadı; **Claude doğrulayacak**. Tarayıcı veya Next sunucusu açılmadı.
- Actions yayın kabulü ilk push sonrası doğrulanacak; run id ve sonuç bu nota eklenecek. Yerel kontroller yeşil; durum yalnız bu uzak kabul tamamlanana kadar BEKLİYOR. RED/ara commit push edilmedi.

## Durum: BEKLİYOR
