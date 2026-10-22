# Task 127: Footer — boşlukları azalt, sıkı ve dengeli düzen (21st.dev)

## Tür
frontend

## Amaç
Kullanıcı (22 Eki, canlı footer ekran görüntüsüyle): "Boşluklarını azalt, güzel bir düzen kur." ve "21.dev'den faydalan."
123'teki footer çalışıyor (taşma yok, logolar okunur) ama dikeyde çok seyrek:
- link satırları arası ~54px, başlık–link arası ~48px;
- marka bloğu solda uzun, kolonlar sağda; ortada geniş boşluk;
- ödeme satırı ve alt satır arasında fazla dikey boşluk.
Kanıt: `~/PROJELER/AFINA-KAYNAK/araclar/log/z-123/footer-d1440.png`, `footer-iphone.png`.

## Kullanılacak araçlar
- **21st MCP zorunlu (kullanıcı açıkça istedi):** "footer" araması yap, **yoğun/kompakt** e-ticaret footer'larına bak (ör. 4 kolon tek satır + alt bar). En az 3 aday; seçilenin adı/ID'si Coder Notu'na. Projenin CSS Module + v4 token'larına uyarla, varsayılan bırakma.
- **Kullanıcı isteği (22 Eki), hepsini fiilen yükle:** `ui-ux-pro-max` (§5), `frontend-design`, `better-layout`, `shadcn-ui` (gerekirse). `responsiveness-check` Claude'da. Coder Notu'na "Skill / nerede kullanıldı" tablosu.
- `tdd-workflow`.

## İstenen
1. **Dikey ritim:** footer üst padding 56px, alt 24px. Kolon başlığı ile ilk link arası 14px; link satır aralığı 8–10px (link kendi `min-height: 32px` masaüstü, telefonda 44px dokunma alanı korunur ama görsel aralık sıkı: `padding-block` ile). Kolon başlığı 13px 600 büyük harf aralıklı.
2. **Yatay düzen (≥ 1024):** tek ızgara, 4 kolon: marka bloğu (1.4fr) + Alışveriş (1fr) + Yardım (1fr) + İletişim (1.2fr), `gap: 48px`. Marka bloğu: logo 56px yükseklik, slogan Fraunces 26–28px, açıklama 15px, topluluk satırı (küçük logo + metin) — aralarında 12–16px. Footer üst bölümünün toplam yüksekliği masaüstünde ≤ 260px.
3. **Ödeme satırı:** üst bölümden 32px sonra, dikey padding 16px; solda "Güvenli Ödeme" + PayTR, sağda Visa/Mastercard/troy (123 görünümü korunur).
4. **Alt satır:** ödeme satırından 16px sonra tek satır (masaüstü): solda unvan · VD · VKN, ortada KVKK / Mesafeli Satış / İade ve İptal, sağda © 2026 AFİNA ZEYTİN ve önizleme notu. 12–13px. Telefonda alt alta, aralık 8px.
5. **Tablet (768–1023):** marka bloğu üstte tam genişlik (logo + slogan yan yana olabilir), altında 3 kolon.
6. **Telefon (< 768):** marka bloğu sıkı (logo 48px, slogan 24px), kolonlar 2 sütun (Alışveriş | Yardım), İletişim tam genişlik; toplam footer yüksekliği 123'e göre en az %30 kısa. Telefondaki sabit "Sepete ekle" çubuğu footer'ın son satırlarını örtmez (121 kuralı).
7. 123'ün içeriği ve kuralları korunur: "Güvenli Ödeme", dört logo `alt` metni, topluluk linki `https://afina.com.tr` (`noopener`), tek önizleme notu, iletişim uydurma yok.

