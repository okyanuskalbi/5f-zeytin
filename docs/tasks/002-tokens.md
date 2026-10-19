# Task 002: Marka token ve UI temeli

## Tür
frontend

## Amaç
AFİNA marka token ve temel UI sistemini kur.

## Bağlam
`docs/PLAN.md`: Hedef, Teknoloji, Mimari kararlar ve ilgili kapsam bölümü. Bağımlı task’lar / addBlockedBy: 001 (bootstrap). Komutlar 001 görevinde kurulacak araçlara dayanır; bağımlılıklar tamamlanmadan bu task çalıştırılmaz.

## Kullanılacak araçlar
- ECC skill: design-system, frontend-design-direction, frontend-patterns
- 21st MCP: evet — tema ve temel button/dialog referansları
- find-skills ile bulunup kurulacak ek skill: yok; yeni ihtiyaç varsa önce `npx skills find <konu>`, kurulan skill Coder Notu’na yazılır.

## Dokunulacak dosyalar
- `app/globals.css` (oluştur / düzenle)
- `components/ui/button.tsx` (oluştur / düzenle)
- `components/ui/dialog.tsx` (oluştur / düzenle)
- `components.json` (oluştur / düzenle)
- `tests/e2e/tokens.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve bağımlı task’ları oku; gereken kullanıcı kararları/onayları yoksa başlamadan Coder Notu’na engeli kaydet.
2. #243A29 / #F5F1E7 / #D4B483, okunaklı tipografi, odak/hover/disabled durumları; shadcn resmi CLI ile incele ve ekle, 21st yönünü tokenlara uyarla. Altın renk metinlerde kontrastla doğrulansın.
3. Uygulama görevinde ilgili davranış testini önce başarısız çalıştır, uygula ve geçir. Görsel görevinde model/kaynak/çıktı doğrulaması yap; key ve kişisel veri kaydetme.
4. Kabul komutlarını çalıştır, çıktıyı ve varsa kullanıcı onay kaydını Coder Notu’na ekle; yalnız bu task kapsamını commit et.

## Kabul kriterleri
- [ ] `npm run test:e2e -- tests/e2e/tokens.spec.ts` başarılı; aşağıdaki davranışın normal, hata ve reduced-motion/klavye senaryoları doğrulanır.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı.

## Yapılmaması gerekenler
- Task dışına çıkma, ek iyileştirme yapma; diğer repolara yazma.
- Kullanıcı yerine açık karar verme; gizli bilgi commit etme; onaysız görseli yayınlama.
- Gerçek ödeme, üretim DB değişikliği, canlı e-posta veya domain mutasyonu için bu taslağı tek başına yetki sayma.

## Coder Notu

- Bağımlı 001 görevi `TAMAMLANDI`; bu task için eksik kullanıcı kararı veya onay kapısı yok. `design-system`, `frontend-design-direction`, `frontend-patterns` skill'leri uygulandı; ek skill kurulmadı.
- 21st MCP ile [Green Notes teması](https://21st.dev/community/themes/green-notes-1783614187319), [Shugar Button](https://21st.dev/@shugar/components/button-1) (3824) ve [Origin UI Dialog](https://21st.dev/@originui/components/dialog) (370) incelendi. Sıcak yüzey/yeşil, eylem hiyerarşisi ve kaydırılabilir dialog referansları AFİNA tokenlarına uyarlandı.
- Resmi shadcn CLI **4.22.1** ile `npx shadcn@latest docs button dialog`, `npx shadcn@latest view @shadcn/button @shadcn/dialog` ve `npx shadcn@latest add button dialog --yes` çalıştırıldı. `components.json` Tailwind 4/CSS variable/RSC ayarlarını içerir. CLI'nin ürettiği bileşenler marka renkleri, 44px asgari dokunma alanı, uzun etiketlerin satır kırması, görünür odak, hover/disabled/hata durumları ve Türkçe kapatma metniyle özelleştirildi. Dialog, Radix'in odak tuzağı/geri dönüş ve ekran okuyucudan arka planı gizleme davranışını korur; dar/kısa ekranda kaydırılabilir.
- `app/globals.css`: #243A29 / #F5F1E7 / #D4B483, shadcn semantik renkleri ve Tailwind eşlemeleri; yerel Georgia başlık + Helvetica Neue/Arial gövde, 16px/1.6 gövde tipografisi. Renk geçişi `prefers-reduced-motion` altında sıfırlanır; dialog açılış/kapanışında animasyon eklenmedi.
- WCAG sRGB kontrast hesabı: fildişi/zeytin **10,87:1**, marka altını/zeytin **6,22:1**. Marka altını/fildişi **1,75:1** olduğu için açık zemindeki altın tonlu metne `--gold-ink: #78603C` (**5,26:1**) ayrıldı. Tarayıcı testi normal/hover metinleri, altın eşleşmeleri ve hata metninde en az **4,5:1** doğrular.
- Zorunlu destek değişiklikleri: `package.json` / lockfile içinde `class-variance-authority@0.7.1`, `cn@0.5.0`, `lucide-react@1.59.0`, `radix-ui@1.8.1` sabitlendi; mevcut paket sürümleri değiştirilmedi. Gerçek bileşenleri ve üretim CSS'ini derleyen `tests/e2e/fixtures/tokens.html` / `tokens.tsx` eklendi. Fixture yalnız Playwright route interception ile bellekte sunulur; yeni uygulama rotası veya ek yerel sunucu açılmaz. Uzak `PLAYWRIGHT_BASE_URL` verilirse bu yerel bileşen testi açıkça hata verir; uzak hedef doğrulaması gibi raporlanmaz.

