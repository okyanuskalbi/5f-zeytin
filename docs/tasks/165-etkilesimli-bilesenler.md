# Task165 — Kullanıcının seçtiği React bileşenleri

## Kapsam
V12 hareketli önizleme kullanıcı tarafından “güzel beyendim” ile kabul edildi.
Bu onay Task164 hareketli önizlemesine aittir; Task165'in son tarayıcı kabulü
ve yayını yerine geçmez. Kurgu korunarak kullanıcının paylaştığı Footer,
Nimbus LiquidNavbar, GlassIconReveal, PendantLampRail, üyelik kartı,
TrackingTimeline ve InteractiveCheckout bileşenleri yerelde entegre edildi.
Son kullanıcı isteğiyle Bazgold telefon/ülke ve aranabilir il/ilçe alanları da
uyarlandı. Yeni bir ana sayfa yönü veya görsel senaryo kurulmadı.
Next.js zaten React 19 + TypeScript + Tailwind 4 + shadcn yapılandırmasıdır.
UI yolu `components/ui`, genel stil `app/globals.css`, bileşen stilleri CSS
Modules. Yeni framework kurulumu veya tüm mimariyi değiştirmek gerekmez.

## Uygulama
- Footer: gerçek iletişim/yasal yollar, dört kolon, yerel tema tercihi,
  gönderim iddia etmeyen manuel e-posta taslağı. Doğrulanmamış sosyal link yok.
- Menü: kullanıcının Nimbus su shader'ı, gerçek href'ler, CSS fallback,
  klavye/azaltılmış hareket, görünürlük ve kaynak temizliği.
- Logo: kullanıcının glass reveal motoru gerçek AFİNA artwork'üyle; erişilebilir
  statik logo başlangıç/fallback, görünür alanda sonlu animasyon.
- Ürünler: PendantLampRail etkileşimi gerçek altı SKU'ya uyarlanır. Lamba,
  kablo, demo fiyat yok. Aynı sıralama, stok/fiyat otoritesi, detay/sepet/teklif.
- Üyelik: kartın katman, ışık ve odak tepkileri mevcut e-posta/şifre girişine
  uyarlanır; auth endpointleri, consent ve redirect sözleşmeleri korunur.
- Sepet: `interactive-checkout.tsx` hem `/sepet` hem drawer yüzeyine bağlıdır.
  Gerçek adet/silme, stok uzlaştırma, fiyat yenileme, toplam ve mobil ödeme
  alanları korunur. CartProvider ve sunucu fiyat/stok otoritesi sürer; örneğin
  kataloğu, para birimi veya ödeme başarı durumu kullanılmaz. Kupon/kargo/
  indirim ve ödeme hazır olma durumu mevcut gerçek sınırlarıyla gösterilir.
- Sipariş: `order-history.tsx`, `/hesabim/siparisler/[no]` hesap detayına ve
  mevcut DeliveryTimeline'a bağlandı. Saf durum adaptörü gerçek sipariş
  durumunu kullanır; yalnız kayıtlı tarihler `<time>` olur. Hesap API'si sadece
  oluşturma tarihi döndürdüğünden ödeme/kargo tarihleri türetilmez. Teslim
  tamamlanmış, iptal/iade son durumdur; bilinmeyen ara geçmiş uydurulmaz.
  Tek `aria-current`, görünür SSR içerik ve reduced-motion desteği vardır.
  Hesap detayının mevcut yetkili client-fetch yapısı korunur; JavaScript
  kapalı gerçek hesap verisi yükleme veya yeni kargo provider'ı eklenmedi.
- Telefon/adres: Bazgold salt okunur kaynaklarından ülke kodu araması,
  ülkeye göre telefon biçimleme/doğrulama ve aranabilir il/ilçe bileşenleri
  teklif formuna entegre edildi. İl değişince seçili ilçe temizlenir; il
  seçilmeden ilçe açılamaz. Klavye kullanımı, eski istek iptali, hata/yeniden
  deneme ve serbest metin devamı korunur. Yerel Türkiye verisi ve salt okunur
  `/api/address-options` ile `/api/phone-countries` kullanılır. Kaynak/SHA
  kaydı: `docs/referans/bazgold-contact-165.json`; Bazgold'a yazılmadı.
