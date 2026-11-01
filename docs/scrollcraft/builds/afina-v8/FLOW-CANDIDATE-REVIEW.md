# Flow aday klip incelemesi — 1 Kasım2026

Üç dosya yerelde ffprobe, ffmpeg ve gerçek kareler üzerinden incelendi. **Hiçbiri kullanıcı tarafından kabul edilmiş/runtime için onaylanmış değildir; yayınlanmadı.** Canlı hero yalnız daha önce onaylanan A→B’yi kullanmaya devam eder. Ek üretim, ücretli tekrar, medya düzeltmesi veya runtime değişikliği yapılmadı.

## Teknik kayıt

Hepsi H.264/yuv420p,1280×720,24fps,192video karesi. Video8.000sn; MP4 kapsayıcı ve AAC ses8.042667sn. Renk etiketleri: space=smpte170m,transfer=iec61966-2-1,primaries=bt709. SDR’ye ikinci tone mapping uygulanmadı. AAC varlığı doğrulandı; ses içeriği dinlenmedi.

| Geçiş | Bayt | Video / kapsayıcı süresi | İnceleme durumu |
|---|---:|---|---|
| B-C | 4,042,969 | 8.00sn / 8.042667sn | candidate-review-only |
| C-D | 4,520,710 | 8.00sn / 8.042667sn | candidate-review-only |
| D-F | 4,522,406 | 8.00sn / 8.042667sn | rejected-for-publication |

## Gerçek görsel bulgular

**B→C — kullanıcı incelemesine hazır aday.** Dalın önüne iki el giriyor; tutuş ve zeytine temas, sepetin gelişi ve sakin hareket altı örnekte genel olarak tutarlı. Belirgin kopuk/ek el görülmedi. Bu, tüm192karede anatomi kusursuzluğu garantisi değildir.

**C→D — kullanıcı incelemesine hazır aday.** Eller/dal önden geçen yapraklarla örtülerek kadrajdan çıkıyor; kamera sağa ilerlerken taş zemin, kâse ve yağ akışı beliriyor. Doğrudan zeytin/el→yağ morphu örneklerde görülmedi. Son kâse/akış geometrisi tutarlı görünüyor. Mekân ve geçiş temposu gerçek oynatımla kullanıcı tarafından değerlendirilmelidir.

**D→F — bu hâliyle yayın için reddedildi.** Yaprak örtüsü sahne değişimini kısmen gizlese de4.79sn’de etiketsiz bir şişe açıkta;6.38sn’de etiket oluşmuş. Son7.96sn’de küçük ürün yazıları onaylıF referansındaki “NATÜREL SIZMA ZEYTİNYAĞI” ile birebir korunmuyor. Şişe/etiket görünümü geçiş sırasında yeniden kuruluyor. Son kompozisyonun referansa yaklaşması, ambalajın bütün klip boyunca değişmeden korunması şartını karşılamaz. Kullanıcıya sorun gösterilebilir; yayın veya yeni ücretli tekrar önerilmiş/onaylanmış sayılmaz.

## Kapsam ve uç kareler

Her klipten0/1.58/3.17/4.79/6.38/7.96sn olmak üzere6kare; toplam18kare ve üç3×2contact sheet incelendi. El teması için B→C4./5.kare, C→D2.kare; ambalaj için D→F4./5./6.kare ve özgün onaylıF ayrıca tam çözünürlükte açıldı. Tüm192karenin kesintisiz denetimi yapılmadı.

İlk/son referans kompozisyonları ve klip birleşimleri1280×720normalize SSIM ile ayrıca karşılaştırıldı. Bu sayılar küçük etiket yazısının doğru olduğunu veya uçların piksel piksel aynı olduğunu göstermez; özellikleD→F etiketi için görsel bulgu önceliklidir. Birleştirilmiş film hazırlanmadı.

- B-C: ilk SSIM0.813038; son SSIM0.822494.
- C-D: ilk SSIM0.821021; son SSIM0.859621.
- D-F: ilk SSIM0.858063; son SSIM0.965788.
- Birleşim B→C son / C→D ilk: SSIM0.965870; C→D son / D→F ilk: SSIM0.974913.

## SHA-256 ve özel yerel kanıt

- `B-C-omni-first-last.mp4`: `7bbc5e04f459932422b2ae505bf713c41bbbbbee58aec6c6d785937a434045a0`
- `C-D-omni-first-last.mp4`: `9ebfae531e048b1ff60c386a0b494c768701b9d9ce4f10db8fbfa684781312a6`
- `D-F-omni-first-last.mp4`: `750a57b22184c04e64ea48043d1f2b1b09a695eaf71255a128316c9a0bfb3887`

Makine kaydı `.cache/task160/flow-candidates.json`; gerçek adaylar yalnız ignore edilen `output/flow-keyframes/` altında. Contact sheet’ler `.cache/task160/flow-candidate-review/{B-C,C-D,D-F}-six-phases.jpg`; ambalaj karşılaştırması `D-F-frame-04.png`, `D-F-frame-06.png` ve `output/flow-keyframes/F-onayli-urun.webp`. Bu belge özel yerel varlıklara referans verir; aday MP4 veya kare dosyaları commit edilmez.
