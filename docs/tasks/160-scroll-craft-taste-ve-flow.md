# Task 160: Scroll Craft, Taste ve doğrudan Flow projesiyle tasarım düzeltmesi

## Kullanıcı isteği

Kullanıcı `nateherkai/scroll-craft` yeteneğini, `frontend-design`, `frontend-ui-engineering` ve `npx skills add Leonxlnx/taste-skill` ile tasarımı düzeltmemi istedi. Ayrıca verdiği Flow proje bağlantısının kullanılmadığını belirtti. Önceki yaratıcı devri ve “sormadan devam et” isteği geçerli; kararlar açıkça yazılarak ilerlenir. Yeni hareket API'leri `motion/react` üzerinden.

## Kaynak ve gerçek durum

- Scroll Craft 0.3.1 pin `75d81f74e83692add18cd7a8a8e078b8a887a579`, `.agents/skills/scroll-craft/` içinde eksiksiz proje yerel kuruldu. Taste 2.1.5 pin `12af471f627f866411b4bd785b19646d3672784c`, istenen CLI ile `.agents/skills/design-taste-frontend/` altına kuruldu. Lisanslar korunur; global skill/kayıt/ayar değiştirilmedi.
- Taste saf draw seed **1601101**, `--keep palette,type`: page-is-the-object seçildi. Düğün/davet/kâğıt çıktısı varsayımları gerçek tesis ve altı SKU ile uyumlu slotlara değiştirildi; yön yeniden çekilmedi. Kaynak sheet/copy deck/uyarlama `.cache/task-160/taste-direction/` altında.
- Doğru Flow projesi tarayıcıda doğrudan incelendi: `https://flow.google.com/project/62040049-3473-446b-9d93-8e6cbc45f8bc`. Bir kabul edilmiş A→B ve beş referans var. Yenileme sonrası da Google reCAPTCHA hizmet bağlantısı uyarısı sürüyor. B-dal ilk, C-hasat son kare ve mevcut istem yeniden yerleştirildi; C'nin eller/sepet içeren tam önizlemesi görüldü. Omni 1.1 Flash / Frames / 16:9 / 720p / 8 sn. / x1 için ekrandaki fiyat **12 kredi**. Yeni üretim gönderilmedi, ek harcama 0, önceki kalan 60 yetkisi değişmedi. Güvenlik engeli atlanmaz. UI kanıtları `.cache/task-160/flow-first-last-settings.png`, `flow-C-preview.png`.
- Önceki v7 `5a3b1f6` canlı ve kabulü Task 159'da tamam. Bu yeni görev kurulumla veya önceki film kabulüyle tamamlanmış sayılmaz.
- Scroll Craft tam kurulum: upstream 24 dosya / 389.541 bayt birebir; MIT LICENSE ve UPSTREAM.json ile 26 dosya / 394.961 bayt. Kaynak pin/hash envanteri `.agents/skills/scroll-craft/UPSTREAM.json`, kurulum/audit `.cache/task-160/scroll-craft-{install-manifest.json,audit.md}`. Upstream engine/scriptler değiştirilmedi veya runtime'a import edilmedi. İncelenmiş doctor `--probe` olmadan explicit proje workspace/paketli binary ile exit0; opsiyonel KIEkey/libwebpencoder eksik, mevcut onaylı medya/Sharp için blok değil; API veya tarayıcı başlatmadı.
- Taste ham draw/uyarlama artık durable: [TASTE-DIRECTION](../scrollcraft/builds/afina-v8/TASTE-DIRECTION.md), [üç seçenek](../scrollcraft/builds/afina-v8/taste-options.md), `taste-direction.json`, `taste-hero-selection.json`. Bunlar planlama kaynaklarıdır; native inspector/scenes veya canlı kabul sonucu değildir. Güvenli browser adapter provenansı `.cache/task-160/adapter-provenance.json`; yalnız cache kopyasının CDP launcher'ı uyarlanır, audit kuralları değiştirilmez.
- Aktif v7 DESIGN byte-identical [arşivlendi](../referans/DESIGN-v7-history-20261101.md); SHA/byte kanıtı `.cache/task-160/design-v7-archive.json`. V8 DESIGN/21st/AGENTS/PLAN/CODEX_HANDOVER ve dört proje türevi MD skill aktif yönü günceller; upstream Scroll Craft/Taste ve özgün kaynak MD talimatları değiştirilmez.


## Tasarım ve uygulama

Önce `docs/scrollcraft/builds/afina-v8/` içindeki yaratıcı brief, duygu eğrisi, tek zirve, özgün etkileşim, fingerprint, kaynaklı copy deck ve doğrulama planı hazırlanır. Dört frontend/tasarım yeteneği birlikte uygulanır. Motion yanına ikinci vanilla/GSAP/Lenis scroll motoru konmaz; üçüncü parti örnekler yetki değildir.