- Kart formu: tekrar kullanılabilir görsel bileşen ve yerel demo hazırlanır.
  Aktif PayTR iFrame içine özel kart inputları yerleştirilmez. Direkt API yetkisi
  doğrulanmadan gerçek kart bilgisi alan yeni checkout akışı etkinleştirilmez.

## PayTR incelemesi
1 Kasım 2026 resmî kaynak:
https://dev.paytr.com/direkt-api/direkt-api-1-adim
Direkt API mağaza yetkisi gerektirir; kart içeren form yalnız PayTR'a POST
edilmelidir. Kod tabanı `lib/payments/paytr.ts` ile iFrame token alıyor.
Gönderilen örnekte Luhn kontrolü aslında yok, geçmiş ay reddedilmiyor ve
demo alert'i kart verisini gösteriyor. Uyarlamada bunlar düzeltilir; örnek
çıktı/log/analytics/storage ve gerçek ödeme başarı iddiası eklenmez.

## Araçlar / kabul
Kullanıcı kaynakları bu konuşmadan `.cache/task-165/user-components` altına
birebir çıkarıldı. `ecc:frontend-patterns`, yerel Next CSS kılavuzu ve mevcut
shadcn primitives. shadcn için sadece resmi CLI. Provider değişikliği yok.
Anlamlı etkileşim/doğrulama testleri, lint/type/build; sadece headless Chromium
ve en fazla iki worker. Görsel kabul ve yayın ayrı kanıt gerektirir.

Son birleşik yerel kontroller tamamlandı:

| Kontrol | Sonuç | Kanıt |
|---|---|---|
| Tam unit paketi | 108 dosya / 1284 test PASS, exit 0 | `.cache/task-165/unit-final2.log` |
| Tam ESLint | PASS, exit 0 | `.cache/task-165/lint-final2.log` |
| `next typegen && tsc --noEmit` | PASS, exit 0 | `.cache/task-165/typecheck-final.log` |
| `ASSET_SKIP_REENCODE=1 npm run build -- --webpack` | PASS, exit 0 | `.cache/task-165/build-final2.log` |
| Yeniden derlenen önizlemenin statik kaynak taraması | 104 yerel varlık, 0 eksik, 0 dış ağ kaynağı | Yerel önizleme kontrolü; tarayıcı çalıştırılmadı |

Son tarayıcı/görsel kabulü ve uzak yayın kapıları açıktır. Statik kaynak
taraması render, etkileşim, axe, Lighthouse veya fiziksel cihaz kabulü değildir.
Önceki görevlerin PASS sayıları Task165 sonucu olarak taşınmadı. Footer
testleri e-posta taslağının gönderim, storage veya ağ yazımı yapmadığını;
timeline testleri durum/tarih ve mevcut hesap endpoint'i sözleşmesini doğrular.

shadcn resmi CLI `view` denendi; registry DNS erişimi kurulamadığında kurulu
`radix-ui` Switch ve mevcut Button/Input kullanıldı. Yeni shadcn MCP veya
global yapılandırma eklenmedi. Kullanıcı bileşenleri AFİNA tokenlarına uyarlandı.

## Yayın ve global skill
`main` ve Vercel REST API yayını kullanıcı tarafından yetkilendirildi.
Ancak bu sürüm henüz yayımlanmadı: Git uzak erişiminde DNS çözümlemesi
başarısız; GitHub API `create_blob` yazımı onay gerektiriyor ve oturumun
`approval_policy=never` kuralı bu onayı açmıyor. Uzak ref mutasyonu ve Vercel
dağıtımı yapılmadı. Kullanıcının yayın yetkisi sürer; bu teknik kapı yeni bir
kullanıcı yetki eksikliği olarak sunulmaz, onay sınırı dolanılmaz.

Emre Web Skill iki global ortam için paketlendi. Doğrulanmış arşiv
`.cache/task-164/emre-web-skill.zip`, validator/manifest
`.cache/task-164/emre-web-skill-package.json` içinde `package_valid: true`.
Global kurulum **tamamlanmadı**: otomatik onay incelemesi global içerik
yazımını “writing outside of the project; rejected by user approval settings”
gerekçesiyle reddetti. Başlatıcı iskeletlerinin bulunması tamamlanmış kurulum
sayılmaz. Paket hazırlığı, global kurulum ve site yayını ayrı teslimlerdir.

## Durum: YEREL KOD DOĞRULANDI — TARAYICI / YAYIN BEKLİYOR