## Kabul kriterleri
- [ ] Unit: footer yapısı (4 kolon, ödeme satırı, alt satır) ve içerik 123 ile aynı; önizleme notu 1 kez.
- [ ] Unit/CSS: kolon başlığı–link ve link–link aralık token'ları yukarıdaki değerlerde.
- [ ] E2E (yaz, çalıştırma) `tests/e2e/footer-127.spec.ts`: 1440'ta footer üst bölüm yüksekliği ≤ 260px; 390'da footer toplam yüksekliği 123 ölçümünden en az %30 kısa (123 değeri: Claude ölçümü ~1990px iPhone 14 @3x ≈ 663 CSS px üst bölüm; Codex kendi build'inde önce/sonra ölçüp yazsın); 320–1920'de yatay taşma yok; telefonda dokunma hedefleri ≥ 44px.
- [ ] `npm test`, lint, typecheck, build yeşil; 118–126 testleri korunur.
- [ ] Tarayıcı doğrulaması Claude'da.

## Yapılmaması gerekenler
- İletişim/MERSİS/sosyal medya uydurma; newsletter ekleme.
- Ödeme mantığı; yeni logo.
- `docs/` değiştirme (yalnız Coder Notu/Durum).

## Coder Notu

### Uygulama ve 21st kaynağı

- 21st MCP `footer` araması çağrıldı; aşağıdaki üç adayın tam kaynak/component kodu `get_component` ile fiilen incelendi. Seçilen **Agency Footer — ShadcnSpace, demo 21474 / component 10510**. Marka + üç bağlantı/iletişim kolonu tek CSS Module ızgarasına alındı; örnek aralıklar v4 tokenlarına ve bu görevin ölçülerine uyarlandı.

| Aday | Demo / component ID | Değerlendirme |
|---|---|---|
| [Agency Footer — ShadcnSpace](https://21st.dev/@shadcnspace/components/footer-01) | 21474 / 10510 | Seçildi; marka ve üç bilgi kolonu mevcut içerikle uyumlu. Kaynaktaki boş kolon ve geniş dikey aralıklar kullanılmadı. |
| [Footer with Navigation Grid — shadcnui-blocks](https://21st.dev/@shadcnui-blocks/components/footer-01) | 28291 / 14678 | Izgara ve ayrı alt bar incelendi; altı link kolonu mevcut içerik için gereksiz. |
| [Footer — Méschac Irung](https://21st.dev/@meschacirung/components/footer) | 4711 / 3574 | Ortalanmış link satırı incelendi; dört kolon hiyerarşisine uymuyor. |

- Dış dikey padding 56/24px (alt güvenli alan korunur); başlık–liste 14px, masaüstü link arası 8px, hedef yüksekliği 32px. Telefon/tablet hedefleri en az 44px; telefonda ek liste boşluğu kaldırılıp padding hedefin içinde bırakıldı.
- ≥1024px tek ızgara: 1.4/1/1/1.2fr, 48px kolon arası. 768–1023px marka tam genişlik ve altında üç kolon. <768px marka logo/slogan yan yana; Alışveriş/Yardım iki sütun; İletişim tam genişlik, adres ve Tesisimiz bağlantısı aynı sırada.
- Marka içi 12px aralık, logo telefon/diğer 48/56px, Fraunces slogan 24/28px. Ödeme üst boşluğu 32px, dikey padding 16px; alt bilgi üst boşluğu 16px, telefon grupları 8px aralıklı.
- Satıcı unvanı/adresi/vergi bilgileri, bütün linkler, dört ödeme logosu ve alt metinleri, güvenli topluluk bağlantısı, tek önizleme notu aynen korundu. Yeni iletişim bilgisi, logo, bağımlılık veya animasyon eklenmedi; 121 mobil çubuk davranışı korundu.

### Skill / nerede kullanıldı

| Skill | Nerede kullanıldı |
|---|---|
| `ui-ux-pro-max` | SKILL.md, quick-reference §1–3 ve §5, pro-rules okundu; `touch target spacing compact --domain ux` ve `responsive grid overflow --stack nextjs` çalıştırıldı. Mobil hedefler, 768/1024 kırılımları ve taşma önlemleri. |
| `frontend-design` | Mevcut v4 koyu yüzey, Fraunces/Figtree ve altın odak rengi korundu; yeni görsel yön oluşturulmadan yoğunluk düzenlendi. |
| `better-layout` | Marka/link grupları ortak ızgara kenarlarına hizalandı; DOM ve görsel okuma sırası eşleştirildi, `minmax(0, …)` ile esnek kolonlar tanımlandı. |
| `shadcn-ui` | SKILL.md yüklendi, ihtiyaç değerlendirmesi yapıldı; mevcut sunucu footer'ı ve CSS Module yeterli olduğundan yeni primitive/CLI kurulumu gerekmedi. |
| `tdd-workflow` | Üç yeni yapı/CSS testiyle RED doğrulandı, uygulama sonrası GREEN ve tüm unit regresyonları çalıştırıldı. |
| 21st MCP | Üç adayın kaynak kodu incelendi; Agency Footer 21474 proje tokenlarına uyarlandı. |
| `responsiveness-check` | Görev gereği Claude doğrulayacak. |

### Komutla doğrulama

| Komut | Sonuç |
|---|---|
| `npm test -- tests/unit/footer-127.test.tsx --maxWorkers=2` | Uygulama öncesi RED: 3 beklenen hata (kolon/alt satır yapısı, aralık tokenları, responsive ızgara). Yerel RED kaydı 1884e62; uzak geçmişe alınmadan nihai commit'te birleştirildi. |
| `npm test -- tests/unit/footer-127.test.tsx tests/unit/footer-refresh.test.tsx tests/unit/faq-contact-footer.test.tsx --maxWorkers=2` | Uygulama sonrası GREEN: 23/23. |
| `npm test -- --maxWorkers=2` | Nihai GREEN: 35 dosya, 394/394 test. 118–126 regresyonları dahil. Eski footer ile tüm metin/link/görsellerin eşitliği ayrıca test edildi. |
| `npm run lint` | Geçti; uyarı yok. |
| `npm run typecheck` | Geçti; yeni e2e TypeScript'i dahil. |
| `npm run build` | Geçti; 18 + 112 görselin kaynak/onay/hash kontrolleri ve production derlemesi başarılı. |
| `git diff --check` | Geçti. |

### Claude doğrulayacak

- `tests/e2e/footer-127.spec.ts` yazıldı, **çalıştırılmadı**: 1440px üst bölüm ≤260px; 390px tam footer yüksekliğinde ≥%30 azalma; 320–1920px yatay taşma; mobil hedefler ≥44px; son satırların mobil satın alma çubuğunca örtülmemesi.
- Önce/sonra karşılaştırması için değişiklik öncesi (`247a01c`) gerçek footer HTML'i ve CSS'i `tests/e2e/fixtures/footer-123.html` / `footer-123.css` içine tarayıcı açmadan kaydedildi. Test eski footer'ı aynı build'in font/reset/tokenlarıyla izole iframe'de ölçer, yeni footer ile karşılaştırır ve `footer-123-vs-127-css-px` JSON ekine önce/sonra üst bölüm/toplam yüksekliklerini ve azalma oranını yazar.
- Görevdeki yaklaşık 663 CSS px bilgisi üst bölüm kırpımıdır; tam footer ölçümü olarak kullanılmadı. Bu oturumda tarayıcı çalıştırılmadığı için önce/sonra sayısal yükseklik veya %30 kabulü doğrulanmış sayılmaz; ölçümü Claude yapacak.
- Eski footer e2e beklentileri 768px tablet eşiğine ve masaüstü 32px/mobil 44px hedeflerine uyarlandı; içerik/logo/odak kontrolleri korundu. Playwright, Lighthouse, inspect, ekran görüntüsü ve kare şeridi çalıştırılmadı.
- AGENTS.md'nin tarayıcı kabulünü Claude'a bırakan kuralı gereğince unit/lint/typecheck/build yeşil olduğundan uygulama TAMAMLANDI olarak işaretlendi.

## Durum: TAMAMLANDI
