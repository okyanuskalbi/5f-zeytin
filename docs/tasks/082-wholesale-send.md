# Task 082: Toptan talep gönderim entegrasyonu

## Tür
fullstack

## Amaç
Toptan talep formunu onaylı sunucu e-posta adapterına bağla ve gerçek hata/başarı sınırını uygula.

## Bağlam
`docs/PLAN.md` ve resmi `docs/referans/icerik.md` içerik sözleşmesi. Bağımlı task’lar / addBlockedBy: 081 (wholesale-form); 051 (mail). Bağımlılıklar tamamlanmadan uygulanmaz.


## Kullanılacak araçlar
- ECC skill: backend-patterns, api-design, security-review, tdd-workflow
- 21st MCP: evet — proje tokenlarına uyarlanan form/sayfa düzeni
- find-skills ile bulunup kurulacak ek skill: yok; mevcut araçlar yeterli, yeni kurulum gerekirse Coder Notu’na yaz.

## Dokunulacak dosyalar
- `app/api/wholesale/route.ts` (oluştur / düzenle)
- `lib/wholesale/submit.ts` (oluştur / düzenle)
- `components/landing/WholesaleForm.tsx` (oluştur / düzenle)
- `app/page.tsx` (oluştur / düzenle)
- `tests/unit/wholesale-send.test.ts` (oluştur / düzenle)
- `tests/e2e/wholesale.spec.ts` (oluştur / düzenle)

## Adımlar
1. PLAN, AGENTS ve 051 onaylı e-posta adapterını oku. Alıcı, servis/gönderen ve KVKK içerikleri kullanıcı kararını bekler; hazır değillerse Coder Notu’na engeli yaz, kendin servis seçme.
2. Önce endpoint/sözleşme testlerini başarısız yaz; alan/uzunluk doğrulama, origin/CSRF ve rate limit, honeypot/tekrar gönderim kontrolü. Alıcı sunucuda sabit güvenli yapılandırmadan, key ve kişisel veri loga/istemciye girmez; HTML/XSS ve e-posta header injection engellenir.
3. Onaylı adapterla toptan talebi ilet; yeni tablo/ödeme/sipariş oluşturma. Yalnız servis gerçekten kabul edince başarılı yanıt; hata/servis eksikliğinde açık başarısızlık, sahte başarı yok.
4. 081 submit bağlantısını typed endpoint ile kur; pending, çift tıklama, hata/yeniden deneme ve başarı alanları. Testler mock kullanır; gerçek e-posta yalnız açıkça yetkili test alıcısıyla, ayrı kanıt olarak kaydedilir.
5. Testleri geçir ve lint/typecheck/build sonuçlarını Coder Notu’na yaz. Yerel/mock kabul ile gerçek gönderim kanıtını ayrı raporla.

## Kabul kriterleri
- [ ] `npm run test -- tests/unit/wholesale-send.test.ts` geçersiz istek/origin, header injection, rate limit, servis yokluğu ve servis hata/başarısını doğrular.
- [ ] `npm run test:e2e -- tests/e2e/wholesale.spec.ts` toptan CTA → form → mocked sunucu sonucu, çift gönderim ve tekrar denemeyi doğrular.
- [ ] `npm run lint && npm run typecheck && npm run build` başarılı; sırlar client bundle’a girmez ve yeni DB tablosu yok.

## Yapılmaması gerekenler
- Task dışına çıkma; diğer repolara ve salt okunur AFINA-KAYNAK klasörüne yazma.
- Resmi metinleri yeniden yazma, belgesiz iddia/ürün/fiyat/iletişim bilgisi üretme.
- Servis/hesap/kanal kararlarını kullanıcı yerine verme; gizli bilgi commit etme.

## Durum: BEKLİYOR
