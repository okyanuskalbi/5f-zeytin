# Task174 — frontend rehberleri ve mobil uygulama eşlemesi

2 Kasım 2026. Katalog ad/açıklama düzeyinde kategorilendi; aşağıdaki ilgili
SKILL.md gövdeleri okundu. “Tüm frontend skillleri uygulandı” iddiası yok.
21st MCP araştırması root tarafından yürütüldü. Gerçek medya, marka, altı SKU,
fiyat/stok, kimlik/ödeme ve manuel mailto sözleşmeleri korunur.

| Kategori | Okunan rehber | AFİNA mobil karşılığı |
| --- | --- | --- |
| Etkileşim ve yerleşim | `/Users/emre/.codex/skills/better-ui/SKILL.md`, `better-layout/SKILL.md` | İç içe yatay boşlukları azalt; tek dikey ürün listesi; görünür kapatma/tamamlama; klavyeye göre panel alanı; mevcut 44–48 px hedefleri koru. |
| Tipografi | `/Users/emre/.codex/skills/better-typography/SKILL.md` | Form girişleri zaten 16 px. Telefonda 11–12 px yardım/KVKK/iletişim metnini 13 px’e çıkar; numara için daha geniş alan ayır. |
| Renk | `/Users/emre/.codex/skills/better-colors/SKILL.md` | Mevcut zeytin/taş semantik tokenlarını koru. Kontrast hatası ekran ölçümü olmadan iddia edilmedi; yeni palet yok. |
| Görsel yön | `.agents/skills/design-taste-frontend/SKILL.md` | Telefonu ayrı kompozisyon olarak ele al; onaylı masaüstünü yeniden tasarlama. Skill’in genel estetik yasaları kullanıcıca onaylı marka kararlarını geçersiz kılmaz. |
| Erişilebilirlik | `/Users/emre/.codex/skills/better-accessibility/SKILL.md`, `/Users/emre/.codex/plugins/cache/ecc/ecc/2.2.3/skills/frontend-a11y/SKILL.md` | Radix odak/ESC/odak dönüşünü koru. Kompakt ülke etiketi tam erişilebilir adını kaybetmez; footer native details/summary ve SSR açık linkler; dokunma sürüklemeye bağımlı değil. |
| Hareket ve performans | `/Users/emre/.codex/skills/animate/SKILL.md`, `animation-performance/SKILL.md` | Yalnız telefon ürün panelinde kısa giriş; reduced-motion’da yok. Form giriş/etiket geometrisi kaydırma animasyonuyla hareket etmez. visualViewport dinleyicileri yalnız açık panelde ve cleanup ile. |
| React ve doğrulama | `.agents/skills/frontend-patterns/SKILL.md`, `.agents/skills/tdd-workflow/SKILL.md` | Yeni dependency/akış yok; kontrollü mevcut adetler korunur. Yeni davranışlar önce RED, sonra GREEN. Commit/checkpoint root yayın kapsamındadır. |
| Tarayıcı kabulü | `/Users/emre/.codex/skills/browser-qa/SKILL.md` | 320/360/390/430, yatay, tablet/desktop; gerçek klavye/odak/taşma/CTA/reduced/noJS karşılaştırması root tarafından. Alt ajan tarayıcı/sunucu başlatmadı; fiziksel cihaz kabulü iddiası yok. |

Katalogda ayrıca frontend-ui-engineering, frontend-design-direction,
design-system/ui-styling/shadcn-ui/ui-ux-pro-max; design-review/redesign;
responsiveness-check/break-ui/UX audit; motion/motion-framer/motion-primitives;
cinematic-scroll-storytelling/scroll-craft/scroll-scrubbed-word-reveal ve browser
devtools rehberleri bulundu. Task174 için yukarıdaki kurallar yeterli olduğundan
örtüşen rehberler, yeni medya üretimi ve GSAP/stack geçişi uygulanmadı.

## Koddan çıkan beş somut fırsat ve uygulama

1. Teklif section 16 px + composer 16 px iç boşluk, 320 px’te alanı daraltıyordu.
   Mobil composer 12 px; section üst/alt 28 px; alan aralığı 12 px. Şehir/ilçe
   360–600 px’te iki kolon, 320 px’te tek kolon. Giriş fontu 16 px kalır.
2. Telefon ülke düğmesi dar alanda tam ülke ismiyle numara alanını sıkıştırıyordu.
   Yalnız teklif formunda mobile `TR +90` görsel etiketi ve 112 px kod kolonu;
   aria-label tam ülke ismini, native select/form value gerçek ISO kodunu korur.
   Mevcut ülke/il/ilçe visualViewport konumlandırması ve normalizasyon değişmedi.
3. Ürün seçici merkezde, 12 px yan boşluklu modaldi. Telefonda alttan açılan tam
   genişlikte panel; header/footer sabit flex, liste kendi scroll alanında;
   klavye yüksekliği/offset’i visualViewport’tan, safe-area CSS ile hesaplanır.
   21st 31360 Drawer kaynak fikri `.cache/task-174/21st-31360.json` üzerinden
   mevcut Radix’e uyarlandı; Base UI/drag dependency eklenmedi, sahte drag handle yok.
4. Telefon yardımı, KVKK ve doğrudan iletişim metni mobile 11–12 px idi.
   Mobile 13 px oldu. Desktop tipografi/aralıklar korunur.
5. Footer alışveriş/yardım grupları mobile dar iki kolondaydı. Mobilde native
   açılır iki tam satır; gerçek linkler ve yasal/ödeme/iletişim aynı. Desktop
   aynı dört kolon, SSR/noJS gruplar açık. E-posta draft ve scoped tema değişmedi.

## Kanıt sınırı

`.cache/task-174/before/320-teklif.png` görseli incelendi; kaynak parent’ın
ölçümüdür. Yeni görünüm için tarayıcı sonucu bu rapora eklenmedi. Yerel TDD:
`quote-footer-red.log` yeni 4 davranışın beklenen eksiklikten RED sonucunu;
`quote-footer-green.log` son scoped regression sonucunu içerir. Runtime davranış
testleri görsel yerleşim/gerçek iOS klavye kabulünün yerine geçmez.