### Komutla doğrulama — 19 Ekim 2026

- RED: `npm run test:e2e -- tests/e2e/tokens.spec.ts --project=chromium-320` → **exit 1**, henüz bulunmayan `components/ui/button` ve `components/ui/dialog` importları nedeniyle beklenen başarısızlık.
- GREEN / nihai kabul: `npm run lint && npm run typecheck && npm run build && npm run test:e2e -- tests/e2e/tokens.spec.ts` → **exit 0; 12/12 başarılı (13,8 saniye)**. Chromium / Firefox / WebKit × 320 / 390 / 768 / 1440. Normal tıklama, disabled engeli, hover/kontrast, hata ve klavye ile tekrar deneme, odak görünürlüğü, dialog erişilebilir adı/açıklaması, odak tuzağı, Escape/kapatma, odak geri dönüşü, taşma kontrolü ve iki hareket tercihi doğrulandı.
- Tarayıcı önbelleği için `export PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/ms-playwright"` kullanıldı. macOS sandboxının `MachPortRendezvousServer: Permission denied` hatası gerekli süreç izniyle aynı test çalıştırılarak çözüldü. npm önbelleği repo içindeki `.cache/npm` altında tutuldu.
- WebKit/macOS varsayılanında sayfa içi kontroller arasında [Apple'ın belgelediği Option-Tab](https://support.apple.com/guide/safari/keyboard-shortcuts-and-gestures-cpsh003/mac) kullanıldı; diğer tarayıcılarda Tab, dialog içinde Tab/Shift-Tab kullanıldı. Ara koşumlardaki tarayıcı odak varsayımları düzeltildi; nihai koşumda atlanan veya flaky test yok.
- `npm run test -- tests/unit/bootstrap.test.ts` → **exit 0, 7 test başarılı**. `test-results/results.json` Node assertion'ları: **localhost:3004**, 12 proje, **12 başarılı / 0 başarısız / 0 atlanan / 0 flaky** ve 12 doğru `target-host` kaydı.
- 320/390/768/1440 ekran kanıtları ve yerel rapor `.cache/tokens-evidence/` altında; 320 normal/dialog, 390 hata, 768 ve 1440 dialog ekranları görsel olarak incelendi. `node .cache/tokens-evidence/check-evidence.cjs .cache/tokens-evidence/report.json` → **exit 0**. Skill checker'ı, projenin ESM ayarı nedeniyle içeriği değiştirilmeden `.cjs` uzantısıyla yerel önbelleğe kopyalanarak çalıştırıldı. `git diff --check` başarılı.
- Kabul kriterlerinin ikisi de karşılandı; kalan engel yok. PLAN, diğer task'lar, `_legacy/`, özgün promptlar ve servis/DB/ödeme ayarları değiştirilmedi. Kanıtlar yerel uygulama ve yerel bileşen fixture'ı içindir.

## Durum: TAMAMLANDI