V8 gerçek nesneyi öne çıkarır: Flow arka düzlemi, AFİNA ambalajı ön düzlemi ve okunur kâğıt metin düzlemi farklı hareket eder; kısa desktop scroll sonunda ürün seçimine bağlanır. Aynı SKU'nun resmi/adı/fiyatı/stoku ve gerçek detay/sepet eylemi birlikte değişir. Telefonda küçük ekran için ayrı, pin'siz ilk kompozisyon. Dekoratif indeks, scroll oku, sürekli eyebrow, italic/renkli başlık vurgusu ve gereksiz ince çizgiler kaldırılır. Slogan, logo, müşteri paleti, yerel fontlar, kaynak ürün sırası ve servis mimarisi korunur.

Alt akış tekrarları azaltılır: kompakt kurumsal anlatım ve gerçek tesis kanıtı, altı SKU'nun gerçek galerisi, ihtiyaca göre B2B paneli ve açıkça kapalı gönderim servisinin erişilir ayrıntıları, gerçek adres/alışverişe dönen kapanış. Gerçek özellikler veya bağlı yollar görsel gerekçeyle kaybolmaz.

## Denetim ve sınırlar

RED/GREEN davranış testleri; unit/lint/typecheck/build ve medya kapıları. 21st kaynağı gerektiğinde search/get; yeni shadcn yalnız resmi CLI. Scroll Craft planı/durum örneklemesi/feel-check ve Taste lint/ölçüm/eleştiri döngüsü uygulanır. Vendored engine import edilmez. Native Taste browser helper kullanıcı Chrome'u/SIGKILL seçebildiği için yalnız `.cache/task-160/taste-safe` kopyasında tarayıcı açma/kapatma uyarlanır; audit mantığı değişmez, ham kaynak korunur. Paketli headless Chromium ≤2 worker, düzgün CDP/Browser.close veya SIGTERM; native pointer lock/capture yok. Uygulanmamış kontrol PASS sayılmaz.

Yerel ve canlı; 1440/1024/768/390/360×640/320, hero açılış/orta/çıkış, gerçek film ve ürün seçimi/kapalı form menü/sepet/üyelik, reduced-motion/saveData/hata/JavaScript kapalı, görüntü üstündeki kompozit kontrast ve taşma incelenir. Normal main push + CI SUCCESS + Vercel REST API ve canlı tekrar. Fiziksel telefon, gerçek ödeme/hesap/teklif gönderimi ve Google güvenlik doğrulaması ayrı kalır.

## Yerel ara kabul — nihai teslim değildir

- Tam unit ara kapısı **1200 PASS**, production build PASS: `.cache/task-160/unit.log`, `build.log`. Son SectionReveal/diğer düzeltmeler sonrası nihai tekrar, kapsamlı etkileşim/e2e ve canlı yayın ayrıca kaydedilir.
- İlk yerel 1440/768/390/320 px kaydında bölüm taşması/pageerror/başarısız kaynak/axe0; gerçek desktop düzlemleri 6 konumda farklı ilerler, telefon düzlemleri statik. Kanıt `.cache/task-160/local/results.json`. Bu rapor fiziksel cihaz/gerçek servis veya tüm e2e kabulü değildir.
- Ham Taste kaynak lint'i10 dosyada 0 FAIL / 0 WARN: `.cache/task-160/source-taste-lint-run.json`; suppression/appmode yok. Native **Scenes exit0**, desktop/phone/reduced sheetleri ve smoothness kaydı `.cache/task-160/after2/scenes.log`. Bu mekanik sonuç tek başına his/kompozisyon kabulü değildir.
- Native **inspector exit1**: `.cache/task-160/after2/inspect/report.json`. Son turda1 FAIL `eyebrow` şirket-topluluk bağını sonraki H2'ye, gerçek SKU ağırlıklarını fiyata ve form etiketini sonraki SSS'ye eşliyor; bu işlevsel etiketler sırf audit'i susturmak için silinmez.5 WARN: gerçek SSS ayırıcı, korunmuş marka kâğıdı, font-size sayısı, erişilir native yatay galeri,13 hareketli öğeyle still-page. Inspector0 iddiası yok; ham bulgular ve semantik gerekçeleri korunur. Önceki still-page problemi için SSR görünür/bir kez/reduced destekli SectionReveal eklendi; yeni tam kabul nihai görev kaydını bekler.
- Final-source contact sheet/his eğrisi/kompozit kontrast,360×640/1024 ve kapsamlı gerçek seçili ürün/detail/cart/B2B/menü/üyelik/tercih/e2e, yeni CI/VercelAPI/production tekrar **BEKLİYOR**. V8 fingerprint shipped satırı ve tamamlanma makbuzu henüz yok.

## Durum: UYGULANIYOR
