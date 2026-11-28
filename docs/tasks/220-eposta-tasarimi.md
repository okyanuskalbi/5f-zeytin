# Task 220: Giden e-postalara markalı HTML tasarımı

## Tür
fullstack (ZEYTİN + KURUMSAL)

## Amaç
Mevcut 5 e-postaya (ZEYTİN: doğrulama, şifre sıfırlama, giriş bağlantısı, yeni talep; KURUMSAL: web formu) markalı HTML eklemek. Düz metin sürümü korunur. Yeni e-posta türü yok.

## Yapılan
- ZEYTİN: `lib/mail/template.ts` (yeni), `lib/auth/email.ts`, `lib/mail/lead-notify.ts`, `lib/mail/send.ts`, `public/email/afina-zeytin-logo.png`.
- KURUMSAL: `lib/contact/mail-html.ts` (yeni), `lib/contact/smtp.server.ts`, `public/email/afina-topluluk-logo.png`, `scripts/check-assets.mjs` (yalnız bu PNG için boyut + hash'e bağlı kayıt, Task 078 örneği).
- Logolar başlık bileşeninin kullandığı dosyalardan üretildi (`afina-zeytin-yatay@3x.webp`, `afina-topluluk-yatay.svg`); başlık zemin rengine düzleştirilip kenar payı eklendi, yeniden çizilmedi.

## Kurallar
- Her değer ve bağlantı `escapeHtml`'den geçer; ziyaretçi değeri `href`/`style` içine girmez ve bağlantı yapılmaz. Satır sonu kaçıştan sonra `<br>` olur.
- Metin 20.000 karakterde kesilir (değişmedi). HTML kesilmez; 100.000 karakteri aşarsa hiç eklenmez.
- worker-mailer 1.3.1: text + html `multipart/alternative`, UTF-8 quoted-printable. Gerçek kütüphane, bellek içi sahte SMTP ile test edilir (`tests/unit/*mime-220.test.ts`); kütüphane değişikliği gerekmedi.

## Yayın notu
Logo `https://afinazeytin.com/email/...` ve `https://afina.com.tr/email/...` adreslerinden gelir; yayına alınmadan e-postada görünmez (alt metin görünür).

## Önizleme
`output/task220/` (5 HTML, 700 ve 360 px ekran görüntüleri, `ozet.png`); örnek veri sahtedir.

## Durum: TAMAMLANDI
28 Kasım 2026: kullanıcı onayladı. İki site yayında (ZEYTİN 31d1139, KURUMSAL 872a8ad), logolar 200. Doğrulama dışındaki 4 e-posta kullanıcının kutusuna deneme olarak gönderildi; gerçek posta programındaki görünüm teyidi bekleniyor. Deneme talep kaydı silindi.
